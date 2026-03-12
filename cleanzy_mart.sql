-- Create database
CREATE DATABASE IF NOT EXISTS cleanzy_mart;
USE cleanzy_mart;

-- First, drop and recreate the users table with correct structure
DROP TABLE IF EXISTS users;

CREATE TABLE users (
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
);

-- Insert demo users with proper password hashes
INSERT INTO users (full_name, email, password_hash, phone, address, role) VALUES
('Demo Customer', 'customer@cleanzymart.com', '$2a$10$YourHashedPasswordHere', '0771234567', '123 Main St, Colombo', 'customer'),
('Demo Owner', 'owner@cleanzymart.com', '$2a$10$YourHashedPasswordHere', '0777654321', '456 Business Rd, Colombo', 'owner'),
('Test User', 'test@example.com', '$2a$10$YourHashedPasswordHere', '0771112222', '789 Test Ave, Colombo', 'customer');

UPDATE users 
SET password_hash = '$2a$10$R3W7IOgOIEiezM.OlGNjBOFp98e4aTPaZ020iGPJ2rBJBfjZuOsta' 
WHERE email = 'owner@cleanzymart.com';

SELECT email, role FROM users WHERE email = 'owner@cleanzymart.com';

-- Create services table
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
);

-- Insert sample services
INSERT INTO services (name, description, category, price_per_unit, unit, estimated_time_hours) VALUES
('Wash & Fold', 'Regular laundry service - wash, dry, and fold your clothes', 'wash_fold', 250.00, 'kg', 24),
('Dry Cleaning', 'Professional dry cleaning for delicate fabrics', 'dry_clean', 500.00, 'item', 48),
('Ironing', 'Professional ironing service', 'ironing', 100.00, 'item', 12),
('Special Items', 'Cleaning for special items like curtains, blankets', 'special', 800.00, 'item', 72);

-- Owner invites table
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
    FOREIGN KEY (invited_by) REFERENCES users(id),
    INDEX idx_token (token),
    INDEX idx_email (email),
    INDEX idx_status (status)
);

select * from owner_invites;

-- Track invites
CREATE TABLE IF NOT EXISTS invite_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invite_id INT,
    action VARCHAR(50),
    performed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invite_id) REFERENCES owner_invites(id),
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Create orders table
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
);

-- Create order_tracking table
CREATE TABLE IF NOT EXISTS order_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS reviews;

-- Create reviews table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_rating (rating)
);

-- Add some sample reviews
INSERT INTO reviews (user_id, user_name, rating, comment) VALUES
(1, 'Sarah J.', 5, 'Cleanzy Mart has been a lifesaver! The pickup and delivery are always on time, and my clothes come back perfectly clean and folded. Highly recommend!'),
(2, 'Michael B.', 5, 'The quality of the dry cleaning is top-notch. They got a stubborn stain out of my favorite suit. The convenience is just the cherry on top.'),
(3, 'Emily R.', 5, 'As a busy professional, I don\'t have time for laundry. Their wash and fold service is affordable, fast, and saves me hours every week.');

SELECT '✅ Reviews table created successfully!' as status;

-- Create payments table
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
);

select * from payments;

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token)
);

-- Add some sample orders
INSERT INTO orders (order_number, user_id, service_id, quantity, total_amount, status, pickup_address, delivery_address) 
SELECT 
    CONCAT('CZM-', DATE_FORMAT(NOW(), '%Y%m'), '-', LPAD(FLOOR(1 + RAND() * 1000), 3, '0')),
    u.id,
    s.id,
    5.0,
    1250.00,
    'delivered',
    u.address,
    u.address
FROM users u, services s 
WHERE u.email = 'customer@cleanzymart.com' AND s.name = 'Wash & Fold'
LIMIT 1;

INSERT INTO users (full_name, email, password_hash, phone, address, role) 
VALUES (
  'Admin Owner', 
  'owner@cleanzymart.com', 
  '$2a$10$R3W7IOgOIEiezM.OlGNjBOFp98e4aTPaZ020iGPJ2rBJBfjZuOsta', 
  '0771234567', 
  'Colombo', 
  'owner'
);

-- Show final structure
DESCRIBE users;
SELECT '✅ Database setup complete!' as status;
SELECT COUNT(*) as user_count, 'users' as table_name FROM users
UNION ALL
SELECT COUNT(*) as count, 'services' as table_name FROM services
UNION ALL
SELECT COUNT(*) as count, 'orders' as table_name FROM orders;

SELECT * from Users;
SELECT * from orders;
SELECT * from reviews;

SELECT o.*, u.email, u.full_name 
FROM orders o
JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC;