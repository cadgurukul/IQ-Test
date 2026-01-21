const express = require('express');
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// Get all users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, email, name, role, auth_provider, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reports
router.get('/reports', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [reports] = await db.query(
      `SELECT r.*, u.email, u.name, t.title as test_title, uta.score, uta.total_questions
       FROM reports r
       JOIN users u ON r.user_id = u.id
       JOIN user_test_attempts uta ON r.attempt_id = uta.id
       JOIN tests t ON uta.test_id = t.id
       ORDER BY r.created_at DESC`
    );
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all questions
router.get('/questions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [questions] = await db.query(
      `SELECT q.*, t.title as test_title, t.test_type
       FROM questions q
       JOIN tests t ON q.test_id = t.id
       ORDER BY q.test_id, q.order_number`
    );
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add question
router.post('/questions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { test_id, question_text, question_type, options, correct_answer, points, order_number } = req.body;

    const [result] = await db.query(
      'INSERT INTO questions (test_id, question_text, question_type, options, correct_answer, points, order_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [test_id, question_text, question_type, JSON.stringify(options), correct_answer, points, order_number]
    );

    res.status(201).json({
      message: 'Question added successfully',
      questionId: result.insertId
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update question
router.put('/questions/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { question_text, question_type, options, correct_answer, points, order_number } = req.body;

    await db.query(
      'UPDATE questions SET question_text = ?, question_type = ?, options = ?, correct_answer = ?, points = ?, order_number = ? WHERE id = ?',
      [question_text, question_type, JSON.stringify(options), correct_answer, points, order_number, req.params.id]
    );

    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete question
router.delete('/questions/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM questions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get settings
router.get('/settings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM settings');
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update setting
router.put('/settings/:key', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { value } = req.body;

    await db.query(
      'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
      [value, req.params.key]
    );

    res.json({ message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistics
router.get('/statistics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const [totalTests] = await db.query('SELECT COUNT(*) as count FROM user_test_attempts WHERE status = "completed"');
    const [totalReports] = await db.query('SELECT COUNT(*) as count FROM reports');
    const [paidReports] = await db.query('SELECT COUNT(*) as count FROM reports WHERE is_paid = TRUE');
    const [revenue] = await db.query('SELECT SUM(amount) as total FROM payments WHERE status = "completed"');

    res.json({
      totalUsers: totalUsers[0].count,
      totalTestsCompleted: totalTests[0].count,
      totalReports: totalReports[0].count,
      paidReports: paidReports[0].count,
      totalRevenue: revenue[0].total || 0
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
