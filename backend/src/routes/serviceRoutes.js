const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/auth');

// Get service by ID (public)
router.get('/:id', async (req, res) => {
  let connection;
  try {
    const serviceId = req.params.id;
   
    connection = await pool.getConnection();
   
    const [services] = await connection.execute(
      'SELECT * FROM services WHERE id = ?',
      [serviceId]
    );
   
    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
   
    res.json({
      success: true,
      data: { service: services[0] }
    });
   
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;