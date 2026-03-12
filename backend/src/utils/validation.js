const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const validationRules = {
  // Signup validation
  signup: [
    body('fullName')
      .trim()
      .notEmpty().withMessage('Full name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email is invalid')
      .normalizeEmail()
      .custom(async (email) => {
        const userExists = await User.emailExists(email);
        if (userExists) {
          throw new Error('Email already exists');
        }
        return true;
      }),
    
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    
    body('confirmPassword')
      .notEmpty().withMessage('Confirm password is required')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ],

  // Login validation
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email is invalid')
      .normalizeEmail(),
    
    body('password')
      .notEmpty().withMessage('Password is required')
  ]
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = {};
  errors.array().forEach(err => {
    if (err.path) {
      extractedErrors[err.path] = err.msg;
    }
  });
  
  return res.status(400).json({
    success: false,
    errors: extractedErrors
  });
};

module.exports = { validationRules, validate };