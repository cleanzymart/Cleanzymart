import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Update the import path based on your project structure
import { authAPI, healthCheck } from '../../services/api'; // Add healthCheck

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');
  const navigate = useNavigate();

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      await healthCheck(); // Use healthCheck directly
      setBackendStatus('online');
    } catch (error) {
      console.warn('Backend is offline or not reachable');
      setBackendStatus('offline');
    }
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score === 0) return '';
    if (score === 1) return 'Very Weak';
    if (score === 2) return 'Weak';
    if (score === 3) return 'Good';
    return 'Strong';
  };

  const getPasswordStrengthColor = () => {
    switch(passwordStrength) {
      case 'Very Weak': return 'text-red-500';
      case 'Weak': return 'text-orange-500';
      case 'Good': return 'text-yellow-500';
      case 'Strong': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const response = await authAPI.signup(
        formData.fullName,
        formData.email,
        formData.password,
        formData.confirmPassword
      );
      
      if (response.success) {
        console.log('Signup successful:', response.data.user);
        // Redirect to login with success message
        navigate('/login', { 
          state: { message: 'Account created successfully! Please login.' }
        });
      } else {
        if (response.errors) {
          setErrors(response.errors);
        } else {
          setErrors({ 
            submit: response.error || 'Signup failed. Please try again.' 
          });
        }
      }
    } catch (error) {
      console.error('Signup error details:', error);
      
      if (error.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ 
          submit: error.message || 'Signup failed. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8f6]">
  <div className="flex h-full grow flex-col">
    <main className="flex flex-1 items-stretch">
      <div className="flex-1 lg:grid lg:grid-cols-2">
        {/* Left Side - Image Section */}
        <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-emerald-50 to-cyan-50">
          <div className="flex flex-col items-center text-center max-w-md">
            {/* Professional Laundry Service Image */}
            <div className="relative w-72 h-72 rounded-2xl overflow-hidden shadow-2xl mb-8 group">
              <img 
                src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGF1bmRyeSUyMHNlcnZpY2V8ZW58MHx8MHx8fDA%3D" 
                alt="Professional laundry service with clean clothes"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <h2 className="text-3xl font-bold mt-6 text-gray-900 leading-tight">
              Fresh laundry, delivered to your door
            </h2>
            <p className="text-gray-600 mt-4 text-lg leading-relaxed">
              Join Cleanzy Mart today and experience the convenience of on-demand laundry and dry-cleaning services.
            </p>
          </div>
        </div>

            {/* Right Side - Form Section */}
            <div className="w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col max-w-md w-full space-y-8">
                {/* Header */}
                <div>
                  <div className="inline-flex items-center justify-center gap-2 mb-4">
                    <div className="w-6 h-6 text-[#2bee6c]">
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"></path>
                  <path clipRule="evenodd" fillRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z"></path>
                </svg>
              </div>
                    <h1 className="text-3xl font-bold text-[#004A66]">Cleanzy Mart</h1>
                  </div>
                  
                  {/* Backend Status */}
                  {backendStatus === 'offline' && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-700 text-sm text-center">
                        ⚠️ Backend server is offline. Running in demo mode.
                      </p>
                    </div>
                  )}
                  
                  <h2 className="text-[#111813] tracking-tight text-[32px] font-bold leading-tight text-center">
                    Get Started with Cleanzy Mart
                  </h2>
                  <p className="mt-2 text-center text-sm text-slate-600">
                    Create an account to start your journey to cleaner clothes.
                  </p>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      ❌ {errors.submit}
                    </div>
                  )}

                  <div className="space-y-4 rounded-md">
                    {/* Full Name Field */}
                    <div>
                      <label className="flex flex-col w-full">
                        <p className="text-[#111813] text-base font-medium leading-normal pb-2">
                          Full Name
                        </p>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className={`flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111813] focus:outline-0 focus:ring-2 focus:ring-[#2bee6c]/50 border ${
                            errors.fullName ? 'border-red-500' : 'border-[#dbe6df]'
                          } bg-white focus:border-[#2bee6c] h-14 placeholder:text-slate-400 p-[15px] text-base font-normal leading-normal transition-all duration-200`}
                          placeholder="Enter your full name"
                          disabled={loading}
                        />
                        {errors.fullName && (
                          <p className="text-red-500 text-sm mt-1">⚠️ {errors.fullName}</p>
                        )}
                      </label>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="flex flex-col w-full">
                        <p className="text-[#111813] text-base font-medium leading-normal pb-2">
                          Email Address
                        </p>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111813] focus:outline-0 focus:ring-2 focus:ring-[#2bee6c]/50 border ${
                            errors.email ? 'border-red-500' : 'border-[#dbe6df]'
                          } bg-white focus:border-[#2bee6c] h-14 placeholder:text-slate-400 p-[15px] text-base font-normal leading-normal transition-all duration-200`}
                          placeholder="Enter your email address"
                          disabled={loading}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">⚠️ {errors.email}</p>
                        )}
                      </label>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className="flex flex-col w-full">
                        <p className="text-[#111813] text-base font-medium leading-normal pb-2">
                          Password
                        </p>
                        <div className="relative flex w-full flex-1 items-stretch">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111813] focus:outline-0 focus:ring-2 focus:ring-[#2bee6c]/50 border ${
                              errors.password ? 'border-red-500' : 'border-[#dbe6df]'
                            } bg-white focus:border-[#2bee6c] h-14 placeholder:text-slate-400 p-[15px] pr-12 text-base font-normal leading-normal transition-all duration-200`}
                            placeholder="Enter your password"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            disabled={loading}
                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                          >
                            {showPassword ? '🙈' : '👁️'}
                          </button>
                        </div>
                        {passwordStrength && (
                          <p className={`text-sm mt-1 ${getPasswordStrengthColor()}`}>
                            Password strength: {passwordStrength}
                          </p>
                        )}
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-1">⚠️ {errors.password}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                          Must be at least 6 characters long
                        </p>
                      </label>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label className="flex flex-col w-full">
                        <p className="text-[#111813] text-base font-medium leading-normal pb-2">
                          Confirm Password
                        </p>
                        <div className="relative flex w-full flex-1 items-stretch">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111813] focus:outline-0 focus:ring-2 focus:ring-[#2bee6c]/50 border ${
                              errors.confirmPassword ? 'border-red-500' : 'border-[#dbe6df]'
                            } bg-white focus:border-[#2bee6c] h-14 placeholder:text-slate-400 p-[15px] pr-12 text-base font-normal leading-normal transition-all duration-200`}
                            placeholder="Confirm your password"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            disabled={loading}
                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                          >
                            {showConfirmPassword ? '🙈' : '👁️'}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">⚠️ {errors.confirmPassword}</p>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      className="h-4 w-4 text-[#2bee6c] focus:ring-[#2bee6c] border-gray-300 rounded mt-1"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-500">
                      I agree to the{' '}
                      <Link to="/terms" className="text-[#2bee6c] hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-[#2bee6c] hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Sign Up Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative flex w-full justify-center rounded-lg border border-transparent bg-[#2bee6c] px-4 py-3.5 text-base font-semibold text-black hover:bg-[#2bee6c]/90 focus:outline-none focus:ring-2 focus:ring-[#2bee6c] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                          Creating Account...
                        </div>
                      ) : (
                        'Sign Up'
                      )}
                    </button>
                  </div>
                </form>

                {/* Login Link */}
                <div className="text-center text-sm">
                  <p className="text-slate-600">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="font-medium text-[#2bee6c] hover:text-[#2bee6c]/90 ml-1"
                    >
                      Log in
                    </Link>
                  </p>
                </div>

                {/* Debug Info */}
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-600 text-xs text-center">
                    <strong>Backend Status:</strong> {backendStatus === 'checking' ? 'Checking...' : backendStatus === 'online' ? '✅ Connected' : '❌ Offline'} |
                    <strong> API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Signup;