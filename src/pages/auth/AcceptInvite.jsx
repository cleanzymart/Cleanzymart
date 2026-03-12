import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import toast from 'react-hot-toast';

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      toast.error('Invalid invitation link');
      navigate('/signup');
    }
  }, [token]);

  const validateToken = async () => {
    try {
      console.log('Validating token:', token);
      
      const response = await apiRequest(`http://localhost:5000/api/invites/check-invite/${token}`, {
        method: 'GET'
      });
      
      console.log('Validation response:', response);

      if (response.success) {
        setInviteData(response.data);
        // Pre-fill email if needed
        setFormData(prev => ({ ...prev, email: response.data.email }));
      } else {
        toast.error(response.error || 'Invalid invitation');
        navigate('/signup');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate invitation');
      navigate('/signup');
    } finally {
      setValidating(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      console.log('Accepting invite with token:', token);
      
      const response = await apiRequest('http://localhost:5000/api/invites/accept-invite', {
        method: 'POST',
        body: {
          token,
          fullName: formData.fullName,
          password: formData.password
        }
      });

      console.log('Accept response:', response);

      if (response.success) {
        toast.success('Account created successfully!');
        navigate('/login', { 
          state: { message: 'Your owner account is ready. Please login.' }
        });
      } else {
        toast.error(response.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Accept error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bee6c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8f6] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2bee6c]/20 rounded-full mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-2xl font-bold">Accept Invitation</h2>
          <p className="text-gray-600 mt-2">
            You've been invited to join as an owner
            {inviteData?.businessName && ` for ${inviteData.businessName}`}
          </p>
          <p className="text-sm text-gray-500 mt-1">{inviteData?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2bee6c]/50 ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
              required
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2bee6c]/50 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Create a password (min. 6 characters)"
              required
              minLength="6"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2bee6c]/50 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
              required
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#2bee6c] text-white font-semibold rounded-lg hover:bg-[#25d45f] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating Account...' : 'Accept & Create Account'}
          </button>
        </form>

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-500">
            <strong>Token:</strong> {token?.substring(0, 20)}...
          </p>
          {inviteData && (
            <p className="text-xs text-gray-500 mt-1">
              <strong>Email:</strong> {inviteData.email}<br />
              <strong>Business:</strong> {inviteData.businessName || 'Not specified'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;