import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    loadMyReviews();
  }, []);

  const loadMyReviews = async () => {
    try {
      const response = await reviewsAPI.getMyReviews();
      if (response.success) {
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load your reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const response = await reviewsAPI.deleteReview(id);
      if (response.success) {
        toast.success('Review deleted');
        loadMyReviews();
      }
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleEdit = (review) => {
    setEditingId(review.id);
    setEditForm({ rating: review.rating, comment: review.comment });
  };

  const handleUpdate = async (id) => {
    if (editForm.comment.trim().length < 5) {
      toast.error('Comment must be at least 5 characters');
      return;
    }

    try {
      const response = await reviewsAPI.updateReview(id, editForm);
      if (response.success) {
        toast.success('Review updated');
        setEditingId(null);
        loadMyReviews();
      }
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-4">Loading your reviews...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">My Reviews</h3>
      
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          You haven't written any reviews yet.
        </p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            {editingId === review.id ? (
              // Edit mode
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditForm({...editForm, rating: star})}
                        className="text-2xl"
                      >
                        <span className={star <= editForm.rating ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Comment</label>
                  <textarea
                    value={editForm.comment}
                    onChange={(e) => setEditForm({...editForm, comment: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(review.id)}
                    className="px-4 py-2 bg-[#2bee6c] text-white rounded-lg text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{review.comment}</p>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{formatDate(review.created_at)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MyReviews;