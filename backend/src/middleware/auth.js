const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

//
const protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader); // Debugging
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Our token format is jwt_timestamp_userId
    const tokenParts = token.split('_');
    if (tokenParts.length < 3) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format'
      });
    }

    const userId = parseInt(tokenParts[2]);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Get user from database using User model
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Add user to request
    req.user = user;
    req.token = token;
    
    console.log('✅ User authenticated:', user.email); // Debugging
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Please authenticate'
    });
  }
};

// Owner only middleware
const ownerOnly = (req, res, next) => {
  try {
    // Check if user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Please authenticate first'
      });
    }

    // Check if user role is owner
    console.log('User role:', req.user.role); // Debugging
    
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Owner only.'
      });
    }

    next();
  } catch (error) {
    console.error('Owner middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authorization error'
    });
  }
};

// Generate token
const generateToken = (userId) => {
  return `jwt_${Date.now()}_${userId}`;
};

module.exports = { 
  protect,
  ownerOnly,
  generateToken 
};