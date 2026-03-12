const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Helper function to get user ID from token
function getUserIdFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const tokenParts = token.split('_');
  if (tokenParts.length < 3) return null;
  return parseInt(tokenParts[2]);
}

// Get all reviews for homepage (public) - NO APPROVAL NEEDED
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [reviews] = await connection.execute(
      `SELECT id, user_name, rating, comment, created_at 
       FROM reviews 
       ORDER BY created_at DESC 
       LIMIT 9`,
      []
    );
    
    res.json({
      success: true,
      data: { reviews }
    });
    
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Get user's own reviews (protected)
router.get('/my-reviews', async (req, res) => {
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
    
    const [reviews] = await connection.execute(
      `SELECT id, rating, comment, created_at 
       FROM reviews 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );
    
    res.json({
      success: true,
      data: { reviews }
    });
    
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Submit a new review (protected) - DIRECTLY ADDED, NO APPROVAL
router.post('/', async (req, res) => {
  let connection;
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Please login to submit a review'
      });
    }
    
    const { rating, comment } = req.body;
    
    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid rating (1-5)'
      });
    }
    
    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Review comment must be at least 5 characters'
      });
    }
    
    connection = await pool.getConnection();
    
    // Get user name
    const [users] = await connection.execute(
      'SELECT full_name FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const userName = users[0].full_name;
    
    // Insert review directly (NO STATUS COLUMN)
    const [result] = await connection.execute(
      `INSERT INTO reviews (user_id, user_name, rating, comment) 
       VALUES (?, ?, ?, ?)`,
      [userId, userName, rating, comment]
    );
    
    // Get created review
    const [reviews] = await connection.execute(
      'SELECT id, rating, comment, created_at FROM reviews WHERE id = ?',
      [result.insertId]
    );
    
    console.log(`✅ New review submitted by ${userName}`);
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: { review: reviews[0] }
    });
    
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Update existing review (protected)
router.put('/:id', async (req, res) => {
  let connection;
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    const reviewId = req.params.id;
    const { rating, comment } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Please login to update review'
      });
    }
    
    connection = await pool.getConnection();
    
    // Check if review belongs to user
    const [reviews] = await connection.execute(
      'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );
    
    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
    
    // Update review
    await connection.execute(
      'UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?',
      [rating, comment, reviewId]
    );
    
    res.json({
      success: true,
      message: 'Review updated successfully'
    });
    
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Delete review (protected)
router.delete('/:id', async (req, res) => {
  let connection;
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    const reviewId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Please login to delete review'
      });
    }
    
    connection = await pool.getConnection();
    
    // Check if review belongs to user
    const [reviews] = await connection.execute(
      'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );
    
    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
    
    // Delete review
    await connection.execute(
      'DELETE FROM reviews WHERE id = ?',
      [reviewId]
    );
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Get review statistics (public)
router.get('/stats', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [stats] = await connection.execute(
      `SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM reviews`,
      []
    );
    
    res.json({
      success: true,
      data: { stats: stats[0] }
    });
    
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;