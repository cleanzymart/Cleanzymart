const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { protect } = require('../middleware/auth');

// Test route to check if router is working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Payment routes are working!' });
});

// Process payment
router.post('/process-payment', protect, async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    const { 
      orderId, 
      paymentMethod, 
      cardDetails, 
      amount,
      orderDetails 
    } = req.body;

    console.log('💳 Processing payment for user:', userId);
    console.log('📦 Payment data:', { paymentMethod, amount });

    connection = await pool.getConnection();

    let paymentStatus = 'pending';
    let transactionId = null;

    // Process based on payment method
    if (paymentMethod === 'card') {
      transactionId = 'TXN_' + Date.now();
      paymentStatus = 'completed';
    } else if (paymentMethod === 'wallet') {
      transactionId = 'WLT_' + Date.now();
      paymentStatus = 'completed';
    } else if (paymentMethod === 'cod') {
      paymentStatus = 'pending';
    }

    // Create payments table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        transaction_id VARCHAR(100),
        payment_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_order_id (order_id)
      )
    `);

    // Create payment record
    const [paymentResult] = await connection.execute(
      `INSERT INTO payments (
        order_id, user_id, amount, payment_method, 
        status, transaction_id, payment_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId || null,
        userId,
        amount,
        paymentMethod,
        paymentStatus,
        transactionId,
        paymentStatus === 'completed' ? new Date() : null
      ]
    );

    console.log(`✅ Payment recorded: ${transactionId || 'COD'}`);

    res.json({
      success: true,
      message: paymentStatus === 'completed' ? 'Payment successful' : 'Order placed successfully',
      data: {
        paymentId: paymentResult.insertId,
        transactionId,
        status: paymentStatus,
        amount
      }
    });

  } catch (error) {
    console.error('❌ Payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Payment processing failed'
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;