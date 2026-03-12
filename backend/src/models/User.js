const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create new user
  static async create(userData) {
    const { fullName, email, password, phone = '', address = '', role = 'customer' } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, password_hash, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, phone, address, role]
    );
    
    return this.findById(result.insertId);
  }

  // Find user by email
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, full_name, email, phone, address, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Compare password
  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Update user
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    if (updateData.fullName) {
      fields.push('full_name = ?');
      values.push(updateData.fullName);
    }
    
    if (updateData.email) {
      fields.push('email = ?');
      values.push(updateData.email);
    }
    
    if (updateData.phone !== undefined) {
      fields.push('phone = ?');
      values.push(updateData.phone);
    }
    
    if (updateData.address !== undefined) {
      fields.push('address = ?');
      values.push(updateData.address);
    }
    
    if (updateData.role) {
      fields.push('role = ?');
      values.push(updateData.role);
    }
    
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      fields.push('password_hash = ?');
      values.push(hashedPassword);
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    
    const [result] = await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  // Store OTP for password reset
  static async storeResetOTP(email, otp, expiresAt) {
    const [result] = await pool.execute(
      'UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?',
      [otp, expiresAt, email]
    );
    return result.affectedRows > 0;
  }

  // Verify OTP
  static async verifyOTP(email, otp) {
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND reset_otp = ? AND reset_otp_expires > NOW()',
      [email, otp]
    );
    return rows[0];
  }

  // Store reset token
  static async storeResetToken(email, token, expiresAt) {
    const [result] = await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
      [token, expiresAt, email]
    );
    return result.affectedRows > 0;
  }

  // Verify reset token
  static async verifyResetToken(token) {
    const [rows] = await pool.execute(
      'SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    return rows[0];
  }

  // Reset password
  static async resetPassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.execute(
      'UPDATE users SET password_hash = ?, reset_otp = NULL, reset_otp_expires = NULL, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, userId]
    );
    return result.affectedRows > 0;
  }

  // Check if email exists
  static async emailExists(email, excludeUserId = null) {
    let query = 'SELECT id FROM users WHERE email = ?';
    const params = [email];
    
    if (excludeUserId) {
      query += ' AND id != ?';
      params.push(excludeUserId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
  }

  // Get user by reset token
  static async getByResetToken(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    return rows[0];
  }

  // Update password
  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    return result.affectedRows > 0;
  }

  // Clear reset fields
  static async clearResetFields(userId) {
    const [result] = await pool.execute(
      'UPDATE users SET reset_otp = NULL, reset_otp_expires = NULL, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;