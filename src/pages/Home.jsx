import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { reviewsAPI } from '../services/api';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

const slideInLeft = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const slideInRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const Home = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ 
    average_rating: 0, 
    total_reviews: 0,
    five_star: 0,
    four_star: 0,
    three_star: 0,
    two_star: 0,
    one_star: 0 
  });

  useEffect(() => {
    checkAuthStatus();
    loadReviews();
    loadStats();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewsAPI.getAllReviews();
      if (response.success) {
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await reviewsAPI.getReviewStats();
      if (response.success && response.data.stats) {
        const statsData = {
          ...response.data.stats,
          average_rating: Number(response.data.stats.average_rating) || 0,
          total_reviews: Number(response.data.stats.total_reviews) || 0
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  const handleDashboard = () => {
    if (user?.role === 'owner') {
      navigate('/owner-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const renderStars = (rating) => {
    const numRating = Number(rating) || 0;
    return [...Array(5)].map((_, index) => (
      <motion.span 
        key={index} 
        className={`text-xl ${index < numRating ? 'text-yellow-400' : 'text-gray-300'}`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.2, rotate: 5 }}
      >
        ★
      </motion.span>
    ));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#f6f8f6] text-[#111813]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* TopNavBar with Authentication */}
      <motion.header 
        className="sticky top-0 z-50 bg-[#f6f8f6]/80 backdrop-blur-sm border-b border-[#f0f4f2]"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="w-6 h-6 text-[#2bee6c]"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"></path>
                  <path clipRule="evenodd" fillRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z"></path>
                </svg>
              </motion.div>
              <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Cleanzy Mart</h2>
            </motion.div>
            
            {/* Navigation Links */}
            <motion.div 
              className="hidden md:flex flex-1 justify-center items-center gap-9"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {['Home', 'Services', 'Pricing', 'How It Works', 'Contact Us'].map((item, index) => (
                <motion.div
                  key={item}
                  variants={fadeInUp}
                  whileHover={{ y: -2, color: "#2bee6c" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-sm font-medium transition-colors"
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Authentication Section */}
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                // Show User Menu when logged in
                <div className="flex items-center gap-3">
                  {/* Dashboard Button */}
                  <motion.button
                    onClick={handleDashboard}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2bee6c] text-white text-sm font-semibold rounded-lg hover:bg-[#25d45f] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>📊</span>
                    <span className="hidden sm:inline">Dashboard</span>
                  </motion.button>

                  {/* User Profile Dropdown */}
                  <div className="relative group">
                    <motion.div 
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2bee6c] to-[#1fa84d] flex items-center justify-center text-white font-bold cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {user?.fullName?.charAt(0) || 'U'}
                    </motion.div>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 border border-gray-100">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleDashboard}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2bee6c] transition-colors"
                      >
                        <span className="mr-2">📊</span> Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span className="mr-2">🚪</span> Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Show Login button when not logged in
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/login"
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#2bee6c]/20 text-[#111813] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#2bee6c]/30 transition-colors"
                  >
                    <span className="truncate">Log In</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <main className="flex-grow">
        {/* HeroSection with Parallax Effect */}
        <motion.section 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div 
            className="min-h-[480px] flex flex-col gap-8 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center text-center px-4 py-10 md:px-10 relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170")`
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Floating bubbles animation */}
            <motion.div 
              className="absolute w-20 h-20 bg-white/10 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ top: '10%', left: '10%' }}
            />
            <motion.div 
              className="absolute w-32 h-32 bg-white/10 rounded-full"
              animate={{
                x: [0, -150, 0],
                y: [0, 100, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ bottom: '10%', right: '10%' }}
            />

            <motion.div 
              className="flex flex-col gap-4 max-w-2xl"
              variants={fadeInUp}
            >
              <motion.h1 
                className="text-white text-4xl md:text-6xl font-black leading-tight tracking-[-0.033em]"
                animate={{ 
                  textShadow: ["0 0 10px rgba(43,238,108,0.5)", "0 0 20px rgba(43,238,108,0.8)", "0 0 10px rgba(43,238,108,0.5)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Seamless Laundry & Dry-Cleaning, Delivered.
              </motion.h1>
              <motion.h2 
                className="text-white/90 text-base md:text-lg font-normal leading-normal"
                variants={fadeInUp}
              >
                Enjoy the convenience of fresh, clean clothes with our professional and reliable service, right at your doorstep.
              </motion.h2>
            </motion.div>
            
            <motion.div
              variants={scaleIn}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/signup"
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#2bee6c] text-[#102216] text-base font-bold leading-normal tracking-[0.015em] hover:brightness-110 transition-all shadow-lg relative"
              >
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute right-4"
                >
                  →
                </motion.span>
                <span className="truncate">Schedule a Pickup</span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Services Section with Card Animations */}
        <motion.section 
          id="services" 
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div className="flex flex-col gap-8">
            <motion.h2 
              className="text-3xl font-bold leading-tight tracking-[-0.015em] text-center"
              variants={fadeInUp}
            >
              Our Services
            </motion.h2>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
            >
              {[
                { icon: '🧺', title: 'Wash & Fold', desc: 'Everyday laundry, perfectly washed and folded.' },
                { icon: '👔', title: 'Dry Cleaning', desc: 'Expert care for your delicate and special garments.' },
                { icon: '♨️', title: 'Ironing', desc: 'Crisp, wrinkle-free clothes, ready to wear.' },
                { icon: '🚚', title: 'Pickup & Delivery', desc: 'Conveniently scheduled right from your home.' }
              ].map((service, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center gap-4 p-6 bg-white rounded-xl border border-[#f0f4f2] shadow-sm hover:shadow-lg transition-all cursor-pointer"
                  variants={scaleIn}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    borderColor: "#2bee6c"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div 
                    className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#2bee6c]/20 text-[#2bee6c]"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-3xl">{service.icon}</span>
                  </motion.div>
                  <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold">{service.title}</p>
                    <p className="text-sm text-[#61896f]">{service.desc}</p>
                  </div>
                  <motion.div
                    className="w-0 h-0.5 bg-[#2bee6c]"
                    whileHover={{ width: "50%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Testimonials Section with Advanced Animations */}
        <motion.section 
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white rounded-xl"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <div className="flex flex-col gap-8">
            {/* Header with stats */}
            <motion.div 
              className="text-center"
              variants={fadeInUp}
            >
              <motion.h2 
                className="text-3xl font-bold leading-tight tracking-[-0.015em]"
                animate={{ 
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                What Our Customers Say
              </motion.h2>
              
              {stats.total_reviews > 0 && (
                <motion.div 
                  className="mt-2 flex items-center justify-center gap-2 flex-wrap"
                  variants={fadeInUp}
                >
                  <motion.div 
                    className="flex"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {renderStars(Math.round(stats.average_rating))}
                  </motion.div>
                  <motion.span 
                    className="text-lg font-semibold text-gray-700"
                    whileHover={{ scale: 1.1, color: "#2bee6c" }}
                  >
                    {typeof stats.average_rating === 'number' ? stats.average_rating.toFixed(1) : '0.0'} out of 5
                  </motion.span>
                  <motion.span 
                    className="text-gray-500"
                    whileHover={{ scale: 1.1 }}
                  >
                    ({stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'})
                  </motion.span>
                </motion.div>
              )}
            </motion.div>

            {/* Reviews Grid */}
            {loading ? (
              <motion.div 
                className="text-center py-12"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bee6c] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading reviews...</p>
              </motion.div>
            ) : reviews.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={staggerContainer}
              >
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    className="flex flex-col gap-4 p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition-all relative"
                    variants={slideInLeft}
                    whileHover={{ 
                      y: -5,
                      boxShadow: "0 15px 30px rgba(43,238,108,0.15)",
                      borderColor: "#2bee6c"
                    }}
                    whileTap={{ scale: 0.98 }}
                    custom={index}
                  >
                    <motion.div 
                      className="flex items-center gap-4"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <motion.div 
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2bee6c] to-[#1fa84d] flex items-center justify-center text-white font-bold text-lg"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {getInitials(review.user_name)}
                      </motion.div>
                      <div>
                        <p className="font-bold">{review.user_name}</p>
                        <motion.div 
                          className="flex"
                          whileHover={{ scale: 1.1 }}
                        >
                          {renderStars(review.rating)}
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    <motion.p 
                      className="text-gray-600 italic"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      "{review.comment}"
                    </motion.p>
                    
                    <motion.p 
                      className="text-xs text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {formatDate(review.created_at)}
                    </motion.p>

                    {/* Animated quote mark */}
                    <motion.div
                      className="absolute bottom-2 right-2 text-4xl text-[#2bee6c]/10"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      "
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-12"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
              </motion.div>
            )}

            {/* Call to action */}
            <motion.div 
              className="text-center mt-8"
              variants={scaleIn}
              whileHover={{ scale: 1.05 }}
            >
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2bee6c] text-white font-semibold rounded-lg hover:bg-[#25d45f] transition-colors relative overflow-hidden group"
              >
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <span>Share Your Experience</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer with Animation */}
      <motion.footer 
        className="bg-white mt-16 md:mt-24 border-t border-[#f0f4f2]"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div 
              className="col-span-1 md:col-span-2"
              variants={slideInLeft}
            >
              <motion.div 
                className="flex items-center gap-2 mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="w-6 h-6 text-[#2bee6c]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"></path>
                    <path clipRule="evenodd" fillRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z"></path>
                  </svg>
                </motion.div>
                <h2 className="text-xl font-bold">Cleanzy Mart</h2>
              </motion.div>
              <p className="text-sm text-[#61896f] max-w-sm">Your one-stop solution for fresh, clean clothes. We handle your laundry with care so you can focus on what matters most.</p>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                {['About Us', 'Careers', 'Press'].map((item, index) => (
                  <motion.li 
                    key={item}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-[#2bee6c] transition-colors text-gray-600">
                      {item}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h3 className="font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-[#61896f]">
                <motion.li whileHover={{ scale: 1.05, color: "#2bee6c" }}>support@cleanzymart.com</motion.li>
                <motion.li whileHover={{ scale: 1.05, color: "#2bee6c" }}>(+94) 77-4562541</motion.li>
              </ul>
              <div className="flex space-x-4 mt-4">
                {['facebook', 'instagram'].map((social, index) => (
                  <motion.a
                    key={social}
                    className="text-[#61896f] hover:text-[#2bee6c] transition-colors"
                    href="#"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social === 'facebook' 
                        ? "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"
                        : "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"}
                      />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="mt-8 border-t border-[#f0f4f2] pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-[#61896f]"
            variants={fadeInUp}
          >
            <p>© 2025 Cleanzy Mart. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {['Terms of Service', 'Privacy Policy'].map((item) => (
                <motion.a
                  key={item}
                  className="hover:text-[#2bee6c] transition-colors cursor-pointer"
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default Home;