import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, servicesAPI, apiUtils } from '../services/api';  // Fixed import path
import toast from 'react-hot-toast';

const Booking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    serviceId: '',
    serviceName: '',
    quantity: 2.5, // Default quantity in kg
    totalAmount: 0,
    pickupDate: '',
    pickupTime: '',
    address: '',
    specialInstructions: ''
  });

  // Fetch available services from backend
  useEffect(() => {
    loadServices();
    
    // Load user address from localStorage
    const user = apiUtils.getCurrentUserFromStorage();
    if (user?.address) {
      setFormData(prev => ({ ...prev, address: user.address }));
    }
  }, []);

  const loadServices = async () => {
    try {
      const response = await servicesAPI.getAllServices();
      if (response.success) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    }
  };

  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM'
  ];

  // Calculate total amount when service or quantity changes
  useEffect(() => {
    if (formData.serviceId && formData.quantity) {
      const selectedService = services.find(s => s.id === parseInt(formData.serviceId));
      if (selectedService) {
        const amount = selectedService.price_per_unit * parseFloat(formData.quantity);
        setFormData(prev => ({ 
          ...prev, 
          totalAmount: amount,
          serviceName: selectedService.name
        }));
      }
    }
  }, [formData.serviceId, formData.quantity, services]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 3) {
      await createOrder();
    } else {
      // Validate current step
      if (step === 1 && !formData.serviceId) {
        toast.error('Please select a service');
        return;
      }
      if (step === 2) {
        if (!formData.pickupDate) {
          toast.error('Please select a pickup date');
          return;
        }
        if (!formData.pickupTime) {
          toast.error('Please select a pickup time');
          return;
        }
        if (!formData.address) {
          toast.error('Please enter delivery address');
          return;
        }
      }
      setStep(step + 1);
    }
  };

  const createOrder = async () => {
  setLoading(true);
  
  try {
    // Validate token
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    // Prepare order data for backend
    const orderData = {
      serviceId: parseInt(formData.serviceId),
      quantity: parseFloat(formData.quantity),
      totalAmount: parseFloat(formData.totalAmount),
      specialInstructions: formData.specialInstructions || '',
      pickupAddress: formData.address,
      deliveryAddress: formData.address
    };

    console.log('📤 Creating order:', orderData);

    // Call API to create order
    const response = await ordersAPI.createOrder(orderData);
    
    console.log('📥 Order response:', response);

    if (response.success) {
      toast.success('Order created! Proceed to payment...');
      
      // Navigate to checkout with order details
      navigate('/checkout', { 
        state: { 
          orderId: response.data.order.id,
          orderNumber: response.data.order.order_number,
          totalAmount: formData.totalAmount,
          serviceName: formData.serviceName,
          quantity: formData.quantity,
          address: formData.address,
          pickupDate: formData.pickupDate,
          pickupTime: formData.pickupTime
        }
      });
    } else {
      toast.error(response.error || 'Failed to create order');
    }
  } catch (error) {
    console.error('❌ Order creation error:', error);
    toast.error(error.message || 'Failed to create order. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/dashboard');
    }
  };

  // Get min date for pickup (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-[#f6f8f6]">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-xl font-bold text-[#2bee6c]">Cleanzy Mart</span>
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-700 hover:text-[#2bee6c] transition-colors"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex justify-between mb-12">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
                ${step >= num ? 'bg-[#2bee6c]' : 'bg-gray-300'}`}>
                {num}
              </div>
              <span className="mt-2 text-sm font-medium">
                {num === 1 && 'Service'}
                {num === 2 && 'Schedule'}
                {num === 3 && 'Confirm'}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose a Service</h2>
              <div className="space-y-4">
                {services.map((service) => (
                  <div 
                    key={service.id} 
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${formData.serviceId === service.id.toString() 
                        ? 'border-[#2bee6c] bg-[#2bee6c]/5' 
                        : 'border-gray-200 hover:border-[#2bee6c]'}`}
                    onClick={() => setFormData({...formData, serviceId: service.id.toString()})}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="service"
                        value={service.id}
                        checked={formData.serviceId === service.id.toString()}
                        onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                        className="w-5 h-5 text-[#2bee6c] focus:ring-[#2bee6c]"
                        required
                      />
                      <div className="ml-3">
                        <label className="text-lg font-semibold text-gray-800 cursor-pointer">
                          {service.name}
                        </label>
                        <p className="text-sm text-gray-500">{service.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[#2bee6c] font-bold">LKR {service.price_per_unit}</span>
                      <p className="text-xs text-gray-500">per {service.unit}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quantity selector */}
              {formData.serviceId && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2bee6c] focus:border-transparent"
                  />
                  {formData.totalAmount > 0 && (
                    <p className="mt-2 text-sm">
                      Total: <span className="font-bold text-[#2bee6c]">LKR {formData.totalAmount.toFixed(2)}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Schedule Pickup</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2bee6c] focus:border-transparent"
                    min={getMinDate()}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Time Slot <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData({...formData, pickupTime: slot})}
                        className={`px-4 py-3 border-2 rounded-lg text-center transition-all ${
                          formData.pickupTime === slot 
                            ? 'border-[#2bee6c] bg-[#2bee6c]/10 text-[#2bee6c] font-medium' 
                            : 'border-gray-200 hover:border-[#2bee6c]'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2bee6c] focus:border-transparent"
                    placeholder="Enter your complete address"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Booking</h2>
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-semibold">{formData.serviceName}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{formData.quantity} kg</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-600">Pickup Date:</span>
                    <span className="font-semibold">{new Date(formData.pickupDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-600">Pickup Time:</span>
                    <span className="font-semibold">{formData.pickupTime}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-semibold text-right max-w-[300px]">{formData.address}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-gray-800 font-bold">Total Amount:</span>
                    <span className="text-[#2bee6c] font-bold text-xl">LKR {formData.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2bee6c] focus:border-transparent"
                  placeholder="Any special instructions for your laundry? (e.g., use fragrance-free detergent, delicate handling, etc.)"
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 bg-[#2bee6c] text-white font-semibold rounded-lg hover:bg-[#25d45f] transition-colors flex items-center gap-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⚪</span>
                  <span>Processing...</span>
                </>
              ) : (
                <span>{step === 3 ? 'Confirm Booking' : 'Continue'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;