const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { protect, ownerOnly } = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test route to check if router is working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Invite routes are working!' });
});

// Send invite email
const sendInviteEmail = async (email, token, businessName) => {
  const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite?token=${token}`;
  
  const mailOptions = {
    from: '"Cleanzy Mart" <noreply@cleanzymart.com>',
    to: email,
    subject: 'You\'re invited to join Cleanzy Mart as an Owner',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2bee6c, #1fa84d); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Cleanzy Mart</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">You're Invited!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            You have been invited to join <strong>Cleanzy Mart</strong> as a business owner.
            ${businessName ? `This invitation is for <strong>${businessName}</strong>.` : ''}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" 
               style="background: #2bee6c; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;
                      display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px;">
            This invitation will expire in 7 days. If you didn't expect this invitation, 
            please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            &copy; 2025 Cleanzy Mart. All rights reserved.
          </p>
        </div>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send invite to owner
router.post('/send-invite', protect, ownerOnly, async (req, res) => {
  let connection;
  try {
    const { email, businessName } = req.body;
    const adminId = req.user.id;
    
    console.log('📧 Sending invite to:', email);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    connection = await pool.getConnection();
    
    // Check if user already exists
    const [existingUser] = await connection.execute(
      'SELECT id, role FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }
    
    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create invites table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS owner_invites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) NOT NULL,
        token VARCHAR(100) UNIQUE NOT NULL,
        business_name VARCHAR(100),
        status ENUM('pending', 'accepted', 'expired') DEFAULT 'pending',
        invited_by INT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        accepted_at TIMESTAMP NULL,
        FOREIGN KEY (invited_by) REFERENCES users(id)
      )
    `);
    
    // Save to database
    await connection.execute(
      `INSERT INTO owner_invites (email, token, business_name, invited_by, expires_at, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [email, token, businessName || null, adminId, expiresAt]
    );
    
    // Send email
    try {
      await sendInviteEmail(email, token, businessName);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails (for testing)
    }
    
    console.log(`✅ Invite sent to ${email}`);
    
    res.json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        email,
        expires_at: expiresAt
      }
    });
    
  } catch (error) {
    console.error('Send invite error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Check invite token
router.get('/check-invite/:token', async (req, res) => {
  let connection;
  try {
    const { token } = req.params;
    
    connection = await pool.getConnection();
    
    const [invites] = await connection.execute(
      `SELECT email, business_name, status, expires_at 
       FROM owner_invites 
       WHERE token = ?`,
      [token]
    );
    
    if (invites.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found'
      });
    }
    
    const invite = invites[0];
    
    if (new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Invitation has expired'
      });
    }
    
    if (invite.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'This invitation has already been used'
      });
    }
    
    res.json({
      success: true,
      data: {
        email: invite.email,
        businessName: invite.business_name
      }
    });
    
  } catch (error) {
    console.error('Check invite error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Accept invite
router.post('/accept-invite', async (req, res) => {
  let connection;
  try {
    const { token, fullName, password } = req.body;
    
    console.log('Accepting invite with token:', token);
    
    if (!token || !fullName || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }
    
    connection = await pool.getConnection();
    
    const [invites] = await connection.execute(
      `SELECT id, email, business_name, status, expires_at 
       FROM owner_invites 
       WHERE token = ?`,
      [token]
    );
    
    if (invites.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invalid invitation token'
      });
    }
    
    const invite = invites[0];
    
    if (invite.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'This invitation has already been used'
      });
    }
    
    if (new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Invitation has expired'
      });
    }
    
    // Check if user already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [invite.email]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create owner account - FIXED: removed undefined businessName variable
    const [result] = await connection.execute(
      `INSERT INTO users (full_name, email, password_hash, role, address) 
       VALUES (?, ?, ?, 'owner', ?)`,
      [fullName, invite.email, passwordHash, invite.business_name || '']
    );
    
    // Update invite status
    await connection.execute(
      'UPDATE owner_invites SET status = "accepted", accepted_at = NOW() WHERE id = ?',
      [invite.id]
    );
    
    console.log(`✅ Owner account created for ${invite.email}`);
    
    res.json({
      success: true,
      message: 'Account created successfully',
      data: {
        email: invite.email,
        businessName: invite.business_name
      }
    });
    
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;