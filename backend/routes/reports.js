const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { generateIQAnalysis, generateCareerAnalysis } = require('../services/openai');
const { generateReportPDF } = require('../services/pdf');
const { sendReportEmail } = require('../services/email');
const path = require('path');
const router = express.Router();

// Generate report
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { attemptId, reportType } = req.body; // reportType: 'free' or 'paid'

    // Get attempt details
    const [attempts] = await db.query(
      `SELECT uta.*, t.test_type, t.title, u.name, u.email
       FROM user_test_attempts uta
       JOIN tests t ON uta.test_id = t.id
       JOIN users u ON uta.user_id = u.id
       WHERE uta.id = ? AND uta.user_id = ?`,
      [attemptId, req.user.id]
    );

    if (attempts.length === 0) {
      return res.status(404).json({ message: 'Test attempt not found' });
    }

    const attempt = attempts[0];

    // Check if report already exists
    const [existingReports] = await db.query(
      'SELECT * FROM reports WHERE attempt_id = ? AND report_type = ?',
      [attemptId, reportType]
    );

    if (existingReports.length > 0) {
      return res.json({
        message: 'Report already exists',
        reportId: existingReports[0].id
      });
    }

    // Generate AI analysis
    let aiAnalysis;
    if (attempt.test_type === 'iq') {
      aiAnalysis = await generateIQAnalysis(attemptId, attempt.score, attempt.total_questions);
    } else {
      aiAnalysis = await generateCareerAnalysis(attemptId);
    }

    // Generate PDF
    const reportData = {
      userId: req.user.id,
      userName: attempt.name,
      userEmail: attempt.email,
      testType: attempt.test_type,
      testTitle: attempt.title,
      score: attempt.score,
      totalQuestions: attempt.total_questions,
      percentage: Math.round((attempt.score / attempt.total_questions) * 100),
      completedAt: attempt.end_time,
      aiAnalysis: aiAnalysis,
      recommendations: reportType === 'paid' ? aiAnalysis : null
    };

    const { fileName, filePath } = await generateReportPDF(reportData, reportType);

    // Save report to database
    const [result] = await db.query(
      'INSERT INTO reports (attempt_id, user_id, report_type, ai_analysis, pdf_path, is_paid) VALUES (?, ?, ?, ?, ?, ?)',
      [attemptId, req.user.id, reportType, aiAnalysis, fileName, reportType === 'paid']
    );

    // Send email
    await sendReportEmail(attempt.email, attempt.name, reportType, filePath, result.insertId);

    res.json({
      message: 'Report generated successfully',
      reportId: result.insertId,
      needsPayment: reportType === 'paid' && !existingReports[0]?.is_paid
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user reports
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const [reports] = await db.query(
      `SELECT r.*, uta.score, uta.total_questions, t.title, t.test_type, uta.end_time
       FROM reports r
       JOIN user_test_attempts uta ON r.attempt_id = uta.id
       JOIN tests t ON uta.test_id = t.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download report
router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    const [reports] = await db.query(
      'SELECT * FROM reports WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (reports.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const filePath = path.join(__dirname, '../reports', reports[0].pdf_path);
    res.download(filePath);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
