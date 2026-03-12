const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

class AuthController {
  // Signup
  static async signup(req, res) {
    try {
      const { fullName, email, password, phone = '', address = '' } = req.body;

      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered'
        });
      }

      // Create user
      const user = await User.create({ 
        fullName, 
        email, 
        password, 
        phone, 
        address,
        role: 'customer' 
      });

      // Generate token
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        error: 'Error creating user: ' + error.message
      });
    }
  }

  // Login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate token
      const token = generateToken(user.id);

      // Prepare user response
      const userResponse = {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || 'customer',
        createdAt: user.created_at
      };

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Error during login: ' + error.message
      });
    }
  }

  // Get current user
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user
        }
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching user data: ' + error.message
      });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Error during logout: ' + error.message
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { fullName, phone, address } = req.body;
      const userId = req.user.id;

      const updateData = {};
      if (fullName) updateData.fullName = fullName;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;

      const updated = await User.update(userId, updateData);

      if (updated) {
        const user = await User.findById(userId);
        res.json({
          success: true,
          message: 'Profile updated successfully',
          data: {
            user
          }
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating profile: ' + error.message
      });
    }
  }

  // Forgot password - send OTP
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      // Check if user exists
      const user = await User.findByEmail(email);
      
      if (!user) {
        // Don't reveal that user doesn't exist
        return res.json({
          success: true,
          message: 'If your email exists, you will receive a password reset code'
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP
      await User.storeResetOTP(email, otp, expiresAt);

      console.log(`📧 Password Reset OTP for ${email}: ${otp}`);

      res.json({
        success: true,
        message: 'Password reset code sent to your email',
        data: {
          email,
          // For development only - remove in production
          otp
        }
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: 'Error processing request: ' + error.message
      });
    }
  }

  // Verify OTP
  static async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          error: 'Email and OTP are required'
        });
      }

      // Verify OTP
      const user = await User.verifyOTP(email, otp);

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired OTP'
        });
      }

      // Generate reset token
      const resetToken = `reset_${Date.now()}_${user.id}`;
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await User.storeResetToken(email, resetToken, expiresAt);

      res.json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          resetToken,
          email
        }
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        error: 'Error verifying OTP: ' + error.message
      });
    }
  }

  // Reset password
  static async resetPassword(req, res) {
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

      // Verify reset token
      const user = await User.verifyResetToken(resetToken);

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token'
        });
      }

      // Reset password
      await User.resetPassword(user.id, newPassword);

      res.json({
        success: true,
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        error: 'Error resetting password: ' + error.message
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'New passwords do not match'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters'
        });
      }

      // Get user with password
      const user = await User.findByEmail(req.user.email);

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Update password
      await User.updatePassword(userId, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Error changing password: ' + error.message
      });
    }
  }
}

module.exports = AuthController;