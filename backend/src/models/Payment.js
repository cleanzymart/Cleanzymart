const { pool } = require('../config/database');

class Payment {
  // Create payment
  static async create(paymentData) {
    const { orderId, userId, amount, paymentMethod, transactionId } = paymentData;
    
    const [result] = await pool.execute(
      `INSERT INTO payments (order_id, user_id, amount, payment_method, 
       transaction_id, payment_date) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [orderId, userId, amount, paymentMethod || 'cash', transactionId]
    );
    
    return result.insertId;
  }

  // Get payment by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, o.order_number, u.full_name as customer_name, u.email as customer_email
       FROM payments p
       LEFT JOIN orders o ON p.order_id = o.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Get payments by order ID
  static async findByOrderId(orderId) {
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC',
      [orderId]
    );
    return rows;
  }

  // Get payments by user ID
  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT p.*, o.order_number, s.name as service_name
       FROM payments p
       LEFT JOIN orders o ON p.order_id = o.id
       LEFT JOIN services s ON o.service_id = s.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return rows;
  }

  // Update payment status
  static async updateStatus(id, status) {
    const [result] = await pool.execute(
      'UPDATE payments SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  // Get payment statistics
  static async getStatistics() {
    const [rows] = await pool.execute(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM payments
      WHERE status = 'completed'
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `);
    return rows;
  }
}

module.exports = Payment;