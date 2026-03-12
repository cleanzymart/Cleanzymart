import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesAPI, apiUtils } from '../../services/api';
import toast from 'react-hot-toast';

const OwnerPricing = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getAllServices();
      if (response.success) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error('Load services error:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // Format currency function
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return 'LKR ' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      price_per_unit: service.price_per_unit,
      description: service.description,
      unit: service.unit,
      category: service.category
    });
  };

  const handleUpdate = async (id) => {
    try {
      const response = await servicesAPI.updateService(id, editForm);
      if (response.success) {
        toast.success('Service updated');
        setEditingId(null);
        loadServices();
      }
    } catch (error) {
      toast.error('Failed to update service');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const response = await servicesAPI.deleteService(id);
      if (response.success) {
        toast.success('Service deleted');
        loadServices();
      }
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <span className="text-2xl">←</span>
          </button>
          <h1 className="text-2xl font-bold">Pricing Management</h1>
        </div>
        <button
          onClick={() => navigate('/owner/pricing/add')}
          className="px-4 py-2 bg-[#2bee6c] text-white rounded-lg hover:bg-[#25d45f]"
        >
          + Add Service
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                {editingId === service.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={editForm.price_per_unit}
                        onChange={(e) => setEditForm({...editForm, price_per_unit: e.target.value})}
                        className="w-24 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={editForm.unit}
                        onChange={(e) => setEditForm({...editForm, unit: e.target.value})}
                        className="px-2 py-1 border rounded"
                      >
                        <option value="kg">kg</option>
                        <option value="item">item</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        className="px-2 py-1 border rounded"
                      >
                        <option value="wash_fold">Wash & Fold</option>
                        <option value="dry_clean">Dry Cleaning</option>
                        <option value="ironing">Ironing</option>
                        <option value="special">Special Items</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleUpdate(service.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 font-medium">{service.name}</td>
                    <td className="px-6 py-4">{service.description}</td>
                    <td className="px-6 py-4 font-medium text-[#2bee6c]">
                      {formatCurrency(service.price_per_unit)}
                    </td>
                    <td className="px-6 py-4">{service.unit}</td>
                    <td className="px-6 py-4">{service.category}</td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Show message if no services */}
        {services.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No services found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerPricing;