import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, apiUtils } from '../../services/api';
import toast from 'react-hot-toast';

const OwnerCustomers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOwnerOrders();
      if (response.success) {
        // Extract unique customers from orders
        const customerMap = new Map();
        response.data.orders.forEach(order => {
          if (!customerMap.has(order.customer_email)) {
            customerMap.set(order.customer_email, {
              id: order.user_id,
              name: order.customer_name,
              email: order.customer_email,
              phone: order.customer_phone,
              total_orders: 1,
              total_spent: order.total_amount,
              last_order: order.created_at
            });
          } else {
            const existing = customerMap.get(order.customer_email);
            existing.total_orders += 1;
            existing.total_spent += order.total_amount;
          }
        });
        setCustomers(Array.from(customerMap.values()));
      }
    } catch (error) {
      console.error('Load customers error:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // Format currency function
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return 'LKR ' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBack = () => {
    navigate('/owner-dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bee6c]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to Dashboard"
        >
          <span className="text-2xl">←</span>
        </button>
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.email} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{customer.name}</td>
                <td className="px-6 py-4">{customer.email}</td>
                <td className="px-6 py-4">{customer.phone}</td>
                <td className="px-6 py-4">{customer.total_orders}</td>
                <td className="px-6 py-4 font-medium text-[#2bee6c]">
                  {formatCurrency(customer.total_spent)}
                </td>
                <td className="px-6 py-4">{apiUtils.formatDate(customer.last_order)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Show message if no customers */}
        {filteredCustomers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No customers found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerCustomers;