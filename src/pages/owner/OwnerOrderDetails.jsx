import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI, apiUtils } from '../../services/api';
import toast from 'react-hot-toast';

const OwnerOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      // Get all orders and find the one with matching id
      const response = await ordersAPI.getOwnerOrders();
      if (response.success) {
        const foundOrder = response.data.orders.find(o => o.id === parseInt(id));
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          toast.error('Order not found');
          navigate('/owner/orders');
        }
      }
    } catch (error) {
      console.error('Load order error:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await ordersAPI.updateOrderStatus(order.id, newStatus);
      if (response.success) {
        toast.success('Order status updated');
        loadOrderDetails();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Format currency function
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return 'LKR ' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2bee6c; padding-bottom: 20px; }
            .logo { color: #2bee6c; font-size: 32px; font-weight: bold; }
            .details { margin: 30px 0; }
            .row { display: flex; padding: 10px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; width: 150px; }
            .value { flex: 1; }
            .total { margin-top: 30px; padding: 20px; background: #f8f8f8; border-radius: 8px; text-align: right; font-size: 24px; font-weight: bold; color: #2bee6c; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Cleanzy Mart</div>
            <p>Invoice #${order.order_number}</p>
          </div>
          
          <div class="details">
            <div class="row"><span class="label">Customer:</span><span class="value">${order.customer_name}</span></div>
            <div class="row"><span class="label">Email:</span><span class="value">${order.customer_email}</span></div>
            <div class="row"><span class="label">Phone:</span><span class="value">${order.customer_phone}</span></div>
            <div class="row"><span class="label">Service:</span><span class="value">${order.service_name}</span></div>
            <div class="row"><span class="label">Quantity:</span><span class="value">${order.quantity || 'N/A'} kg</span></div>
            <div class="row"><span class="label">Amount:</span><span class="value">${formatCurrency(order.total_amount)}</span></div>
            <div class="row"><span class="label">Status:</span><span class="value">${order.status}</span></div>
            <div class="row"><span class="label">Pickup Address:</span><span class="value">${order.pickup_address}</span></div>
            <div class="row"><span class="label">Delivery Address:</span><span class="value">${order.delivery_address}</span></div>
            <div class="row"><span class="label">Date:</span><span class="value">${new Date(order.created_at).toLocaleString()}</span></div>
          </div>
          
          <div class="total">
            Total: ${formatCurrency(order.total_amount)}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bee6c]"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/owner/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Orders"
          >
            <span className="text-2xl">←</span>
          </button>
          <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
        </div>
        <button
          onClick={handlePrintInvoice}
          className="px-4 py-2 bg-[#2bee6c] text-white rounded-lg hover:bg-[#25d45f] flex items-center gap-2"
        >
          <span>🖨️</span> Print Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">#{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{order.service_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">{order.quantity || 'N/A'} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-[#2bee6c]">{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                className="px-3 py-1 border rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-medium">{apiUtils.formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Customer Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{order.customer_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{order.customer_phone}</span>
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Address Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 mb-1">Pickup Address:</p>
              <p className="font-medium">{order.pickup_address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Delivery Address:</p>
              <p className="font-medium">{order.delivery_address || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerOrderDetails;