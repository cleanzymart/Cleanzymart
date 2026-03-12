import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api'; // මෙය හරි
import toast from 'react-hot-toast';

const InviteOwner = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    businessName: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiRequest('http://localhost:5000/api/invites/send-invite', {
        method: 'POST',
        body: formData
      });

      if (response.success) {
        toast.success(`Invitation sent to ${formData.email}`);
        setFormData({ email: '', businessName: '' });
      } else {
        toast.error(response.error || 'Failed to send invite');
      }
    } catch (error) {
      console.error('Invite error:', error);
      toast.error(error.message || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Invite New Owner</h1>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2bee6c]/50"
                placeholder="owner@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name (Optional)
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2bee6c]/50"
                placeholder="e.g., Colombo Laundry Services"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-[#2bee6c] text-white rounded-lg hover:bg-[#25d45f] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">📧 What happens next?</h3>
            <ul className="text-sm text-blue-600 space-y-2">
              <li>• Owner receives an email with invitation link</li>
              <li>• Link expires in 7 days</li>
              <li>• Owner creates their account using the link</li>
              <li>• They'll automatically get owner access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteOwner;