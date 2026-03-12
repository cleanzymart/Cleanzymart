import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch fresh user data from API
      const response = await authAPI.getCurrentUser();
      
      if (response.success && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        setFormData({
          fullName: userData.fullName || userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || ''
        });
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Fallback to localStorage data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setFormData({
            fullName: userData.fullName || userData.full_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || ''
          });
        } else {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load profile data');
      // Try localStorage as fallback
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData({
          fullName: userData.fullName || userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || ''
        });
      } else {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.phone && !/^[0-9+\-\s()]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    return newErrors;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await userAPI.updateProfile(formData);
      
      if (response.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully!');
        setEditing(false);
        setErrors({});
      } else {
        toast.error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    // This would open a modal or navigate to password change page
    toast.success('Password change feature coming soon!');
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bee6c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8f6]">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-[#004A66]">Cleanzy Mart</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-[#2bee6c]"
              >
                ← Back to Dashboard
              </button>
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
            <Button
              onClick={() => setEditing(!editing)}
              variant={editing ? 'secondary' : 'primary'}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={errors.fullName}
                disabled={!editing}
                required
              />
              
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                disabled={true} // Email usually can't be changed
                helperText="Email cannot be changed"
                required
              />
              
              <InputField
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+94 77 123 4567"
                error={errors.phone}
                disabled={!editing}
              />
              
              <div className="md:col-span-2">
                <InputField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your full address for delivery"
                  disabled={!editing}
                  textarea
                  rows={3}
                />
              </div>
            </div>

            {editing && (
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Account Security Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Security</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Password</h3>
                <p className="text-sm text-gray-600">Change your password regularly for security</p>
              </div>
              <Button
                variant="outline"
                onClick={handleChangePassword}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="font-medium text-gray-800">
                {user?.role === 'owner' ? 'Business Owner' : 'Customer'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium text-gray-800">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-medium text-gray-800 font-mono">#{user?.id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium text-gray-800">
                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;