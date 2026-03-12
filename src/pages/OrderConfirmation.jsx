import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// No API imports needed for this file

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get order data from location state or use defaults
  const orderData = location.state || {
    orderId: '#CLZ123456',
    total: 3500.00,
    pickupTime: 'Today, 4:00 PM - 6:00 PM',
    deliveryAddress: '123 Main St, Apt 4B',
    currency: 'LKR'
  };

  const handleTrackOrder = () => {
    // Navigate to order tracking page
    navigate('/orders');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    navigate('/contact');
  };

  return (
    <div className="min-h-screen bg-[#f6f8f8] dark:bg-[#102220] text-[#111817] dark:text-gray-100 font-sans">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-[#e5e7eb] dark:border-[#2a3b39] px-6 lg:px-10 py-3 bg-white dark:bg-[#1a2e2c]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 text-[#2beede]">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor"></path>
              <path clipRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Cleanzy Mart</h2>
        </div>
        
        <div className="hidden sm:flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-9">
            <Link to="/" className="text-sm font-medium leading-normal hover:text-[#2beede] transition-colors">Home</Link>
            <Link to="/services" className="text-sm font-medium leading-normal hover:text-[#2beede] transition-colors">Services</Link>
            <Link to="/contact" className="text-sm font-medium leading-normal hover:text-[#2beede] transition-colors">Contact</Link>
          </div>
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600"></div>
        </div>
        
        <div className="sm:hidden flex items-center">
          <button className="text-[#111817] dark:text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center py-10 px-4">
        {/* Confirmation Card */}
        <div className="w-full max-w-2xl bg-white dark:bg-[#1a2e2c] rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3b39] flex flex-col items-center p-8 md:p-12 animate-fade-in-up">
          {/* Success Icon */}
          <div className="mb-6 rounded-full bg-emerald-50 dark:bg-emerald-900/20 p-4">
            <span className="material-symbols-outlined text-6xl text-emerald-500">check_circle</span>
          </div>
          
          {/* Headlines */}
          <div className="text-center mb-8">
            <h1 className="text-[#111817] dark:text-white tracking-tight text-3xl font-bold leading-tight mb-3">
              Payment Successful! <br/> Order Confirmed.
            </h1>
            <p className="text-gray-500 dark:text-gray-300 text-base font-normal leading-normal max-w-md mx-auto">
              Thank you for choosing Cleanzy Mart. Your laundry is in good hands.
            </p>
          </div>
          
          {/* Order ID Badge */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 bg-[#2beede]/10 dark:bg-[#2beede]/20 px-4 py-2 rounded-full border border-[#2beede]/20">
              <span className="material-symbols-outlined text-lg text-[#2beede]">receipt_long</span>
              <span className="text-[#111817] dark:text-white text-base font-bold tracking-tight">
                Order ID: {orderData.orderId}
              </span>
            </span>
          </div>
          
          {/* Details Card (Summary) */}
          <div className="w-full bg-[#f8fafa] dark:bg-[#203633] rounded-lg border border-[#e5e7eb] dark:border-[#2a3b39] p-6 mb-8">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Order Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              {/* Pickup Time */}
              <div className="flex gap-3">
                <div className="mt-0.5">
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-400 text-xl">schedule</span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Pickup Time</p>
                  <p className="text-[#111817] dark:text-white text-sm font-semibold">{orderData.pickupTime}</p>
                </div>
              </div>
              
              {/* Delivery Address */}
              <div className="flex gap-3">
                <div className="mt-0.5">
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-400 text-xl">location_on</span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Delivery Address</p>
                  <p className="text-[#111817] dark:text-white text-sm font-semibold">{orderData.deliveryAddress}</p>
                </div>
              </div>
              
              {/* Total Paid */}
              <div className="flex gap-3">
                <div className="mt-0.5">
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-400 text-xl">payments</span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Total Paid</p>
                  <p className="text-[#111817] dark:text-white text-sm font-semibold">
                    {orderData.currency} {orderData.total.toFixed(2)}
                  </p>
                </div>
              </div>
              
              {/* Notifications */}
              <div className="flex gap-3">
                <div className="mt-0.5">
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-400 text-xl">notifications_active</span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Updates</p>
                  <p className="text-[#111817] dark:text-white text-sm font-semibold">SMS & Email updates sent</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              onClick={handleTrackOrder}
              className="flex-1 flex items-center justify-center gap-2 bg-[#2beede] hover:bg-[#2beede]/90 text-[#102220] font-bold py-3.5 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              Track My Order
            </button>
            
            <button
              onClick={handleBackToHome}
              className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111817] dark:text-white font-medium py-3.5 px-6 rounded-lg transition-all duration-200 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
              Back to Home
            </button>
          </div>
          
          {/* Support Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help with your order? 
              <button
                onClick={handleContactSupport}
                className="text-[#2beede] hover:underline hover:text-[#2beede]/80 font-medium ml-1"
              >
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer Decoration */}
      <div className="w-full py-6 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-600">© 2023 Cleanzy Mart Inc.</p>
      </div>
    </div>
  );
};

export default OrderConfirmation;