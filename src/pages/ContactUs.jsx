import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // EmailJS Configuration
  // Get these from https://www.emailjs.com
  const EMAILJS_SERVICE_ID = 'service_jxxcy2r'; // Replace with your service ID
  const EMAILJS_TEMPLATE_ID = 'template_38kijym'; // Replace with your template ID
  const EMAILJS_PUBLIC_KEY = 'tNo_qp6XyKEZRDb5b'; // Replace with your public key

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate form
    if (!formData.fullName || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Prepare email data
      const templateParams = {
        to_name: 'Cleanzy Mart Support Team',
        to_email: 'support@cleanzymart.com',
        from_name: formData.fullName,
        from_email: formData.email,
        subject: formData.subject || 'General Inquiry from Website',
        message: formData.message,
        date: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        reply_to: formData.email
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      if (response.status === 200) {
        setSuccess(true);
        
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          subject: '',
          message: ''
        });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        setError('Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('EmailJS Error:', err);
      
      // Try fallback to mock function if EmailJS is not set up
      if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
        // Use mock function for development
        await handleSubmitMock(e);
      } else {
        setError('An error occurred while sending your message. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock function for development/testing
  const handleSubmitMock = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate form
    if (!formData.fullName || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock successful submission
    console.log('Mock EmailJS submission:', {
      name: formData.fullName,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      timestamp: new Date().toISOString()
    });
    
    setSuccess(true);
    
    // Reset form
    setFormData({
      fullName: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setSuccess(false);
    }, 5000);
    
    setLoading(false);
  };

  // Replace with your actual address or coordinates
  const storeAddress = "123 Clean St, Sparkle City, WA 98001";
  const googleMapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(storeAddress)}`;
  
  // For development, you can use a sample location
  const sampleLocationUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9235113738646!2d79.86121107488406!3d6.902492493099428!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2597d5054557d%3A0x8b72b313755e476f!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2sin!4v1701234567890!5m2!1sen!2sin";

  return (
    <div className="min-h-screen bg-[#f6f8f6] text-[#111813]">
      {/* TopNavBar - Same as before */}
      <header className="sticky top-0 z-50 bg-[#f6f8f6]/80 backdrop-blur-sm border-b border-[#f0f4f2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Nav - Same as before */}
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 text-[#2bee6c]">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  {/* Logo SVG - Same as before */}
                </svg>
              </div>
              <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Cleanzy Mart</h2>
            </div>
            
            <div className="hidden lg:flex flex-1 justify-end gap-8">
              <nav className="flex items-center gap-9">
                <Link to="/" className="text-sm font-medium leading-normal hover:text-[#2bee6c] transition-colors">Home</Link>
                <Link to="/services" className="text-sm font-medium leading-normal hover:text-[#2bee6c] transition-colors">Services</Link>
                <Link to="/pricing" className="text-sm font-medium leading-normal hover:text-[#2bee6c] transition-colors">Pricing</Link>
                <Link to="/about" className="text-sm font-medium leading-normal hover:text-[#2bee6c] transition-colors">About Us</Link>
                <Link to="/contact" className="text-sm font-medium leading-normal text-[#2bee6c]">Contact Us</Link>
              </nav>
              <div className="flex items-center gap-2">
                <Link 
                  to="/booking"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#2bee6c] text-[#102216] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#2bee6c]/90 transition-colors"
                >
                  <span className="truncate">Schedule a Pickup</span>
                </Link>
                <Link 
                  to="/login"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 text-[#111813] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 transition-colors"
                >
                  <span className="truncate">Log In</span>
                </Link>
              </div>
            </div>
            
            <button className="lg:hidden p-2">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between gap-3 p-4 text-center">
            <div className="flex w-full flex-col items-center gap-3">
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">Contact Us</h1>
              <p className="text-[#61896f] text-base font-normal leading-normal max-w-md">
                We'd love to hear from you! Fill out the form below or reach out to us directly.
              </p>
            </div>
          </div>
          
          {/* Status Messages */}
          {success && (
            <div className="mx-auto max-w-2xl mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 text-lg">✓</span>
                </div>
                <div>
                  <p className="font-medium text-emerald-800">Message sent successfully!</p>
                  <p className="text-sm text-emerald-600">Thank you for contacting us. We'll get back to you soon.</p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mx-auto max-w-2xl mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">!</span>
                </div>
                <div>
                  <p className="font-medium text-red-800">Error sending message</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Development Note - Remove in production */}
          {EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' && (
            <div className="mx-auto max-w-2xl mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Development Mode:</strong> EmailJS is not configured. Messages will be logged to console. 
                To enable real email sending, set up EmailJS and update the configuration.
              </p>
            </div>
          )}
          
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column: Form */}
            <div className="flex flex-col">
              <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6 p-4">
                <div className="flex flex-col">
                  <label className="text-base font-medium leading-normal pb-2" htmlFor="full-name">Full Name *</label>
                  <input
                    id="full-name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#f0f4f2] bg-white h-14 placeholder:text-[#61896f] p-4 text-base font-normal leading-normal focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
                    placeholder="Enter your full name"
                    type="text"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-base font-medium leading-normal pb-2" htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#f0f4f2] bg-white h-14 placeholder:text-[#61896f] p-4 text-base font-normal leading-normal focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
                    placeholder="Enter your email address"
                    type="email"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-base font-medium leading-normal pb-2" htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#f0f4f2] bg-white h-14 placeholder:text-[#61896f] p-4 text-base font-normal leading-normal focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
                    placeholder="How can we help?"
                    type="text"
                    disabled={loading}
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-base font-medium leading-normal pb-2" htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#f0f4f2] bg-white placeholder:text-[#61896f] p-4 text-base font-normal leading-normal focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
                    placeholder="Write your message here..."
                    rows="5"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#2bee6c] text-[#102216] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#2bee6c]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <span className="truncate">Send Message</span>
                    )}
                  </button>
                  <p className="text-xs text-[#61896f] mt-2">* Required fields</p>
                </div>
              </form>
            </div>
            
            {/* Right Column: Info & Real Map */}
            <div className="flex flex-col">
              <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Visit Our Store</h2>
              <div className="p-4 space-y-8">
                <div className="space-y-6">
                  {/* Store Hours */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 rounded-full bg-[#2bee6c]/20 p-3 text-[#2bee6c]">
                      <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                      <h3 className="font-bold">Store Hours</h3>
                      <p className="text-[#61896f]">Monday - Friday: 8:00 AM - 8:00 PM</p>
                      <p className="text-[#61896f]">Saturday - Sunday: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 rounded-full bg-[#2bee6c]/20 p-3 text-[#2bee6c]">
                      <span className="material-symbols-outlined">call</span>
                    </div>
                    <div>
                      <h3 className="font-bold">Phone</h3>
                      <p className="text-[#61896f]">(+94) 77 123 4567</p>
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 rounded-full bg-[#2bee6c]/20 p-3 text-[#2bee6c]">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <div>
                      <h3 className="font-bold">Email</h3>
                      <p className="text-[#61896f]">cleanzymaart@gmail.com</p>
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 rounded-full bg-[#2bee6c]/20 p-3 text-[#2bee6c]">
                      <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <div>
                      <h3 className="font-bold">Address</h3>
                      <p className="text-[#61896f]">123 Clean Street,<br />Colombo, Sri Lanka</p>
                    </div>
                  </div>
                </div>
                
                {/* Real Google Map */}
                <div className="w-full overflow-hidden rounded-xl border border-[#f0f4f2] shadow-sm">
                  <div className="aspect-video w-full">
                    <iframe
                      title="Cleanzy Mart Location"
                      src={sampleLocationUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-xl"
                    ></iframe>
                  </div>
                  <div className="p-4 bg-white border-t border-[#f0f4f2]">
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeAddress)}`, '_blank')}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#2bee6c]/10 text-[#2bee6c] font-medium hover:bg-[#2bee6c]/20 transition-colors"
                    >
                      <span className="material-symbols-outlined">directions</span>
                      Get Directions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#f0f4f2] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
          <p className="text-sm text-[#61896f]">© 2024 Cleanzy Mart. All rights reserved.</p>
          <div className="flex gap-4">
            <a className="text-[#61896f] hover:text-[#2bee6c] transition-colors" href="#">Terms of Service</a>
            <a className="text-[#61896f] hover:text-[#2bee6c] transition-colors" href="#">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;