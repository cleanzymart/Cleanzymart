import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    checkAuthentication();
    loadOrders();
    loadStats();
  }, [filter]);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      navigate('/login');
      return false;
    }
    return true;
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getUserOrders();
      
      if (response.success) {
        setOrders(response.data.orders || []);
      } else {
        toast.error('Failed to load orders');
        // Fallback to mock data for demo
        setOrders(getMockOrders());
      }
    } catch (error) {
      console.error('Load orders error:', error);
      toast.error('Failed to load orders');
      setOrders(getMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await ordersAPI.getOrderStats();
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const getMockOrders = () => {
    return [
      {
        id: 1,
        order_number: 'CZM-2024-001',
        service_name: 'Wash & Fold',
        total_amount: 1250.00,
        status: 'delivered',
        created_at: '2024-01-15T10:00:00Z',
        pickup_time: '2024-01-15T16:00:00Z',
        delivery_time: '2024-01-16T18:00:00Z',
        quantity: 5.0
      },
      {
        id: 2,
        order_number: 'CZM-2024-002',
        service_name: 'Dry Cleaning',
        total_amount: 1000.00,
        status: 'ready',
        created_at: '2024-01-16T14:00:00Z',
        pickup_time: '2024-01-16T14:00:00Z',
        quantity: 2.0
      }
    ];
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'in_progress': return 'In Progress';
      case 'ready': return 'Ready for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getProgressPercentage = (status) => {
    switch(status) {
      case 'pending': return 10;
      case 'confirmed': return 30;
      case 'in_progress': return 60;
      case 'ready': return 90;
      case 'delivered': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'confirmed', 'in_progress', 'ready'].includes(order.status);
    return order.status === filter;
  });

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      const response = await ordersAPI.cancelOrder(orderId);
      if (response.success) {
        toast.success('Order cancelled successfully');
        loadOrders(); // Refresh orders list
      } else {
        toast.error(response.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      toast.error('Failed to cancel order');
    }
  };

  const handleReorder = async (order) => {
    try {
      const newOrderData = {
        serviceId: order.service_id,
        quantity: order.quantity,
        pickupAddress: order.pickup_address,
        deliveryAddress: order.delivery_address
      };
      
      const response = await ordersAPI.createOrder(newOrderData);
      if (response.success) {
        toast.success('Order placed successfully!');
        navigate('/orders');
      } else {
        toast.error(response.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Reorder error:', error);
      toast.error('Failed to place order');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bee6c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8f6]">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
           <div className="flex items-center gap-4 text-[#111813]">
            {/* Logo */}
            <div className="w-6 h-6 text-[#2bee6c]">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"></path>
                <path clipRule="evenodd" fillRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236Z"></path>
              </svg>
            </div>
            <h2 className="text-[#111813] text-lg font-bold leading-tight tracking-[-0.015em]">
            <a href="/Home">Cleanzy Mart</a>
            </h2>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-[#2bee6c]">Dashboard</Link>
              <Link to="/booking">
                <Button variant="primary">
                  New Order
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-600">View and manage your laundry orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-[#2bee6c] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'active' 
                  ? 'bg-[#2bee6c] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({orders.filter(o => ['pending', 'confirmed', 'in_progress', 'ready'].includes(o.status)).length})
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'delivered' 
                  ? 'bg-[#2bee6c] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({orders.filter(o => o.status === 'delivered').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'cancelled' 
                  ? 'bg-[#2bee6c] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled ({orders.filter(o => o.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🧺</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You haven't placed any orders yet." 
                  : `You don't have any ${filter} orders.`}
              </p>
              <Link to="/booking">
                <Button variant="primary" size="large">
                  Book Your First Service
                </Button>
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">Order #{order.order_number}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-gray-600">{order.service_name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Ordered: {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#2bee6c]">LKR {order.total_amount?.toLocaleString() || '0'}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {order.quantity} {order.unit || 'kg'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  {/* Progress Bar */}
                  {['pending', 'confirmed', 'in_progress', 'ready'].includes(order.status) && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Order Progress</span>
                        <span>{getProgressPercentage(order.status)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-[#2bee6c] h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${getProgressPercentage(order.status)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Schedule Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pickup Time</p>
                      <p className="font-medium">
                        {order.pickup_time ? formatDate(order.pickup_time) : 'To be scheduled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Delivery Time</p>
                      <p className="font-medium">
                        {order.delivery_time ? formatDate(order.delivery_time) : 'To be scheduled'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      View Details
                    </Button>
                    
                    {['pending', 'confirmed'].includes(order.status) && (
                      <Button
                        variant="danger"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Order
                      </Button>
                    )}
                    
                    {order.status === 'ready' && (
                      <Button variant="primary">
                        Schedule Delivery
                      </Button>
                    )}
                    
                    {order.status === 'delivered' && (
                      <Button
                        variant="outline"
                        onClick={() => handleReorder(order)}
                      >
                        Reorder
                      </Button>
                    )}
                    
                    <Button variant="ghost">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Statistics */}
        {stats && (
          <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-3xl font-bold text-[#2bee6c] mb-2">
                  {stats.total_orders || 0}
                </div>
                <p className="text-gray-600">Total Orders</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.delivered_orders || 0}
                </div>
                <p className="text-gray-600">Completed</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {(stats.pending_orders || 0) + (stats.confirmed_orders || 0) + (stats.in_progress_orders || 0)}
                </div>
                <p className="text-gray-600">Active</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  LKR {(stats.total_revenue || 0).toLocaleString()}
                </div>
                <p className="text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;