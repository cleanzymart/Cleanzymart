const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const reviewRoutes = require('./src/routes/reviewRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const inviteRoutes = require('./src/routes/inviteRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cleanzy_mart',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
app.use('/api/invites', inviteRoutes);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    
    // Check table structure
    const [rows] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    console.log('📊 Users table columns:');
    rows.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });
    
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Check and create tables if they don't exist
async function checkDatabaseTables() {
  try {
    const connection = await pool.getConnection();
    
    console.log('🔍 Checking database tables...');
    
    // Check if users table exists
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'users'
    `);
    
    if (tables.length === 0) {
      console.log('❌ Users table does not exist!');
      console.log('📝 Creating tables...');
      
      // Create tables
      await createTables(connection);
    } else {
      console.log('✅ Users table exists');
    }
    
    // Check other tables
    const expectedTables = ['services', 'orders', 'payments', 'order_tracking'];
    for (const table of expectedTables) {
      const [tableCheck] = await connection.execute(`
        SHOW TABLES LIKE '${table}'
      `);
      
      if (tableCheck.length === 0) {
        console.log(`❌ ${table} table does not exist!`);
      } else {
        console.log(`✅ ${table} table exists`);
      }
    }
    
    connection.release();
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

// ================== ROUTES ==================

// Register all routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/services', serviceRoutes);


// Create tables function
async function createTables(connection) {
  try {
    // Create users table WITH phone and address columns
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        role VARCHAR(20) DEFAULT 'customer',
        reset_otp VARCHAR(6),
        reset_otp_expires TIMESTAMP NULL,
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);
    console.log('✅ Created users table');
    
    // Create services table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        price_per_unit DECIMAL(10,2) NOT NULL,
        unit VARCHAR(20) DEFAULT 'kg',
        estimated_time_hours INT DEFAULT 24,
        image_url VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created services table');
    
    // Create orders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        service_id INT NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        special_instructions TEXT,
        pickup_address TEXT,
        delivery_address TEXT,
        pickup_time DATETIME,
        delivery_time DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Created orders table');
    
    // Create order_tracking table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_tracking (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        status VARCHAR(20) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created order_tracking table');
    
    // Create payments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(20) DEFAULT 'cash',
        status VARCHAR(20) DEFAULT 'pending',
        transaction_id VARCHAR(100),
        payment_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created payments table');
    
    // Add some sample data
    await addSampleData(connection);
    
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Add sample data
async function addSampleData(connection) {
  try {
    // Check if users exist
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      // Add demo users
      const demoUsers = [
        ['Demo Customer', 'customer@cleanzymart.com', await bcrypt.hash('customer123', 10), '0771234567', '123 Main St, Colombo', 'customer'],
        ['Demo Owner', 'owner@cleanzymart.com', await bcrypt.hash('owner123', 10), '0777654321', '456 Business Rd, Colombo', 'owner'],
        ['Test User', 'test@example.com', await bcrypt.hash('password123', 10), '0771112222', '789 Test Ave, Colombo', 'customer']
      ];
      
      for (const user of demoUsers) {
        await connection.execute(
          `INSERT INTO users (full_name, email, password_hash, phone, address, role) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          user
        );
      }
      console.log('✅ Added demo users');
    }
    
    // Check if services exist
    const [services] = await connection.execute('SELECT COUNT(*) as count FROM services');
    if (services[0].count === 0) {
      // Add sample services
      const sampleServices = [
        ['Wash & Fold', 'Regular laundry service - wash, dry, and fold your clothes', 'wash_fold', 250.00, 'kg', 24, 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400'],
        ['Dry Cleaning', 'Professional dry cleaning for delicate fabrics', 'dry_clean', 500.00, 'item', 48, 'https://images.unsplash.com/photo-1626804475299-6c08b4aeac39?w=400'],
        ['Ironing', 'Professional ironing service', 'ironing', 100.00, 'item', 12, 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400'],
        ['Special Items', 'Cleaning for special items like curtains, blankets', 'special', 800.00, 'item', 72, 'https://images.unsplash.com/photo-1586165368502-1bad197a7b1e?w=400']
      ];
      
      for (const service of sampleServices) {
        await connection.execute(
          `INSERT INTO services (name, description, category, price_per_unit, unit, estimated_time_hours, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          service
        );
      }
      console.log('✅ Added sample services');
    }
    
    // Check if orders exist
    const [orders] = await connection.execute('SELECT COUNT(*) as count FROM orders');
    if (orders[0].count === 0) {
      // Get user IDs
      const [usersList] = await connection.execute('SELECT id FROM users WHERE role = "customer" LIMIT 1');
      const [servicesList] = await connection.execute('SELECT id FROM services LIMIT 3');
      
      if (usersList.length > 0 && servicesList.length > 0) {
        const userId = usersList[0].id;
        
        // Set dates
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(now);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        // Add sample orders
        const sampleOrders = [
          ['CZM-2024-001', userId, servicesList[0].id, 5.0, 1250.00, 'delivered', 'Please handle with care', '123 Main St, Colombo', '123 Main St, Colombo', twoDaysAgo, yesterday],
          ['CZM-2024-002', userId, servicesList[1].id, 2.0, 1000.00, 'ready', 'Call before delivery', '123 Main St, Colombo', '123 Main St, Colombo', yesterday, now],
          ['CZM-2024-003', userId, servicesList[0].id, 3.0, 750.00, 'in_progress', 'Use eco-friendly products', '123 Main St, Colombo', '123 Main St, Colombo', now, new Date(now.setDate(now.getDate() + 1))]
        ];
        
        for (const order of sampleOrders) {
          const [result] = await connection.execute(
            `INSERT INTO orders (order_number, user_id, service_id, quantity, total_amount, status, 
             special_instructions, pickup_address, delivery_address, pickup_time, delivery_time)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            order
          );
          
          // Add tracking entries
          const trackingStatuses = [
            { status: 'pending', notes: 'Order placed', time: new Date(order[9]) },
            { status: 'confirmed', notes: 'Order confirmed', time: new Date(new Date(order[9]).getTime() + 3600000) },
            { status: order[5] === 'delivered' ? 'in_progress' : order[5], notes: 'Processing started', time: new Date(new Date(order[9]).getTime() + 7200000) }
          ];
          
          for (const track of trackingStatuses) {
            await connection.execute(
              'INSERT INTO order_tracking (order_id, status, notes, created_at) VALUES (?, ?, ?, ?)',
              [result.insertId, track.status, track.notes, track.time]
            );
          }
        }
        console.log('✅ Added sample orders with tracking');
      }
    }
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

// Helper: Check table columns
async function getTableColumns() {
  const connection = await pool.getConnection();
  try {
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND TABLE_SCHEMA = DATABASE()
      ORDER BY ORDINAL_POSITION
    `);
    
    return columns.map(col => col.COLUMN_NAME);
  } finally {
    connection.release();
  }
}

// Helper: Extract user ID from token
function getUserIdFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  const tokenParts = token.split('_');
  
  if (tokenParts.length < 3) {
    return null;
  }
  
  return parseInt(tokenParts[2]);
}

// ================== AUTH ROUTES ==================

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1 as db_status');
    res.json({
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Cleanzy Mart API v2.0',
      database: rows[0].db_status === 1 ? 'Connected' : 'Error',
      version: '2.0.0'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  let connection;
  try {
    const { email, password } = req.body;
    
    console.log('📧 Login attempt for:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      `SELECT id, full_name, email, password_hash, phone, address, role, created_at 
       FROM users WHERE email = ?`,
      [email]
    );
    
    if (users.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const user = users[0];
    
    // Check password
    let isPasswordValid = false;
    if (user.password_hash && user.password_hash.startsWith('$2a$')) {
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    } else {
      isPasswordValid = password === user.password_hash;
    }
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const userData = {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'customer',
      createdAt: user.created_at
    };
    
    const token = `jwt_${Date.now()}_${user.id}`;
    
    console.log('✅ Login successful for:', email);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token: token
      }
    });
    
  } catch (error) {
    console.error('🔥 Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    if (connection) connection.release();
  }
});

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  let connection;
  try {
    const { fullName, email, password, confirmPassword } = req.body;
    
    console.log('📝 Signup attempt for:', email);
    
    const errors = {};
    
    if (!fullName || fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        errors: errors
      });
    }
    
    connection = await pool.getConnection();
    
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        errors: { email: 'Email is already registered' }
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const [result] = await connection.execute(
      `INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)`,
      [fullName.trim(), email, passwordHash]
    );
    
    const [newUsers] = await connection.execute(
      'SELECT id, full_name, email, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    const userData = {
      id: newUsers[0].id,
      fullName: newUsers[0].full_name,
      email: newUsers[0].email,
      phone: '',
      address: '',
      role: 'customer',
      createdAt: newUsers[0].created_at
    };
    
    const token = `jwt_${Date.now()}_${userData.id}`;
    
    console.log('✅ Signup successful for:', email);
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        user: userData,
        token: token
      }
    });
    
  } catch (error) {
    console.error('🔥 Signup error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        errors: { email: 'Email is already registered' }
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    if (connection) connection.release();
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  let connection;
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }
    
    connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      'SELECT id, full_name, email, phone, address, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const userData = {
      id: users[0].id,
      fullName: users[0].full_name,
      email: users[0].email,
      phone: users[0].phone || '',
      address: users[0].address || '',
      role: users[0].role || 'customer',
      createdAt: users[0].created_at
    };
    
    res.json({
      success: true,
      data: {
        user: userData
      }
    });
    
  } catch (error) {
    console.error('🔥 Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    if (connection) connection.release();
  }
});

// Update profile endpoint
app.put('/api/auth/profile', async (req, res) => {
  let connection;
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }
    
    const { fullName, phone, address } = req.body;
    
    connection = await pool.getConnection();
    
    await connection.execute(
      'UPDATE users SET full_name = ?, phone = ?, address = ?, updated_at = NOW() WHERE id = ?',
      [fullName, phone || '', address || '', userId]
    );
    
    const [users] = await connection.execute(
      'SELECT id, full_name, email, phone, address, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    const userData = {
      id: users[0].id,
      fullName: users[0].full_name,
      email: users[0].email,
      phone: users[0].phone || '',
      address: users[0].address || '',
      role: users[0].role || 'customer',
      createdAt: users[0].created_at
    };
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userData }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    if (connection) connection.release();
  }
});

// ================== PASSWORD RESET ROUTES ==================

// Request password reset (send OTP)
app.post('/api/auth/forgot-password', async (req, res) => {
  let connection;
  try {
    const { email } = req.body;
    
    console.log('🔐 Password reset request for:', email);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      'SELECT id, email, full_name FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'If your email exists, you will receive a password reset code'
      });
    }
    
    const user = users[0];
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store OTP
    await connection.execute(
      'UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE id = ?',
      [otp, expiresAt, user.id]
    );
    
    console.log('📧 Password Reset OTP for', email, ':', otp);
    
    res.json({
      success: true,
      message: 'Password reset code sent to your email',
      data: {
        email: email,
        otp: otp // Remove in production
      }
    });
    
  } catch (error) {
    console.error('🔥 Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  let connection;
  try {
    const { email, otp } = req.body;
    
    console.log('🔐 OTP verification for:', email);
    
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      });
    }
    
    connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND reset_otp = ? AND reset_otp_expires > NOW()',
      [email, otp]
    );
    
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP'
      });
    }
    
    const user = users[0];
    
    // Generate reset token
    const resetToken = `reset_${Date.now()}_${user.id}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    await connection.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, expiresAt, user.id]
    );
    
    console.log('✅ OTP verified for:', email);
    
    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        resetToken: resetToken,
        email: email
      }
    });
    
  } catch (error) {
    console.error('🔥 OTP verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    if (connection) connection.release();
  }
});

