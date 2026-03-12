const { pool } = require('../config/database');

class Order {
  // Create new order
  static async create(orderData) {
    const {
      userId, serviceId, quantity, totalAmount, specialInstructions,
      pickupAddress, deliveryAddress, pickupTime, deliveryTime
    } = orderData;

    // Generate order number
    const orderNumber = 'CZM-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    const [result] = await pool.execute(
      `INSERT INTO orders (order_number, user_id, service_id, quantity, total_amount, 
       special_instructions, pickup_address, delivery_address, pickup_time, delivery_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, userId, serviceId, quantity, totalAmount,
       specialInstructions, pickupAddress, deliveryAddress, pickupTime, deliveryTime]
    );

    // Add initial tracking entry
    await pool.execute(
      'INSERT INTO order_tracking (order_id, status, notes) VALUES (?, ?, ?)',
      [result.insertId, 'pending', 'Order placed']
    );

    return result.insertId;
  }

  // Get order by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
       s.name as service_name, s.description as service_description, s.price_per_unit, s.category,
       s.estimated_time_hours, s.image_url as service_image
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN services s ON o.service_id = s.id
       WHERE o.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Get order by order number
  static async findByOrderNumber(orderNumber) {
    const [rows] = await pool.execute(
      `SELECT o.*, u.full_name, u.email, s.name as service_name 
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN services s ON o.service_id = s.id
       WHERE o.order_number = ?`,
      [orderNumber]
    );
    return rows[0];
  }

  // Get all orders for a user
  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT o.*, s.name as service_name, s.image_url as service_image,
       (SELECT status FROM order_tracking WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as current_status
       FROM orders o
       LEFT JOIN services s ON o.service_id = s.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows;
  }

  // Get all orders (for admin/owner)
  static async findAll({ page = 1, limit = 20, status = null, userId = null } = {}) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT o.*, u.full_name as customer_name, u.email as customer_email,
             s.name as service_name, s.category,
             (SELECT status FROM order_tracking WHERE order_id = o.id ORDER BY created_at DESC LIMIT 1) as current_status
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN services s ON o.service_id = s.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    
    if (userId) {
      query += ' AND o.user_id = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    const countParams = [];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (userId) {
      countQuery += ' AND user_id = ?';
      countParams.push(userId);
    }
    
    const [countRows] = await pool.execute(countQuery, countParams);
    const total = countRows[0].total;

    return { orders: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // Update order status
  static async updateStatus(id, status, notes = '') {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Update order status
      const [updateResult] = await connection.execute(
        'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );
      
      // Add tracking entry
      await connection.execute(
        'INSERT INTO order_tracking (order_id, status, notes) VALUES (?, ?, ?)',
        [id, status, notes || `Status changed to ${status}`]
      );
      
      await connection.commit();
      return updateResult.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update order
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    const allowedFields = ['quantity', 'total_amount', 'special_instructions', 
                          'pickup_address', 'delivery_address', 'pickup_time', 'delivery_time'];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    
    const [result] = await pool.execute(
      `UPDATE orders SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  // Delete order
  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM orders WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Get order tracking history
  static async getTrackingHistory(orderId) {
    const [rows] = await pool.execute(
      'SELECT * FROM order_tracking WHERE order_id = ? ORDER BY created_at ASC',
      [orderId]
    );
    return rows;
  }

  // Get orders by status
  static async findByStatus(status) {
    const [rows] = await pool.execute(
      `SELECT o.*, u.full_name as customer_name, u.phone as customer_phone,
       s.name as service_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN services s ON o.service_id = s.id
       WHERE o.status = ?
       ORDER BY o.created_at DESC`,
      [status]
    );
    return rows;
  }

  // Get recent orders
  static async findRecent(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT o.*, u.full_name as customer_name, s.name as service_name 
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN services s ON o.service_id = s.id
       ORDER BY o.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  // Get order statistics
  static async getStatistics(userId = null) {
    let query = `
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_orders,
        COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders
    `;
    
    const params = [];
    
    if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0];
  }

  // Get dashboard statistics
  static async getDashboardStats() {
    const [rows] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()) as today_orders,
        (SELECT SUM(total_amount) FROM orders WHERE DATE(created_at) = CURDATE()) as today_revenue,
        (SELECT COUNT(*) FROM orders WHERE status = 'in_progress') as active_orders,
        (SELECT SUM(total_amount) FROM orders WHERE MONTH(created_at) = MONTH(CURDATE())) as monthly_revenue
    `);
    return rows[0];
  }
}

module.exports = Order;