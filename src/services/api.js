// src/services/api.js

// API service for Cleanzy Mart
const API_BASE_URL = 'http://localhost:5000/api';

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  console.log(`🌐 API ${config.method}: ${endpoint}`);

  try {
    const response = await fetch(endpoint, config);
    
    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log(`✅ API Response (${response.status}):`, data);

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      throw {
        status: response.status,
        message: data?.error || data?.message || `Request failed with status ${response.status}`,
        errors: data?.errors,
      };
    }

    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw {
        status: 0,
        message: 'Cannot connect to server. Please check if backend is running on port 5000.',
        errors: null,
      };
    }
    
    throw error;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    console.log('🔍 Checking backend health...');
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await response.json();
    const isHealthy = response.ok && data.database === 'Connected';
    
    console.log(`✅ Backend health: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
    console.log(`📊 Database status: ${data.database || 'Unknown'}`);
    
    return isHealthy;
  } catch (error) {
    console.log('❌ Backend is offline or unreachable');
    return false;
  }
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const data = await apiRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: { email, password },
    });
    
    if (data.success && data.data?.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      console.log('✅ Login successful, user data saved');
      console.log('👤 User:', data.data.user);
    }
    
    return data;
  },

  signup: async (fullName, email, password, confirmPassword) => {
    const data = await apiRequest(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      body: { fullName, email, password, confirmPassword },
    });
    
    if (data.success && data.data?.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      console.log('✅ Signup successful, user data saved');
      console.log('👤 User:', data.data.user);
    }
    
    return data;
  },

  getCurrentUser: async () => {
    return apiRequest(`${API_BASE_URL}/auth/me`);
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ Logout successful, local storage cleared');
    return { success: true, message: 'Logged out successfully' };
  },

  forgotPassword: async (email) => {
    return apiRequest(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      body: { email },
    });
  },

  verifyOTP: async (email, otp) => {
    return apiRequest(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      body: { email, otp },
    });
  },

  resetPassword: async (resetToken, newPassword, confirmPassword) => {
    return apiRequest(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      body: { resetToken, newPassword, confirmPassword },
    });
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    return apiRequest(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      body: { currentPassword, newPassword, confirmPassword },
    });
  },
};

// User API
export const userAPI = {
  updateProfile: async (userData) => {
    return apiRequest(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      body: userData,
    });
  },
};

// Payment API
export const paymentAPI = {
  processPayment: async (paymentData) => {
    return apiRequest(`${API_BASE_URL}/payments/process-payment`, {
      method: 'POST',
      body: paymentData,
    });
  },

  getPaymentStatus: async (orderId) => {
    return apiRequest(`${API_BASE_URL}/payments/status/${orderId}`);
  },
};

// Dashboard API - UPDATED TO MATCH BACKEND
export const dashboardAPI = {
  // Customer dashboard stats
  getCustomerStats: async () => {
    return apiRequest(`${API_BASE_URL}/dashboard/customer-stats`);
  },

  // Owner dashboard stats
  getOwnerStats: async () => {
    return apiRequest(`${API_BASE_URL}/dashboard/owner-stats`);
  },

  // Today's stats (owner only)
  getTodayStats: async () => {
    return apiRequest(`${API_BASE_URL}/dashboard/today-stats`);
  },
};


// Orders API - UPDATED TO MATCH BACKEND
export const ordersAPI = {
  // Get user's orders
  getUserOrders: async () => {
    return apiRequest(`${API_BASE_URL}/orders/my-orders`);
  },

  // Get active order (single most recent active order)
  getActiveOrder: async () => {
    return apiRequest(`${API_BASE_URL}/orders/active`);
  },

  // Get recent orders (last 5)
  getRecentOrders: async () => {
    return apiRequest(`${API_BASE_URL}/orders/recent`);
  },

  // Get order statistics
  getOrderStats: async () => {
    return apiRequest(`${API_BASE_URL}/orders/stats`);
  },


  // Create new order
  createOrder: async (orderData) => {
    return apiRequest(`${API_BASE_URL}/orders`, {
      method: 'POST',
      body: orderData,
    });
  },

  // Get order by ID
  getOrderById: async (id) => {
    return apiRequest(`${API_BASE_URL}/orders/${id}`);
  },

  // Cancel order
  cancelOrder: async (id) => {
    return apiRequest(`${API_BASE_URL}/orders/${id}/cancel`, {
      method: 'PUT',
    });
  },

  // Get order tracking
  getOrderTracking: async (orderId) => {
    return apiRequest(`${API_BASE_URL}/orders/${orderId}/tracking`);
  },

  // Owner only: Get all orders
  getOwnerOrders: async () => {
    return apiRequest(`${API_BASE_URL}/orders/owner`);
  },

  // Owner only: Update order status
  updateOrderStatus: async (id, status) => {
    return apiRequest(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  },
};

// Services API - UPDATED TO MATCH BACKEND
export const servicesAPI = {
  // Get all services
  getAllServices: async () => {
    return apiRequest(`${API_BASE_URL}/services`);
  },

  // Get service by ID
  getServiceById: async (id) => {
    return apiRequest(`${API_BASE_URL}/services/${id}`);
  },

  // Get services by category
  getServicesByCategory: async (category) => {
    return apiRequest(`${API_BASE_URL}/services/category/${category}`);
  },

  // Owner only: Add service
  addService: async (serviceData) => {
    return apiRequest(`${API_BASE_URL}/services`, {
      method: 'POST',
      body: serviceData,
    });
  },

  // Owner only: Update service
  updateService: async (id, serviceData) => {
    return apiRequest(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      body: serviceData,
    });
  },

  // Owner only: Delete service
  deleteService: async (id) => {
    return apiRequest(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
    });
  },
};

// Utility functions
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get current user from localStorage
  getCurrentUserFromStorage: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Get user role
  getUserRole: () => {
    const user = apiUtils.getCurrentUserFromStorage();
    return user?.role || 'customer';
  },

  // Check if user is owner
  isOwner: () => {
    return apiUtils.getUserRole() === 'owner';
  },

  // Check if user is customer
  isCustomer: () => {
    return apiUtils.getUserRole() === 'customer';
  },

  // Clear all auth data
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🧹 Auth data cleared');
  },

  // Format date for display
  formatDate: (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Get status color
  getStatusColor: (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-purple-600 bg-purple-100';
      case 'ready': return 'text-green-600 bg-green-100';
      case 'delivered': return 'text-emerald-600 bg-emerald-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  },

  // Get status progress percentage
  getStatusProgress: (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 10;
      case 'confirmed': return 30;
      case 'in_progress': return 50;
      case 'ready': return 80;
      case 'delivered': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  },
};


// Reviews API - SIMPLIFIED
export const reviewsAPI = {
  // Get all reviews for homepage
  getAllReviews: async () => {
    return apiRequest(`${API_BASE_URL}/reviews`);
  },

  // Get user's own reviews
  getMyReviews: async () => {
    return apiRequest(`${API_BASE_URL}/reviews/my-reviews`);
  },

  // Submit a new review
  submitReview: async (reviewData) => {
    return apiRequest(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      body: reviewData,
    });
  },

  // Update a review
  updateReview: async (id, reviewData) => {
    return apiRequest(`${API_BASE_URL}/reviews/${id}`, {
      method: 'PUT',
      body: reviewData,
    });
  },

  // Delete a review
  deleteReview: async (id) => {
    return apiRequest(`${API_BASE_URL}/reviews/${id}`, {
      method: 'DELETE',
    });
  },

  // Get review statistics
  getReviewStats: async () => {
    return apiRequest(`${API_BASE_URL}/reviews/stats`);
  },

  // Owner only: Get pending reviews
  getPendingReviews: async () => {
    return apiRequest(`${API_BASE_URL}/reviews/pending`);
  },

  // Owner only: Approve/reject review
  updateReviewStatus: async (id, status) => {
    return apiRequest(`${API_BASE_URL}/reviews/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  },
};

export { apiRequest };
// Export all APIs
export default {
  authAPI,
  userAPI,
  dashboardAPI,
  ordersAPI,
  servicesAPI,
  paymentAPI,
  apiUtils,
  healthCheck,
  apiRequest,
};