// Reset password with token
app.post('/api/auth/reset-password', async (req, res) => {
  let connection;
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }
    
    connection = await pool.getConnection();
    
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [resetToken]
    );
    
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }
    
    const user = users[0];
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    await connection.execute(
      'UPDATE users SET password_hash = ?, reset_otp = NULL, reset_otp_expires = NULL, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [passwordHash, user.id]
    );
    
    console.log('✅ Password reset successful for user:', user.id);
    
    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
    
  } catch (error) {
    console.error('🔥 Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    if (connection) connection.release();
  }
});

// ================== SERVICES ROUTES ==================

// Get all services
app.get('/api/services', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [services] = await connection.execute(
      'SELECT * FROM services WHERE is_active = TRUE ORDER BY category, name'
    );
    
    res.json({
      success: true,
      data: { services }
    });
    
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Get service by ID
app.get('/api/services/:id', async (req, res) => {
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

// Get services by category
app.get('/api/services/category/:category', async (req, res) => {
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

// ================== DASHBOARD ROUTES ==================

// Get customer dashboard stats
app.get('/api/dashboard/customer-stats', async (req, res) => {
  let connection;
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }
    
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
app.get('/api/dashboard/owner-stats', async (req, res) => {
  let connection;
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }
    
    connection = await pool.getConnection();
    
    // Check if user is owner
    const [users] = await connection.execute(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0 || users[0].role !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Owner only.'
      });
    }
    
    // Get total customers
    const [customerCount] = await connection.execute(
      `SELECT COUNT(*) as total FROM users WHERE role = 'customer'`
    );
    
    // Get today's orders
    const [todayStats] = await connection.execute(
      `SELECT 
        COUNT(*) as today_orders,
        COALESCE(SUM(total_amount), 0) as today_revenue
      FROM orders 
      WHERE DATE(created_at) = CURDATE()`
    );
    
    // Get active orders
    const [activeStats] = await connection.execute(
      `SELECT COUNT(*) as active_orders
      FROM orders 
      WHERE status IN ('pending', 'confirmed', 'in_progress')`
    );
    
    // Get monthly revenue
    const [monthlyStats] = await connection.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as monthly_revenue
      FROM orders 
      WHERE MONTH(created_at) = MONTH(CURDATE())`
    );
    
    res.json({
      success: true,
      data: { 
        stats: {
          total_customers: customerCount[0].total || 0,
          today_orders: todayStats[0].today_orders || 0,
          today_revenue: todayStats[0].today_revenue || 0,
          active_orders: activeStats[0].active_orders || 0,
          monthly_revenue: monthlyStats[0].monthly_revenue || 0
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

// Get today's stats (owner only)
app.get('/api/dashboard/today-stats', async (req, res) => {
  let connection;
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }
    
    connection = await pool.getConnection();
    
    // Check if user is owner
    const [users] = await connection.execute(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0 || users[0].role !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Owner only.'
      });
    }
    
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

// ================== ADMIN/OWNER ROUTES ==================
// NOTE: These are now handled by orderRoutes.js
// The following endpoints are in orderRoutes:
// - GET /api/orders/owner
// - PUT /api/orders/:id/status

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  await testConnection();
  await checkDatabaseTables();
  
  app.listen(PORT, () => {
    console.log('🚀 ==========================================');
    console.log('🚀 Cleanzy Mart Backend Server Started');
    console.log('🚀 ==========================================');
    console.log(`✅ Server: http://localhost:${PORT}`);
    console.log(`✅ Database: ${process.env.DB_NAME || 'cleanzy_mart'}`);
    console.log('✅ Available Endpoints:');
    console.log('   🔐 AUTH:');
    console.log(`   📍 Health: GET http://localhost:${PORT}/api/health`);
    console.log(`   🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   📝 Signup: POST http://localhost:${PORT}/api/auth/signup`);
    console.log(`   👤 Profile: GET http://localhost:${PORT}/api/auth/me`);
    console.log(`   ✏️ Update Profile: PUT http://localhost:${PORT}/api/auth/profile`);
    console.log('   🔑 PASSWORD RESET:');
    console.log(`   📧 Forgot: POST http://localhost:${PORT}/api/auth/forgot-password`);
    console.log(`   ✅ Verify: POST http://localhost:${PORT}/api/auth/verify-otp`);
    console.log(`   🔄 Reset: POST http://localhost:${PORT}/api/auth/reset-password`);
    console.log('   📦 ORDERS (from orderRoutes):');
    console.log(`   📋 My Orders: GET http://localhost:${PORT}/api/orders/my-orders`);
    console.log(`   📊 Stats: GET http://localhost:${PORT}/api/orders/stats`);
    console.log(`   🔄 Recent: GET http://localhost:${PORT}/api/orders/recent`);
    console.log(`   ⚡ Active: GET http://localhost:${PORT}/api/orders/active`);
    console.log(`   🛒 Create: POST http://localhost:${PORT}/api/orders`);
    console.log(`   ❌ Cancel: PUT http://localhost:${PORT}/api/orders/:id/cancel`);
    console.log(`   📋 Owner Orders: GET http://localhost:${PORT}/api/orders/owner`);
    console.log(`   🔄 Update Status: PUT http://localhost:${PORT}/api/orders/:id/status`);
    console.log('   🧺 SERVICES:');
    console.log(`   📋 All: GET http://localhost:${PORT}/api/services`);
    console.log(`   📋 By Category: GET http://localhost:${PORT}/api/services/category/:category`);
    console.log('   📊 DASHBOARD:');
    console.log(`   👤 Customer: GET http://localhost:${PORT}/api/dashboard/customer-stats`);
    console.log(`   👑 Owner: GET http://localhost:${PORT}/api/dashboard/owner-stats`);
    console.log(`   📈 Today: GET http://localhost:${PORT}/api/dashboard/today-stats`);
    console.log('   ⭐ REVIEWS:');
    console.log(`   📋 All Reviews: GET http://localhost:${PORT}/api/reviews`);
    console.log(`   📝 Submit: POST http://localhost:${PORT}/api/reviews`);
    console.log(`   📋 My Reviews: GET http://localhost:${PORT}/api/reviews/my-reviews`);
    console.log(`   📊 Review Stats: GET http://localhost:${PORT}/api/reviews/stats`);
    console.log('✅ Demo credentials:');
    console.log('   👤 Customer: customer@cleanzymart.com / customer123');
    console.log('   👑 Owner: owner@cleanzymart.com / owner123');
    console.log('   👤 Test: test@example.com / password123');
    console.log('🚀 ==========================================');
  });
}

startServer();