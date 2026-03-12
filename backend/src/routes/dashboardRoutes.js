const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get customer dashboard stats
router.get('/customer-stats', authMiddleware.protect, async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    
    connection= await pool.getConnection();
    
    // Check if orders table exists
    const [tables] = await connection.execute(`SHOW TABLES LIKE 'orders'`);
    if (tables.length === 0) {
      return res.json({
        success: true,
        data: { 
          stats: {
            total_orders: 0,
            total_revenue: 0,
            pending_orders: 0,
            delivered_orders: 0
          }
        }
      });
    }
    
    // Get order statistics
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
    
    res.json({
      success: true,
      data: { stats: stats[0] }
    });
    
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Get owner dashboard stats
router.get('/owner-stats', authMiddleware.protect, authMiddleware.ownerOnly, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Get total customers
    const [customerCount] = await connection.execute(
      `SELECT COUNT(*) as total FROM users WHERE role = 'customer'`
    );
    
    // Get today's orders
    const [todayOrders] = await connection.execute(
      `SELECT 
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      WHERE DATE(created_at) = CURDATE()`
    );
    
    // Get active orders
    const [activeOrders] = await connection.execute(
      `SELECT COUNT(*) as count
      FROM orders 
      WHERE status IN ('pending', 'confirmed', 'in_progress')`
    );
    
    // Get monthly revenue
    const [monthlyRevenue] = await connection.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as total
      FROM orders 
      WHERE MONTH(created_at) = MONTH(CURDATE())`
    );
    
    res.json({
      success: true,
      data: { 
        stats: {
          total_customers: customerCount[0].total || 0,
          today_orders: todayOrders[0].count || 0,
          today_revenue: todayOrders[0].revenue || 0,
          active_orders: activeOrders[0].count || 0,
          monthly_revenue: monthlyRevenue[0].total || 0
        }
      }
    });
    
  } catch (error) {
    console.error('Get owner stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Get today's stats
router.get('/today-stats', authMiddleware.protect, authMiddleware.ownerOnly, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [stats] = await connection.execute(
      `SELECT 
        COUNT(*) as today_orders,
        COALESCE(SUM(total_amount), 0) as today_revenue
      FROM orders 
      WHERE DATE(created_at) = CURDATE()`
    );
    
    res.json({
      success: true,
      data: { 
        stats: {
          today_orders: stats[0].today_orders || 0,
          today_revenue: stats[0].today_revenue || 0
        }
      }
    });
    
  } catch (error) {
    console.error('Get today stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;