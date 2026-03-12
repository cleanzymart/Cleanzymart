import React from 'react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-[#f6f8f6] text-[#111813]">
      {/* TopNavBar - Updated to match Home.jsx */}
      <header className="sticky top-0 z-50 bg-[#f6f8f6]/80 backdrop-blur-sm border-b border-[#f0f4f2]">
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              {/* Logo SVG - Same as Home.jsx */}
              <div className="w-8 h-8 text-[#2bee6c]">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor"></path>
                  <path clipRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Cleanzy Mart</h2>
            </div>
            
            <div className="hidden lg:flex flex-1 justify-end gap-8">
              <div className="hidden md:flex flex-1 justify-center items-center gap-9">
                          <Link to="/" className="text-sm font-medium hover:text-[#2bee6c] transition-colors">Home</Link>
                            <a className="text-sm font-medium hover:text-[#2bee6c] transition-colors" href="#services">Services</a>
                            <Link to="/pricing" className="text-sm font-medium hover:text-[#2bee6c] transition-colors">Pricing</Link>
                            <Link to="/how-it-works" className="text-sm font-medium hover:text-[#2bee6c] transition-colors">How It Works</Link>
                            <Link to="/contact" className="text-sm font-medium hover:text-[#2bee6c] transition-colors">Contact Us</Link>
              </div>
              <div className="flex gap-2">
                <Link 
                  to="/signup"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#2bee6c] text-[#102216] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#2bee6c]/90 transition-colors"
                >
                  <span className="truncate">Sign Up</span>
                </Link>
                <Link 
                  to="/login"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 text-[#111813] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 transition-colors"
                >
                  <span className="truncate">Login</span>
                </Link>
              </div>
            </div>
            
            <div className="lg:hidden">
              <button className="text-[#111813]">
                <span className="material-symbols-outlined text-3xl">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="px-4 md:px-10 lg:px-20 py-10 md:py-20 flex flex-1 justify-center">
          <div className="flex flex-col max-w-4xl w-full gap-12 md:gap-16">
            <div className="flex flex-wrap justify-center gap-3 p-4 text-center">
              <div className="flex w-full flex-col gap-3">
                <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">Simple Steps to Fresh Laundry</h1>
                <p className="text-[#61896f] text-lg font-normal leading-normal max-w-2xl mx-auto">
                  Getting your laundry done has never been easier. Follow our simple three-step process to enjoy spotless, fresh clothes without the hassle.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
              {/* Step 1 */}
              <div className="flex flex-1 gap-4 rounded-xl border border-[#f0f4f2] bg-white p-6 flex-col text-center items-center hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#2bee6c]/20 text-[#2bee6c] mb-4">
                  <span className="material-symbols-outlined text-4xl">event_available</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold leading-tight">1. Schedule a Pickup</h2>
                  <p className="text-[#61896f] text-base font-normal leading-normal">
                    Select a convenient pickup time and location directly through our website or mobile app.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-1 gap-4 rounded-xl border border-[#f0f4f2] bg-white p-6 flex-col text-center items-center hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#2bee6c]/20 text-[#2bee6c] mb-4">
                  <span className="material-symbols-outlined text-4xl">local_laundry_service</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold leading-tight">2. We Collect & Clean</h2>
                  <p className="text-[#61896f] text-base font-normal leading-normal">
                    Our team will collect your laundry and our experts will wash, fold, and package it with the utmost care.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-1 gap-4 rounded-xl border border-[#f0f4f2] bg-white p-6 flex-col text-center items-center hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#2bee6c]/20 text-[#2bee6c] mb-4">
                  <span className="material-symbols-outlined text-4xl">local_shipping</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold leading-tight">3. Fresh Laundry Delivered</h2>
                  <p className="text-[#61896f] text-base font-normal leading-normal">
                    Receive your fresh, clean laundry delivered right back to your doorstep at your chosen time.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex px-4 py-3 justify-center">
              <Link 
                to="/booking"
                className="flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#2bee6c] text-[#102216] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#2bee6c]/90 transition-colors"
              >
                <span className="truncate">Schedule Your First Pickup</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Updated to match Home.jsx */}
      <footer className="w-full bg-white border-t border-[#f0f4f2]">
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
          <div className="flex flex-col gap-6 px-5 py-10 text-center">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <Link to="/about" className="text-[#61896f] hover:text-[#2bee6c] text-base font-normal leading-normal transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-[#61896f] hover:text-[#2bee6c] text-base font-normal leading-normal transition-colors">
                Contact
              </Link>
              <a href="#" className="text-[#61896f] hover:text-[#2bee6c] text-base font-normal leading-normal transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-[#61896f] hover:text-[#2bee6c] text-base font-normal leading-normal transition-colors">
                Privacy Policy
              </a>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              <a className="text-[#61896f] hover:text-[#2bee6c] transition-colors" href="#">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"></path>
                </svg>
              </a>
              <a className="text-[#61896f] hover:text-[#2bee6c] transition-colors" href="#">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a className="text-[#61896f] hover:text-[#2bee6c] transition-colors" href="#">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.793 2.013 10.147 2 12.315 2zm-1.003 3.706a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm-2.122 4.21a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6z" fillRule="evenodd"></path>
                </svg>
              </a>
            </div>
            
            <p className="text-[#61896f] text-sm font-normal leading-normal">
              © 2024 Cleanzy Mart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks;