const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/auth');

// Get services by category (public)
router.get('/category/:category', async (req, res) => {
  let connection;
  try {
    const { category } = req.params;
   
    connection = await pool.getConnection();
   
    const [services] = await connection.execute(
      'SELECT * FROM services WHERE category = ? AND is_active = TRUE ORDER BY name',
      [category]
    );
   
    res.json({
      success: true,
      data: { services }
    });
   
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

 // Check if service exists
    const [existing] = await connection.execute(
      'SELECT id FROM services WHERE id = ?',
      [serviceId]
    );
   
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }