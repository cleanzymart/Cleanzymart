import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import Home from './pages/Home';
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import AboutUs from './pages/AboutUs';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Pricing from './pages/Pricing';
import HowItWorks from './pages/HowItWorks';
import Checkout from './pages/Checkout';
import CardDetailsModal from './components/payment/CardDetailsModal';
import OrderConfirmation from './pages/OrderConfirmation';
import ContactUs from './pages/ContactUs'
import OwnerOrders from './pages/owner/OwnerOrders';
import OwnerCustomers from './pages/owner/OwnerCustomers';
import OwnerPricing from './pages/owner/OwnerPricing';
import OwnerReports from './pages/owner/OwnerReports';
import OwnerSettings from './pages/owner/OwnerSettings';
import OwnerOrderDetails from './pages/owner/OwnerOrderDetails';
import InviteOwner from './pages/owner/InviteOwner';
import AcceptInvite from './pages/auth/AcceptInvite';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, role = 'customer' }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
      const userData = JSON.parse(user);
      // In a real app, user role would come from API/token
      setUserRole(userData.role || 'customer');
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8f6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bee6c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }


  // Check role-based access
  if (role && userRole !== role) {
    if (userRole === 'owner') {
      return <Navigate to="/owner-dashboard" />;
    }
    return <Navigate to="/dashboard" />;
  }

  return children;
};


// Public Only Route (for login/signup when already logged in)
const PublicOnlyRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Check if user is owner or customer
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role === 'owner') {
        return <Navigate to="/owner-dashboard" />;
      }
    }
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path='/CardDetailsModal' element={<CardDetailsModal/>} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/forgot-password" element={<ForgotPassword/>} />
            <Route path="/owner/orders" element={<OwnerOrders />} />
            <Route path="/owner/orders/:id" element={<OwnerOrderDetails />} />
            <Route path="/owner/customers" element={<OwnerCustomers />} />
            <Route path="/owner/pricing" element={<OwnerPricing />} />
            <Route path="/owner/reports" element={<OwnerReports />} />
            <Route path="/owner/settings" element={<OwnerSettings />} />
            <Route path="/owner/invite" element={<InviteOwner />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />

            
            {/* Auth Routes (Public Only) */}
            <Route 
              path="/login" 
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicOnlyRoute>
                  <Signup />
                </PublicOnlyRoute>
              } 
            />
            
            {/* Protected Customer Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute role="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute role="customer">
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute role="customer">
                  <Orders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/booking" 
              element={
                <ProtectedRoute role="customer">
                  <Booking />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Owner Routes */}
            <Route 
              path="/owner-dashboard" 
              element={
                <ProtectedRoute role="owner">
                  <OwnerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#2bee6c',
              secondary: '#102216',
            },
            style: {
              background: '#2bee6c',
              color: '#102216',
              fontWeight: 'bold',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;