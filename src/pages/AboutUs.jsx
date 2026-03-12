import React from 'react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[#f6f8f6] text-[#111813]">
      {/* TopNavBar - Same as Home page */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 text-[#2bee6c]">
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"></path>
                  <path clipRule="evenodd" fillRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Cleanzy Mart</h2>
            </div>
            
            <div className="hidden md:flex flex-1 justify-center items-center gap-9">
              <Link to="/" className="text-sm font-medium hover:text-[#2bee6c] transition-colors">Home</Link>
              <a className="text-sm font-medium hover:text-[#2bee6c] transition-colors" href="#services">Services</a>
              <a className="text-sm font-medium hover:text-[#2bee6c] transition-colors" href="#pricing">Pricing</a>
              <a className="text-sm font-medium hover:text-[#2bee6c] transition-colors" href="#how-it-works">How It Works</a>
              <a className="text-sm font-medium hover:text-[#2bee6c] transition-colors" href="#contact">Contact</a>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/login"
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#2bee6c]/20 text-[#111813] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#2bee6c]/30 transition-colors"
              >
                <span className="truncate">Log In</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-[-0.033em] text-[#111813] mb-6">
              Revolutionizing Laundry Care
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Where traditional cleanliness meets modern convenience. We're transforming the way Sri Lanka thinks about laundry.
            </p>
            <div className="w-full max-w-4xl mx-auto h-64 bg-gray-200 rounded-xl flex items-center justify-center">
              <img 
                className="w-full max-w-4xl rounded-xl object-cover h-64" 
                // add image to aboutus
                src="/images/Aboutus.jpg"  
                alt="Clean laundry service" 
              />
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold leading-tight tracking-[-0.015em] text-[#111813] mb-6">
                From a Single Laundry to Your Doorstep
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Founded in 2023, Cleanzy Mart began as a vision to bridge the gap between traditional laundry services and the digital age. We saw an opportunity to bring convenience, transparency, and quality to an essential household service.
              </p>
              <p className="text-gray-600 text-lg">
                Today, we're proud to be Colombo's fastest-growing laundry service, serving thousands of satisfied customers with our reliable pickup and delivery system.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
                <div className="text-3xl mb-2">🏭</div>
                <h3 className="font-bold text-[#111813] mb-2">2023</h3>
                <p className="text-gray-600 text-sm">Founded in Colombo</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
                <div className="text-3xl mb-2">👥</div>
                <h3 className="font-bold text-[#111813] mb-2">10K+</h3>
                <p className="text-gray-600 text-sm">Happy Customers</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
                <div className="text-3xl mb-2">🚚</div>
                <h3 className="font-bold text-[#111813] mb-2">50K+</h3>
                <p className="text-gray-600 text-sm">Orders Delivered</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
                <div className="text-3xl mb-2">⭐</div>
                <h3 className="font-bold text-[#111813] mb-2">4.9/5</h3>
                <p className="text-gray-600 text-sm">Customer Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#f6f8f6] rounded-xl p-8 border border-[#2bee6c]/20">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-[#111813] mb-4">Our Mission</h3>
                <p className="text-gray-600">
                  To make professional laundry care accessible, affordable, and eco-friendly for every household in Sri Lanka through innovative technology and exceptional service.
                </p>
              </div>
              <div className="bg-[#f6f8f6] rounded-xl p-8 border border-[#2bee6c]/20">
                <div className="text-4xl mb-4">🔭</div>
                <h3 className="text-2xl font-bold text-[#111813] mb-4">Our Vision</h3>
                <p className="text-gray-600">
                  To become Sri Lanka's most trusted and innovative on-demand laundry service platform, setting new standards for convenience and quality in garment care.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold leading-tight tracking-[-0.015em] text-center text-[#111813] mb-12">
            Why Choose Cleanzy Mart
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-[#2bee6c]/20 text-[#2bee6c] text-2xl">
                🚀
              </div>
              <h3 className="text-xl font-bold text-[#111813]">Fast Turnaround</h3>
              <p className="text-gray-600">24-48 hour service guarantee with express options available</p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-[#2bee6c]/20 text-[#2bee6c] text-2xl">
                🌿
              </div>
              <h3 className="text-xl font-bold text-[#111813]">Eco-Friendly</h3>
              <p className="text-gray-600">Biodegradable detergents and energy-efficient processes</p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-[#2bee6c]/20 text-[#2bee6c] text-2xl">
                🔒
              </div>
              <h3 className="text-xl font-bold text-[#111813]">Quality Guarantee</h3>
              <p className="text-gray-600">100% satisfaction guarantee on all our services</p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-[#2bee6c]/20 text-[#2bee6c] text-2xl">
                📱
              </div>
              <h3 className="text-xl font-bold text-[#111813]">Tech-Enabled</h3>
              <p className="text-gray-600">Real-time tracking and digital management</p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-[#2bee6c]/20 text-[#2bee6c] text-2xl">
                👕
              </div>
              <h3 className="text-xl font-bold text-[#111813]">Expert Care</h3>
              <p className="text-gray-600">Trained professionals handling your garments with care</p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-[#2bee6c]/20 text-[#2bee6c] text-2xl">
                🏠
              </div>
              <h3 className="text-xl font-bold text-[#111813]">Doorstep Service</h3>
              <p className="text-gray-600">Free pickup and delivery right from your home</p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.015em] text-center text-[#111813] mb-12">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-4">❤️</div>
                <h3 className="text-lg font-bold text-[#111813] mb-2">Customer First</h3>
                <p className="text-gray-600 text-sm">Your satisfaction is our top priority in every service</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">⭐</div>
                <h3 className="text-lg font-bold text-[#111813] mb-2">Quality Focus</h3>
                <p className="text-gray-600 text-sm">Premium cleaning standards for every garment</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">💡</div>
                <h3 className="text-lg font-bold text-[#111813] mb-2">Innovation Driven</h3>
                <p className="text-gray-600 text-sm">Continuous improvement through technology</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">🤝</div>
                <h3 className="text-lg font-bold text-[#111813] mb-2">Community Minded</h3>
                <p className="text-gray-600 text-sm">Supporting and growing with local communities</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-[#2bee6c]/10 rounded-2xl p-12 border border-[#2bee6c]/20">
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.015em] text-[#111813] mb-4">
              Experience the Cleanzy Mart Difference
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us with their laundry needs
            </p>
            <Link 
              to="/signup"
              className="inline-flex items-center justify-center rounded-lg h-12 px-8 bg-[#2bee6c] text-[#111813] text-base font-bold hover:opacity-90 transition-opacity"
            >
              Schedule Your First Pickup
            </Link>
          </div>
        </section>
      </main>

      {/* Footer - Same as Home page */}
      <footer className="bg-white mt-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 text-[#2bee6c]">
                  <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"></path>
                    <path clipRule="evenodd" fillRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold">Cleanzy Mart</h2>
              </div>
              <p className="text-sm text-gray-600 max-w-sm">
                Your one-stop solution for fresh, clean clothes. We handle your laundry with care so you can focus on what matters most.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-[#2bee6c] transition-colors text-gray-600">About Us</Link></li>
                <li><a className="hover:text-[#2bee6c] transition-colors text-gray-600" href="#">Careers</a></li>
                <li><a className="hover:text-[#2bee6c] transition-colors text-gray-600" href="#">Press</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>support@cleanzymart.com</li>
                <li>(+94) 77-4562541</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>© 2024 Cleanzy Mart. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a className="hover:text-[#2bee6c] transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-[#2bee6c] transition-colors" href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;