const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/auth');

// IMPORTANT: UPDATE SERVICE ENDPOINT - This fixes the 404 error
router.put('/:id', protect, ownerOnly, async (req, res) => {
  let connection;
  try {
    const serviceId = req.params.id;
    const { name, description, price_per_unit, unit, category } = req.body;
    
    console.log('Updating service:', serviceId, req.body);
    
    if (!name || !price_per_unit) {
      return res.status(400).json({
        success: false,
        error: 'Name and price are required'
      });
    }
    
    connection = await pool.getConnection();
    
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
    
    // Update service
    await connection.execute(
      `UPDATE services 
       SET name = ?, description = ?, price_per_unit = ?, unit = ?, category = ?
       WHERE id = ?`,
      [name, description || '', price_per_unit, unit || 'kg', category, serviceId]
    );
    
    console.log('✅ Service updated successfully:', serviceId);
    
    res.json({
      success: true,
      message: 'Service updated successfully'
    });
    
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;