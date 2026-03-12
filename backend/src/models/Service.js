const { pool } = require('../config/database');

class Service {
  // Get all services
  static async findAll(activeOnly = true) {
    let query = 'SELECT * FROM services';
    const params = [];
    
    if (activeOnly) {
      query += ' WHERE is_active = 1';
    }
    
    query += ' ORDER BY category, name';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Get service by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM services WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Get services by category
  static async findByCategory(category) {
    const [rows] = await pool.execute(
      'SELECT * FROM services WHERE category = ? AND is_active = 1 ORDER BY name',
      [category]
    );
    return rows;
  }

  // Create new service
  static async create(serviceData) {
    const { name, description, category, pricePerUnit, unit, estimatedTimeHours, imageUrl } = serviceData;
    
    const [result] = await pool.execute(
      `INSERT INTO services (name, description, category, price_per_unit, unit, 
       estimated_time_hours, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, category, pricePerUnit, unit || 'kg', 
       estimatedTimeHours || 24, imageUrl]
    );
    
    return result.insertId;
  }

  // Update service
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    const allowedFields = ['name', 'description', 'category', 'price_per_unit', 
                          'unit', 'estimated_time_hours', 'image_url', 'is_active'];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    
    const [result] = await pool.execute(
      `UPDATE services SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  // Delete service (soft delete)
  static async delete(id) {
    const [result] = await pool.execute(
      'UPDATE services SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get service statistics
  static async getStatistics() {
    const [rows] = await pool.execute(`
      SELECT 
        s.id, s.name, s.category, s.price_per_unit,
        COUNT(o.id) as order_count,
        SUM(o.quantity) as total_quantity,
        SUM(o.total_amount) as total_revenue
      FROM services s
      LEFT JOIN orders o ON s.id = o.service_id
      WHERE s.is_active = 1
      GROUP BY s.id, s.name, s.category, s.price_per_unit
      ORDER BY order_count DESC
    `);
    return rows;
  }
}

module.exports = Service;