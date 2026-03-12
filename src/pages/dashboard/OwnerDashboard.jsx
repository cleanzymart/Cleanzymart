import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ordersAPI, apiUtils } from '../../services/api';
import toast from 'react-hot-toast';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    
    if (userData.role !== 'owner') {
      toast.error('Access denied. Owner only.');
      navigate('/dashboard');
      return;
    }

    setUser(userData);
    loadOrders();
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('📦 Loading orders...');
      
      const response = await ordersAPI.getOwnerOrders();
      console.log('📦 Orders response:', response);
      
      if (response.success) {
        setOrders(response.data.orders || []);
        toast.success(`Loaded ${response.data.orders?.length || 0} orders`);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Load orders error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Navigation Handler
  const handleNavigation = (tab, path) => {
    setActiveTab(tab);
    navigate(path);
  };

  const handleQuickAction = (path) => {
    navigate(path);
  };

  const handleAddOrder = () => {
    navigate('/booking');
  };

  const handleViewOrder = (orderId) => {
    navigate(`/owner/orders/${orderId}`);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await ordersAPI.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        toast.success('Order status updated');
        loadOrders(); // Refresh orders
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-red-100 text-red-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      in_progress: 'In Progress',
      ready: 'Ready',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return texts[status?.toLowerCase()] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✓',
      in_progress: '🧺',
      ready: '✨',
      delivered: '✅',
      cancelled: '❌'
    };
    return icons[status?.toLowerCase()] || '📦';
  };

  const filteredOrders = orders.filter(order => 
    order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.service_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const stats = {
    total_orders: orders.length,
    pending_orders: orders.filter(o => o.status === 'pending').length,
    confirmed_orders: orders.filter(o => o.status === 'confirmed').length,
    in_progress_orders: orders.filter(o => o.status === 'in_progress').length,
    ready_orders: orders.filter(o => o.status === 'ready').length,
    delivered_orders: orders.filter(o => o.status === 'delivered').length,
    cancelled_orders: orders.filter(o => o.status === 'cancelled').length,
    total_revenue: orders.reduce((sum, o) => {
      const amount = parseFloat(o.total_amount) || 0;
      return sum + amount;
    }, 0)
  };

  const handleLogout = () => {
    apiUtils.clearAuthData();
    toast.success('Logged out successfully');
    navigate('/login');
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
    <div className="min-h-screen bg-[#f6f8f6] text-[#111813] flex">
      {/* Side Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2bee6c] to-[#1fa84d] rounded-full flex items-center justify-center text-white font-bold">
            CM
          </div>
          <div>
            <h2 className="font-bold">Cleanzy Mart</h2>
            <p className="text-xs text-gray-500">Owner Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {/* Dashboard */}
          <button
            onClick={() => handleNavigation('dashboard', '/owner-dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'dashboard' ? 'bg-[#2bee6c]/20 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">📊</span>
            <span className="text-sm font-medium">Dashboard</span>
          </button>

          {/* Orders */}
          <button
            onClick={() => handleNavigation('orders', '/owner/orders')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'orders' ? 'bg-[#2bee6c]/20 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">🛒</span>
            <span className="text-sm font-medium">Orders</span>
            {stats.pending_orders > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.pending_orders}
              </span>
            )}
          </button>

          {/* Customers */}
          <button
            onClick={() => handleNavigation('customers', '/owner/customers')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'customers' ? 'bg-[#2bee6c]/20 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">👥</span>
            <span className="text-sm font-medium">Customers</span>
          </button>

          {/* Pricing */}
          <button
            onClick={() => handleNavigation('pricing', '/owner/pricing')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'pricing' ? 'bg-[#2bee6c]/20 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">💰</span>
            <span className="text-sm font-medium">Pricing</span>
          </button>

          {/* Reports */}
          <button
            onClick={() => handleNavigation('reports', '/owner/reports')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'reports' ? 'bg-[#2bee6c]/20 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">📈</span>
            <span className="text-sm font-medium">Reports</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => handleNavigation('settings', '/owner/settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'settings' ? 'bg-[#2bee6c]/20 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">⚙️</span>
            <span className="text-sm font-medium">Settings</span>
          </button>

          {/* Invite Owner */}
          <button
            onClick={() => navigate('/owner/invite')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/owner/invite' ? 'bg-[#2bee6c]/20 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl">📧</span>
            <span className="text-sm font-medium">Invite Owner</span>
          </button>
        </nav>

        <div className="mt-auto space-y-2 pt-4 border-t">
          <button
            onClick={handleAddOrder}
            className="w-full px-4 py-2 bg-[#2bee6c] text-white rounded-lg hover:bg-[#25d45f] transition-colors text-sm font-medium"
          >
            + New Order
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Owner Dashboard</h1>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
                />
              </div>

              {/* Invite Button */}
              <button
                onClick={() => navigate('/owner/invite')}
                className="px-4 py-2 bg-[#2bee6c] text-white rounded-lg hover:bg-[#25d45f] flex items-center gap-2"
              >
                <span>📧</span>
                <span className="hidden md:inline">Invite Owner</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={loadOrders}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <span>🔄</span> Refresh
              </button>

              {/* User Menu */}
              <div className="relative group">
                <button className="w-10 h-10 bg-gradient-to-br from-[#2bee6c] to-[#1fa84d] rounded-full text-white font-bold">
                  {user?.fullName?.charAt(0) || 'O'}
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 border">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-semibold">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => navigate('/profile')}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    👤 Profile
                  </button>
                  <button
                    onClick={() => navigate('/owner/settings')}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    ⚙️ Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Owner'}! 👋
            </h2>
            <p className="text-gray-600">Here's what's happening with your business today</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Total Orders</span>
                <span className="text-2xl text-blue-600">📦</span>
              </div>
              <p className="text-3xl font-bold">{stats.total_orders}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Pending</span>
                <span className="text-2xl text-red-600">⏳</span>
              </div>
              <p className="text-3xl font-bold text-red-600">{stats.pending_orders}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">In Progress</span>
                <span className="text-2xl text-yellow-600">🧺</span>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{stats.in_progress_orders}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Revenue</span>
                <span className="text-2xl text-green-600">💰</span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                LKR {stats.total_revenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <button
                onClick={() => handleQuickAction('/owner/reports?period=today')}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#2bee6c] hover:bg-[#2bee6c]/5 transition-all text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</div>
                <p className="text-sm font-medium">Today's Report</p>
              </button>

              <button
                onClick={() => handleQuickAction('/owner/orders')}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#2bee6c] hover:bg-[#2bee6c]/5 transition-all text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📋</div>
                <p className="text-sm font-medium">All Orders</p>
              </button>

              <button
                onClick={() => handleQuickAction('/owner/customers')}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#2bee6c] hover:bg-[#2bee6c]/5 transition-all text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                <p className="text-sm font-medium">Customers</p>
              </button>

              <button
                onClick={() => handleQuickAction('/owner/pricing')}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#2bee6c] hover:bg-[#2bee6c]/5 transition-all text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💰</div>
                <p className="text-sm font-medium">Update Pricing</p>
              </button>

              {/* Invite Owner Button */}
              <button
                onClick={() => handleQuickAction('/owner/invite')}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#2bee6c] hover:bg-[#2bee6c]/5 transition-all text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📧</div>
                <p className="text-sm font-medium">Invite Owner</p>
              </button>
            </div>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            {['pending', 'confirmed', 'in_progress', 'ready', 'delivered', 'cancelled'].map((status) => {
              const count = orders.filter(o => o.status === status).length;
              const colors = {
                pending: 'bg-red-50 border-red-200 text-red-700',
                confirmed: 'bg-blue-50 border-blue-200 text-blue-700',
                in_progress: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                ready: 'bg-purple-50 border-purple-200 text-purple-700',
                delivered: 'bg-green-50 border-green-200 text-green-700',
                cancelled: 'bg-gray-50 border-gray-200 text-gray-700'
              };
              
              return (
                <div 
                  key={status} 
                  className={`${colors[status]} border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => navigate(`/owner/orders?status=${status}`)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{getStatusText(status)}</span>
                    <span className="text-lg">{getStatusIcon(status)}</span>
                  </div>
                  <p className="text-xl font-bold mt-1">{count}</p>
                </div>
              );
            })}
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold">Recent Orders</h3>
              <button 
                onClick={() => navigate('/owner/orders')}
                className="text-sm text-[#2bee6c] hover:underline"
              >
                View All Orders →
              </button>
            </div>
            
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🧺</div>
                <p className="text-gray-500 text-lg">No orders found</p>
                {searchQuery && (
                  <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">#{order.order_number}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium">{order.customer_name}</p>
                            <p className="text-xs text-gray-500">{order.customer_phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{order.service_name}</td>
                        <td className="px-6 py-4 text-sm font-medium text-[#2bee6c]">
                          LKR {(parseFloat(order.total_amount) || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(order.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewOrder(order.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;