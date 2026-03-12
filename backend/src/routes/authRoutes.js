const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.use(authMiddleware.protect);
router.get('/me', AuthController.getCurrentUser);
router.post('/logout', AuthController.logout);
router.put('/profile', AuthController.updateProfile);
router.put('/change-password', AuthController.changePassword);

module.exports = router;