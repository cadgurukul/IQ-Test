const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { sendPaymentConfirmationEmail, sendReportEmail } = require('../services/email');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { reportId } = req.body;

    // Get report details
    const [reports] = await db.query(
      'SELECT * FROM reports WHERE id = ? AND user_id = ?',
      [reportId, req.user.id]
    );

    if (reports.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (reports[0].is_paid) {
      return res.status(400).json({ message: 'Report already paid' });
    }

    // Get price from settings
    const [settings] = await db.query(
      'SELECT setting_value FROM settings WHERE setting_key = ?',
      ['paid_report_price']
    );

    const amount = parseInt(settings[0].setting_value) * 100; // Convert to paise

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `report_${reportId}_${Date.now()}`
    });

    // Save payment record
    await db.query(
      'INSERT INTO payments (user_id, report_id, razorpay_order_id, amount, currency, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, reportId, order.id, amount / 100, 'INR', 'pending']
    );

    res.json({
      orderId: order.id,
      amount: amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify payment
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update payment status
    await db.query(
      'UPDATE payments SET razorpay_payment_id = ?, status = ? WHERE razorpay_order_id = ?',
      [razorpay_payment_id, 'completed', razorpay_order_id]
    );

    // Get payment details
    const [payments] = await db.query(
      `SELECT p.*, r.pdf_path, r.attempt_id, u.email, u.name
       FROM payments p
       JOIN reports r ON p.report_id = r.id
       JOIN users u ON p.user_id = u.id
       WHERE p.razorpay_order_id = ?`,
      [razorpay_order_id]
    );

    // Mark report as paid
    await db.query(
      'UPDATE reports SET is_paid = TRUE WHERE id = ?',
      [payments[0].report_id]
    );

    // Send confirmation email
    await sendPaymentConfirmationEmail(
      payments[0].email,
      payments[0].name,
      payments[0].amount
    );

    res.json({
      message: 'Payment verified successfully',
      reportId: payments[0].report_id
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT p.*, r.report_type, t.title as test_title
       FROM payments p
       JOIN reports r ON p.report_id = r.id
       JOIN user_test_attempts uta ON r.attempt_id = uta.id
       JOIN tests t ON uta.test_id = t.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
