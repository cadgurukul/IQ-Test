const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Get all tests
router.get('/', async (req, res) => {
  try {
    const [tests] = await db.query(
      'SELECT * FROM tests WHERE is_active = TRUE ORDER BY test_type'
    );
    res.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get test by ID
router.get('/:id', async (req, res) => {
  try {
    const [tests] = await db.query(
      'SELECT * FROM tests WHERE id = ? AND is_active = TRUE',
      [req.params.id]
    );

    if (tests.length === 0) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json(tests[0]);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get questions for a test
router.get('/:id/questions', authMiddleware, async (req, res) => {
  try {
    const [questions] = await db.query(
      'SELECT id, question_text, question_type, options, order_number FROM questions WHERE test_id = ? ORDER BY order_number',
      [req.params.id]
    );

    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start a test attempt
router.post('/:id/start', authMiddleware, async (req, res) => {
  try {
    const [questions] = await db.query(
      'SELECT COUNT(*) as count FROM questions WHERE test_id = ?',
      [req.params.id]
    );

    const [result] = await db.query(
      'INSERT INTO user_test_attempts (user_id, test_id, total_questions) VALUES (?, ?, ?)',
      [req.user.id, req.params.id, questions[0].count]
    );

    res.json({
      message: 'Test started',
      attemptId: result.insertId
    });
  } catch (error) {
    console.error('Error starting test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit answer
router.post('/attempts/:attemptId/answer', authMiddleware, async (req, res) => {
  try {
    const { questionId, answer } = req.body;

    // Get correct answer
    const [questions] = await db.query(
      'SELECT correct_answer FROM questions WHERE id = ?',
      [questionId]
    );

    const isCorrect = questions[0].correct_answer === answer;

    // Save answer
    await db.query(
      'INSERT INTO user_answers (attempt_id, question_id, answer, is_correct) VALUES (?, ?, ?, ?)',
      [req.params.attemptId, questionId, answer, isCorrect]
    );

    res.json({ message: 'Answer submitted' });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete test
router.post('/attempts/:attemptId/complete', authMiddleware, async (req, res) => {
  try {
    // Calculate score
    const [answers] = await db.query(
      'SELECT COUNT(*) as correct FROM user_answers WHERE attempt_id = ? AND is_correct = TRUE',
      [req.params.attemptId]
    );

    // Update attempt
    await db.query(
      'UPDATE user_test_attempts SET status = ?, end_time = NOW(), score = ? WHERE id = ?',
      ['completed', answers[0].correct, req.params.attemptId]
    );

    const [attempt] = await db.query(
      'SELECT * FROM user_test_attempts WHERE id = ?',
      [req.params.attemptId]
    );

    res.json({
      message: 'Test completed',
      score: answers[0].correct,
      total: attempt[0].total_questions,
      percentage: Math.round((answers[0].correct / attempt[0].total_questions) * 100)
    });
  } catch (error) {
    console.error('Error completing test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's test history
router.get('/user/history', authMiddleware, async (req, res) => {
  try {
    const [attempts] = await db.query(
      `SELECT uta.*, t.title, t.test_type 
       FROM user_test_attempts uta
       JOIN tests t ON uta.test_id = t.id
       WHERE uta.user_id = ?
       ORDER BY uta.created_at DESC`,
      [req.user.id]
    );

    res.json(attempts);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
