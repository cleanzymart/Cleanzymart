import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const OwnerReviews = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingReviews();
  }, []);

  const loadPendingReviews = async () => {
    try {
      const response = await reviewsAPI.getPendingReviews();
      if (response.success) {
        setPendingReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error loading pending reviews:', error);
      toast.error('Failed to load pending reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewStatus = async (id, status) => {
    try {
      const response = await reviewsAPI.updateReviewStatus(id, status);
      if (response.success) {
        toast.success(`Review ${status}`);
        loadPendingReviews();
      }
    } catch (error) {
      toast.error(`Failed to ${status} review`);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={index < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  if (loading) {
    return <div className="text-center py-8">Loading pending reviews...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Pending Reviews</h2>

      {pendingReviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No pending reviews</p>
      ) : (
        <div className="space-y-4">
          {pendingReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold">{review.user_name}</p>
                  <p className="text-sm text-gray-500">{review.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReviewStatus(review.id, 'approved')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReviewStatus(review.id, 'rejected')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>

              <p className="text-gray-700 mb-2">{review.comment}</p>
              
              <p className="text-xs text-gray-400">
                Submitted: {new Date(review.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerReviews;