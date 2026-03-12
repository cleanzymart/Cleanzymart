import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, dashboardAPI, ordersAPI } from '../../services/api';
import ReviewForm from '../../components/reviews/ReviewForm';
import MyReviews from '../../components/reviews/MyReviews';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0,
    delivered_orders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        navigate('/login');
        return;
      }

      // Parse stored user
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      console.log('👤 Logged in as:', parsedUser.email);
      console.log('👤 User ID:', parsedUser.id);
      
      // Load all data in parallel for better performance
      const [statsRes, ordersRes, activeRes] = await Promise.all([
        dashboardAPI.getCustomerStats().catch(err => {
          console.error('Stats API error:', err);
          return { success: false, data: { stats: null } };
        }),
        ordersAPI.getRecentOrders().catch(err => {
          console.error('Recent orders API error:', err);
          return { success: false, data: { orders: [] } };
        }),
        ordersAPI.getActiveOrder().catch(err => {
          console.error('Active order API error:', err);
          return { success: false, data: { order: null } };
        })
      ]);

      
      // Process stats - handle different possible response structures
      if (statsRes.success) {
        console.log('📊 Stats response:', statsRes.data);
        
        // The stats might be in different formats
        const statsData = statsRes.data.stats || statsRes.data;
        
        setStats({
          total_orders: statsData?.total_orders || 0,
          total_revenue: statsData?.total_revenue || 0,
          pending_orders: statsData?.pending_orders || 0,
          delivered_orders: statsData?.delivered_orders || 0
        });
        
        console.log('✅ Stats processed:', {
          total_orders: statsData?.total_orders || 0,
          total_revenue: statsData?.total_revenue || 0,
          pending_orders: statsData?.pending_orders || 0,
          delivered_orders: statsData?.delivered_orders || 0
        });
      } else {
        console.warn('⚠️ Stats API returned unsuccessful:', statsRes);
      }
      
      // Process recent orders
      if (ordersRes.success) {
        console.log('📦 Orders response:', ordersRes.data);
        setRecentOrders(ordersRes.data.orders || []);
        console.log('✅ Recent orders loaded:', ordersRes.data.orders?.length || 0);
      }
      
      // Process active order
      if (activeRes.success) {
        console.log('⚡ Active order response:', activeRes.data);
        setActiveOrder(activeRes.data.order || null);
      }
      
    } catch (error) {
      console.error('❌ Dashboard load error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const handleBookService = () => {
    navigate('/booking');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      confirmed: 'text-blue-600 bg-blue-100',
      in_progress: 'text-purple-600 bg-purple-100',
      ready: 'text-green-600 bg-green-100',
      delivered: 'text-emerald-600 bg-emerald-100',
      cancelled: 'text-red-600 bg-red-100'
    };
    return colors[status?.toLowerCase()] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bee6c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8f6] text-[#111813]">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white border-b border-solid border-gray-200/80 sticky top-0 z-50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between whitespace-nowrap px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4 text-[#111813]">
            {/* Logo */}
            <div className="w-6 h-6 text-[#2bee6c]">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"></path>
                <path clipRule="evenodd" fillRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236Z"></path>
              </svg>
            </div>
            <h2 className="text-[#111813] text-lg font-bold leading-tight tracking-[-0.015em]">Cleanzy Mart</h2>
          </div>
          
          <div className="flex flex-1 items-center justify-end gap-8">
            <div className="hidden md:flex items-center gap-9">
              <Link to="/dashboard" className="text-[#111813] hover:text-[#2bee6c] text-sm font-medium leading-normal">
                Dashboard
              </Link>
              <Link to="/services" className="text-[#111813] hover:text-[#2bee6c] text-sm font-medium leading-normal">
                Services
              </Link>
              <Link to="/orders" className="text-[#111813] hover:text-[#2bee6c] text-sm font-medium leading-normal">
                Orders
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleBookService}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#2bee6c] text-[#111813] text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity"
              >
                <span className="truncate">Book New Service</span>
              </button>
              
              <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-gray-100 text-[#111813] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-gray-200 transition-colors">
                <span className="text-xl">🔔</span>
              </button>
            </div>
            
            {/* User Profile Dropdown */}
            <div className="relative group">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 bg-gradient-to-br from-[#2bee6c] to-[#1fa84d] flex items-center justify-center cursor-pointer">
                <span className="text-white font-bold text-lg">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                </div>
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2bee6c] transition-colors"
                >
                  <span className="mr-2">👤</span> Profile Settings
                </Link>
                <Link 
                  to="/orders" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2bee6c] transition-colors"
                >
                  <span className="mr-2">📦</span> My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="mr-2">🚪</span> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
            <div>
              <p className="text-[#111813] text-4xl font-black leading-tight tracking-[-0.033em]">
                Hello, {user?.fullName?.split(' ')[0] || 'Customer'}! 👋
              </p>
              <p className="text-gray-500 mt-1">
                Welcome back to your laundry dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <span>🔄</span>
                <span className="text-sm">Refresh</span>
              </button>
              <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
                Member since {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pending Orders</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending_orders}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.delivered_orders}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-[#2bee6c]">LKR {stats.total_revenue?.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-[#2bee6c]/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Order Section */}
          {activeOrder && (
            <div className="mb-8">
              <h2 className="text-[#111813] text-[22px] font-bold mb-4">Active Order</h2>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <p className="text-gray-500 text-sm">Order #{activeOrder.order_number}</p>
                    <p className="text-xl font-bold mt-1">{activeOrder.service_name}</p>
                    <div className="mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activeOrder.status)}`}>
                        {activeOrder.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-gray-500 text-xs">Pickup</p>
                        <p className="text-sm font-medium">{formatDate(activeOrder.pickup_time)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Delivery</p>
                        <p className="text-sm font-medium">{formatDate(activeOrder.delivery_time)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Quantity</p>
                        <p className="text-sm font-medium">{activeOrder.quantity} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Total</p>
                        <p className="text-sm font-bold text-[#2bee6c]">LKR {activeOrder.total_amount?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-gray-800">Your Reviews</h3>
    <button
      onClick={() => setShowReviewForm(!showReviewForm)}
      className="text-sm text-[#2bee6c] hover:underline font-medium"
    >
      {showReviewForm ? 'Cancel' : 'Write a Review'}
    </button>
  </div>

  {showReviewForm && (
    <div className="mb-6">
      <ReviewForm onSuccess={() => {
        setShowReviewForm(false);
        // Refresh reviews
        window.location.reload(); // Simple way, or you can add state management
      }} />
    </div>
  )}

  <MyReviews />
</div>

          {/* Recent Orders Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#111813] text-[22px] font-bold">Recent Orders</h2>
              <Link to="/orders" className="text-sm text-[#2bee6c] hover:underline font-medium">
                View All →
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                      <tr>
                        <th className="px-6 py-4 text-left">Order ID</th>
                        <th className="px-6 py-4 text-left">Service</th>
                        <th className="px-6 py-4 text-left">Date</th>
                        <th className="px-6 py-4 text-left">Status</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-sm">
                            #{order.order_number}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order.service_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-medium">
                            LKR {order.total_amount?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <button
                    onClick={handleBookService}
                    className="px-6 py-2 bg-[#2bee6c] text-white font-semibold rounded-lg hover:bg-[#25d45f] transition-colors"
                  >
                    Book Your First Service
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;