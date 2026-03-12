const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { protect, ownerOnly } = require('../middleware/auth');

// Test route - endpoint එක work වෙනවද කියලා check කරන්න
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Orders API is working' });
});

// ================== OWNER ROUTES ==================
// මෙය /api/orders/owner වෙත access කරන්න

// Get all orders for owner
router.get('/owner', protect, ownerOnly, async (req, res) => {
  console.log('📦 Owner orders endpoint hit!'); // Debug log
  let connection;
  try {
    connection = await pool.getConnection();
    
    // First, check if orders table exists
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'orders'
    `);
    
    if (tables.length === 0) {
      return res.json({ 
        success: true, 
        data: { orders: [] },
        message: 'Orders table does not exist'
      });
    }
    
    // Get all orders with customer and service details
    const [orders] = await connection.execute(`
      SELECT 
        o.*,
        u.full_name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        u.address as customer_address,
        s.name as service_name,
        s.category as service_category
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN services s ON o.service_id = s.id
      ORDER BY o.created_at DESC
    `);
    
    console.log(`📦 Owner fetched ${orders.length} orders`);
    res.json({ 
      success: true, 
      data: { orders },
      count: orders.length
    });
    
  } catch (error) {
    console.error('❌ Get owner orders error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
});

// Get order by ID for owner
router.get('/owner/:id', protect, ownerOnly, async (req, res) => {
  let connection;
  try {
    const orderId = req.params.id;
    connection = await pool.getConnection();
    
    const [orders] = await connection.execute(`
      SELECT 
        o.*,
        u.full_name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        u.address as customer_address,
        s.name as service_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN services s ON o.service_id = s.id
      WHERE o.id = ?
    `, [orderId]);
    
    if (orders.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: { order: orders[0] } 
    });
    
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
});

// Update order status (owner only)
router.put('/:id/status', protect, ownerOnly, async (req, res) => {
  let connection;
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status' 
      });
    }
    
    connection = await pool.getConnection();
    
    await connection.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, orderId]
    );
    
    res.json({ 
      success: true, 
      message: 'Order status updated successfully' 
    });
    
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
});

// ================== CUSTOMER ROUTES ==================

// Get user's orders
router.get('/my-orders', protect, async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    connection = await pool.getConnection();
    
    const [orders] = await connection.execute(
      `SELECT o.*, 
        s.name as service_name
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC`,
      [userId]
    );
    
    res.json({ success: true, data: { orders } });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Get recent orders
router.get('/recent', protect, async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    connection = await pool.getConnection();
    
    const [orders] = await connection.execute(
      `SELECT o.*, s.name as service_name
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      LIMIT 5`,
      [userId]
    );
    
    res.json({ success: true, data: { orders } });
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Get order stats
router.get('/stats', protect, async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    connection = await pool.getConnection();
    
    const [stats] = await connection.execute(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders
      FROM orders
      WHERE user_id = ?`,
      [userId]
    );
    
    res.json({ success: true, data: { stats: stats[0] } });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Get active order
router.get('/active', protect, async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    connection = await pool.getConnection();
    
    const [orders] = await connection.execute(
      `SELECT o.*, s.name as service_name
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      WHERE o.user_id = ? AND o.status NOT IN ('delivered', 'cancelled')
      ORDER BY o.created_at DESC
      LIMIT 1`,
      [userId]
    );
    
    res.json({ success: true, data: { order: orders[0] || null } });
  } catch (error) {
    console.error('Get active order error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Create new order
router.post('/', protect, async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    const { serviceId, quantity, totalAmount, specialInstructions, pickupAddress, deliveryAddress } = req.body;
    
    connection = await pool.getConnection();
    
    // Generate order number
    const date = new Date();
    const orderNumber = `CZM-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}-${Math.floor(Math.random()*1000)}`;
    
    const [result] = await connection.execute(
      `INSERT INTO orders (order_number, user_id, service_id, quantity, total_amount, special_instructions, pickup_address, delivery_address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [orderNumber, userId, serviceId, quantity, totalAmount, specialInstructions || '', pickupAddress || '', deliveryAddress || '']
    );
    
    const [orders] = await connection.execute(
      `SELECT o.*, s.name as service_name
       FROM orders o
       LEFT JOIN services s ON o.service_id = s.id
       WHERE o.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({ success: true, message: 'Order created', data: { order: orders[0] } });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Cancel order
router.put('/:id/cancel', protect, async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    
    connection = await pool.getConnection();
    
    await connection.execute(
      'UPDATE orders SET status = "cancelled" WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );
    
    res.json({ success: true, message: 'Order cancelled' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    
    connection = await pool.getConnection();
    
    const [orders] = await connection.execute(
      `SELECT o.*, s.name as service_name
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      WHERE o.id = ? AND o.user_id = ?`,
      [orderId, userId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, data: { order: orders[0] } });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;