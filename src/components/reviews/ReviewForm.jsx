import React, { useState } from 'react';
import { reviewsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ReviewForm = ({ onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (comment.trim().length < 5) {
      toast.error('Please write at least 5 characters');
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await reviewsAPI.submitReview({
        rating,
        comment: comment.trim()
      });
      
      if (response.success) {
        toast.success('Review submitted successfully! 🎉');
        setComment('');
        setRating(5);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-xl font-bold mb-4">Share Your Experience</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="text-3xl focus:outline-none transition-transform hover:scale-110"
              >
                <span className={
                  star <= (hoveredStar || rating) 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                }>
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2bee6c] focus:border-transparent"
            placeholder="Tell us about your experience..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 characters (minimum 5)
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full px-6 py-3 bg-[#2bee6c] text-white font-semibold rounded-lg hover:bg-[#25d45f] transition-colors ${
            submitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;