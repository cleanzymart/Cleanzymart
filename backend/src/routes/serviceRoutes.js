const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/auth');

// ============== OWNER ONLY ROUTES ==============

// Create new service (owner only)
router.post('/', protect, ownerOnly, async (req, res) => {
  let connection;
  try {
    const { name, description, price_per_unit, unit, category } = req.body;
    
    if (!name || !price_per_unit || !category) {
      return res.status(400).json({
        success: false,
        error: 'Name, price, and category are required'
      });
    }
    
    connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      `INSERT INTO services (name, description, price_per_unit, unit, category, is_active) 
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [name, description || '', price_per_unit, unit || 'kg', category]
    );
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { id: result.insertId }
    });
    
  } catch (error) {
    console.error('Create service error:', error);

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