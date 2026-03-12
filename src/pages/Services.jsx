import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { servicesAPI } from '../services/api';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getAllServices();
      
      if (response.success) {
        setServices(response.data.services || []);
      } else {
        toast.error('Failed to load services');
        // Fallback to mock data for demo
        setServices(getMockServices());
      }
    } catch (error) {
      console.error('Load services error:', error);
      toast.error('Failed to load services');
      setServices(getMockServices());
    } finally {
      setLoading(false);
    }
  };

  const getMockServices = () => {
    return [
      {
        id: 1,
        name: 'Wash & Fold',
        description: 'Regular laundry service - wash, dry, and fold your clothes',
        category: 'wash_fold',
        price_per_unit: 250.00,
        unit: 'kg',
        estimated_time_hours: 24,
        image_url: '/images/wash-fold.jpg'
      },
      {
        id: 2,
        name: 'Dry Cleaning',
        description: 'Professional dry cleaning for delicate fabrics',
        category: 'dry_clean',
        price_per_unit: 500.00,
        unit: 'item',
        estimated_time_hours: 48,
        image_url: '/images/dry-cleaning.jpg'
      },
      {
        id: 3,
        name: 'Ironing',
        description: 'Professional ironing service',
        category: 'ironing',
        price_per_unit: 100.00,
        unit: 'item',
        estimated_time_hours: 12,
        image_url: '/images/ironing.jpg'
      },
      {
        id: 4,
        name: 'Special Items',
        description: 'Cleaning for special items like curtains, blankets',
        category: 'special',
        price_per_unit: 800.00,
        unit: 'item',
        estimated_time_hours: 72,
        image_url: '/images/special.jpg'
      }
    ];
  };

  const getCategoryName = (category) => {
    switch(category) {
      case 'wash_fold': return 'Wash & Fold';
      case 'dry_clean': return 'Dry Cleaning';
      case 'ironing': return 'Ironing';
      case 'special': return 'Special Items';
      default: return category;
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'wash_fold': return '🧺';
      case 'dry_clean': return '👔';
      case 'ironing': return '♨️';
      case 'special': return '⭐';
      default: return '🧼';
    }
  };

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Services', icon: '🧼' },
    { id: 'wash_fold', name: 'Wash & Fold', icon: '🧺' },
    { id: 'dry_clean', name: 'Dry Cleaning', icon: '👔' },
    { id: 'ironing', name: 'Ironing', icon: '♨️' },
    { id: 'special', name: 'Special Items', icon: '⭐' }
  ];

  const handleBookService = (service) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to book services');
      navigate('/login', { state: { redirectTo: '/booking', serviceId: service.id } });
      return;
    }
    navigate('/booking', { state: { serviceId: service.id } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bee6c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
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
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-[#004A66]">Cleanzy Mart</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-[#2bee6c]">Home</Link>
              <Link to="/dashboard" className="text-gray-700 hover:text-[#2bee6c]">Dashboard</Link>
              <Link to="/login">
                <Button variant="primary">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional laundry and dry cleaning services delivered to your doorstep. 
            Choose the service that fits your needs.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[#2bee6c] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredServices.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <div className="text-6xl mb-4">🧺</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">No services found</h3>
              <p className="text-gray-600">Check back later for new services!</p>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-[#2bee6c]/20 rounded-xl flex items-center justify-center">
                      <span className="text-4xl">{getCategoryIcon(service.category)}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            service.category === 'wash_fold' ? 'bg-blue-100 text-blue-800' :
                            service.category === 'dry_clean' ? 'bg-purple-100 text-purple-800' :
                            service.category === 'ironing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {getCategoryName(service.category)}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{service.name}</h3>
                        <p className="text-gray-600 mb-4">{service.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#2bee6c]">
                          LKR {service.price_per_unit?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">per {service.unit}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Est. {service.estimated_time_hours} hours
                        </div>
                      </div>
                    </div>
                    
                    {/* Service Details */}
                    <div className="mb-6 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Unit Price</span>
                        <span className="font-medium">LKR {service.price_per_unit?.toLocaleString()} / {service.unit}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Processing Time</span>
                        <span className="font-medium">{service.estimated_time_hours} hours</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Service Type</span>
                        <span className="font-medium">{getCategoryName(service.category)}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="large"
                      fullWidth
                      onClick={() => handleBookService(service)}
                    >
                      Book This Service
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Service Benefits */}
        <div className="mt-16 bg-gradient-to-r from-[#2bee6c] to-[#004A66] rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Cleanzy Mart?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Free Pickup & Delivery</h3>
              <p className="opacity-90">We come to you at no extra cost</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold mb-2">Same-Day Service</h3>
              <p className="opacity-90">Fast turnaround for urgent needs</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
              <p className="opacity-90">Using environmentally friendly products</p>
            </div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2bee6c]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Book Online</h3>
              <p className="text-gray-600">Select service, schedule pickup, and make payment</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2bee6c]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">We Pick Up</h3>
              <p className="text-gray-600">Our team collects your laundry at scheduled time</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#2bee6c]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Fresh Delivery</h3>
              <p className="text-gray-600">Clean, folded clothes delivered back to you</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;