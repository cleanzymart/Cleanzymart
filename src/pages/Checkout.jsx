import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { paymentAPI, ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [saveAddress, setSaveAddress] = useState(true);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: '',
    phone: '',
    address: orderData.address || ''
  });

  useEffect(() => {
    // Load user data from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.fullName) {
      setDeliveryDetails(prev => ({ 
        ...prev, 
        fullName: user.fullName,
        phone: user.phone || ''
      }));
    }
  }, []);

  const orderItems = [
    { 
      name: orderData.serviceName || 'Laundry Service', 
      description: `${orderData.quantity || 0}kg`, 
      price: `LKR ${(orderData.totalAmount || 0).toLocaleString()}` 
    }
  ];

  const subtotal = orderData.totalAmount || 0;
  const deliveryFee = 500;
  const tax = subtotal * 0.05; // 5% VAT
  const total = subtotal + deliveryFee + tax;

  const validateCardDetails = () => {
    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Please enter valid card number');
        return false;
      }
      if (!expiryDate || !expiryDate.match(/^\d{2}\/\d{2}$/)) {
        toast.error('Please enter valid expiry date (MM/YY)');
        return false;
      }
      if (!cvv || cvv.length < 3) {
        toast.error('Please enter valid CVV');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateCardDetails()) return;

    setProcessing(true);

    try {
      const paymentData = {
        orderId: orderData.orderId,
        paymentMethod,
        amount: total,
        orderDetails: {
          serviceName: orderData.serviceName,
          quantity: orderData.quantity,
          pickupDate: orderData.pickupDate,
          pickupTime: orderData.pickupTime
        }
      };

      // Add card details if payment method is card
      if (paymentMethod === 'card') {
        paymentData.cardDetails = {
          number: cardNumber.replace(/\s/g, ''),
          expiry: expiryDate,
          cvv
        };
      }

      console.log('💳 Processing payment:', paymentData);

      const response = await paymentAPI.processPayment(paymentData);

      if (response.success) {
        toast.success(response.message);
        
        // Navigate to confirmation page
        navigate('/order-confirmation', {
          state: {
            orderId: orderData.orderNumber || `#CLZ${Date.now()}`,
            total,
            pickupTime: `${orderData.pickupDate || 'Today'}, ${orderData.pickupTime || '4:00 PM - 6:00 PM'}`,
            deliveryAddress: deliveryDetails.address,
            currency: 'LKR',
            paymentMethod,
            transactionId: response.data.transactionId
          }
        });
      } else {
        toast.error(response.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8f6] dark:bg-[#102220] text-[#111817] dark:text-white transition-colors duration-200 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#dbe6e5] bg-white dark:bg-[#18312e] dark:border-[#2a4542] px-6 py-4 lg:px-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 text-[#2beede]">
            <svg className="h-full w-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor"></path>
              <path clipRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold leading-tight tracking-[-0.015em]">Cleanzy Mart</h1>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#f6f8f8] dark:bg-[#203c39] px-3 py-1.5 text-sm font-medium text-[#111817] dark:text-gray-300">
          <span className="material-symbols-outlined text-[20px] text-green-600">lock</span>
          Secure Checkout
        </div>
      </header>

      <main className="flex-1 px-4 py-8 lg:px-20 xl:px-40">
        <div className="mx-auto max-w-[1200px]">
          {/* Breadcrumbs */}
          <nav className="mb-8 flex flex-wrap gap-2 text-sm font-medium">
            <Link to="/cart" className="text-[#618986] hover:text-[#2beede]">Cart</Link>
            <span className="text-[#618986]">/</span>
            <span className="text-[#111817] dark:text-white">Checkout</span>
            <span className="text-[#618986]">/</span>
            <span className="text-[#111817] dark:text-white">Payment</span>
          </nav>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left Column: Input Zone */}
            <div className="flex flex-col gap-10 lg:col-span-8">
              {/* Page Heading */}
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#111817] dark:text-white">Checkout</h2>
                <p className="mt-2 text-[#618986]">Complete your order details below.</p>
              </div>

              {/* Delivery Details Section */}
              <section>
                <div className="mb-6 flex items-center justify-between border-b border-[#dbe6e5] pb-3 dark:border-[#2a4542]">
                  <h3 className="text-xl font-bold text-[#111817] dark:text-white">Delivery Details</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Full Name */}
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#111817] dark:text-gray-300">Full Name</span>
                    <input 
                      value={deliveryDetails.fullName}
                      onChange={(e) => setDeliveryDetails({...deliveryDetails, fullName: e.target.value})}
                      className="h-12 w-full rounded-lg border border-[#dbe6e5] bg-white px-4 text-base placeholder:text-[#618986] focus:border-[#2beede] focus:outline-none focus:ring-1 focus:ring-[#2beede] dark:border-[#2a4542] dark:bg-[#18312e] dark:text-white" 
                      placeholder="John Doe" 
                      type="text" 
                      required
                    />
                  </label>

                  {/* Phone Number */}
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#111817] dark:text-gray-300">Phone Number</span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#618986]">+94</span>
                      <input 
                        value={deliveryDetails.phone}
                        onChange={(e) => setDeliveryDetails({...deliveryDetails, phone: e.target.value})}
                        className="h-12 w-full rounded-lg border border-[#dbe6e5] bg-white pl-12 pr-4 text-base placeholder:text-[#618986] focus:border-[#2beede] focus:outline-none focus:ring-1 focus:ring-[#2beede] dark:border-[#2a4542] dark:bg-[#18312e] dark:text-white" 
                        placeholder="77 123 4567" 
                        type="tel"
                        required
                      />
                    </div>
                  </label>

                  {/* Address */}
                  <label className="flex flex-col gap-2 md:col-span-2">
                    <span className="text-sm font-medium text-[#111817] dark:text-gray-300">Delivery Address</span>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-[#2beede]">location_on</span>
                      <textarea 
                        value={deliveryDetails.address}
                        onChange={(e) => setDeliveryDetails({...deliveryDetails, address: e.target.value})}
                        className="w-full rounded-lg border border-[#dbe6e5] bg-white pl-12 pr-4 pt-3 text-base placeholder:text-[#618986] focus:border-[#2beede] focus:outline-none focus:ring-1 focus:ring-[#2beede] dark:border-[#2a4542] dark:bg-[#18312e] dark:text-white" 
                        placeholder="Start typing your address..." 
                        rows="3"
                        required
                      />
                    </div>
                  </label>

                  {/* Save Address Checkbox */}
                  <div className="md:col-span-2">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input 
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-[#2beede] focus:ring-[#2beede] dark:border-gray-600 dark:bg-gray-700" 
                        type="checkbox"
                      />
                      <span className="text-sm font-medium text-[#111817] dark:text-gray-300">Save this address for future orders</span>
                    </label>
                  </div>
                </div>
              </section>

              {/* Payment Method Section */}
              <section>
                <div className="mb-6 flex items-center justify-between border-b border-[#dbe6e5] pb-3 dark:border-[#2a4542]">
                  <h3 className="text-xl font-bold text-[#111817] dark:text-white">Payment Method</h3>
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <span className="material-symbols-outlined text-[16px]">verified_user</span>
                    100% Secure
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Card Option */}
                  <label className={`group relative flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-[#2beede] bg-[#2beede]/5 hover:bg-[#2beede]/10 dark:bg-[#2beede]/10 dark:hover:bg-[#2beede]/20' 
                      : 'border-[#dbe6e5] bg-white hover:border-[#2beede]/50 hover:bg-[#f6f8f8] dark:border-[#2a4542] dark:bg-[#18312e] dark:hover:bg-[#203c39]'
                  }`}>
                    <div className="flex items-center">
                      <input 
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="h-5 w-5 border-gray-300 text-[#2beede] focus:ring-[#2beede] dark:border-gray-600 dark:bg-gray-700" 
                        name="payment" 
                        type="radio"
                      />
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#111817] dark:text-white">Credit / Debit Card</span>
                        <span className="text-sm text-[#618986]">Pay securely with Visa, Mastercard</span>
                      </div>
                      <div className="flex gap-2 opacity-80">
                        <div className="flex h-8 w-12 items-center justify-center rounded bg-white shadow-sm dark:bg-gray-800">
                          <span className="text-xs font-bold italic text-blue-800 dark:text-blue-400">VISA</span>
                        </div>
                        <div className="flex h-8 w-12 items-center justify-center rounded bg-white shadow-sm dark:bg-gray-800">
                          <div className="flex -space-x-2">
                            <div className="h-4 w-4 rounded-full bg-red-500/80"></div>
                            <div className="h-4 w-4 rounded-full bg-yellow-500/80"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Digital Wallet Option */}
                  <label className={`group relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                    paymentMethod === 'wallet' 
                      ? 'border-[#2beede] bg-[#2beede]/5 hover:bg-[#2beede]/10 dark:bg-[#2beede]/10 dark:hover:bg-[#2beede]/20' 
                      : 'border-[#dbe6e5] bg-white hover:border-[#2beede]/50 hover:bg-[#f6f8f8] dark:border-[#2a4542] dark:bg-[#18312e] dark:hover:bg-[#203c39]'
                  }`}>
                    <div className="flex items-center">
                      <input 
                        checked={paymentMethod === 'wallet'}
                        onChange={() => setPaymentMethod('wallet')}
                        className="h-5 w-5 border-gray-300 text-[#2beede] focus:ring-[#2beede] dark:border-gray-600 dark:bg-gray-700" 
                        name="payment" 
                        type="radio"
                      />
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#111817] dark:text-white">Digital Wallet</span>
                        <span className="text-sm text-[#618986]">mCash, FriMi, eZ Cash</span>
                      </div>
                      <span className="material-symbols-outlined text-[#618986]">account_balance_wallet</span>
                    </div>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label className={`group relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                    paymentMethod === 'cod' 
                      ? 'border-[#2beede] bg-[#2beede]/5 hover:bg-[#2beede]/10 dark:bg-[#2beede]/10 dark:hover:bg-[#2beede]/20' 
                      : 'border-[#dbe6e5] bg-white hover:border-[#2beede]/50 hover:bg-[#f6f8f8] dark:border-[#2a4542] dark:bg-[#18312e] dark:hover:bg-[#203c39]'
                  }`}>
                    <div className="flex items-center">
                      <input 
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="h-5 w-5 border-gray-300 text-[#2beede] focus:ring-[#2beede] dark:border-gray-600 dark:bg-gray-700" 
                        name="payment" 
                        type="radio"
                      />
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#111817] dark:text-white">Cash on Delivery</span>
                        <span className="text-sm text-[#618986]">Pay at your doorstep</span>
                      </div>
                      <span className="material-symbols-outlined text-[#618986]">payments</span>
                    </div>
                  </label>
                </div>

                {/* Card Input Fields (only shown if card is selected) */}
                {paymentMethod === 'card' && (
                  <div className="mt-4 rounded-lg bg-[#f6f8f8] p-5 dark:bg-[#203c39]">
                    <div className="grid gap-4 md:grid-cols-2">
                      <input 
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="h-12 w-full rounded-lg border border-[#dbe6e5] bg-white px-4 text-base placeholder:text-[#618986] focus:border-[#2beede] focus:outline-none focus:ring-1 focus:ring-[#2beede] dark:border-[#2a4542] dark:bg-[#18312e] dark:text-white md:col-span-2" 
                        placeholder="Card Number" 
                        type="text"
                      />
                      <input 
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="h-12 w-full rounded-lg border border-[#dbe6e5] bg-white px-4 text-base placeholder:text-[#618986] focus:border-[#2beede] focus:outline-none focus:ring-1 focus:ring-[#2beede] dark:border-[#2a4542] dark:bg-[#18312e] dark:text-white" 
                        placeholder="MM / YY" 
                        type="text"
                      />
                      <input 
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="h-12 w-full rounded-lg border border-[#dbe6e5] bg-white px-4 text-base placeholder:text-[#618986] focus:border-[#2beede] focus:outline-none focus:ring-1 focus:ring-[#2beede] dark:border-[#2a4542] dark:bg-[#18312e] dark:text-white" 
                        placeholder="CVC" 
                        type="text"
                      />
                      <div className="flex items-center gap-2 md:col-span-2">
                        <span className="material-symbols-outlined text-sm text-[#618986]">lock</span>
                        <p className="text-xs text-[#618986]">Your card details are encrypted and secure.</p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Sticky Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 rounded-xl border border-[#dbe6e5] bg-white p-6 shadow-sm dark:border-[#2a4542] dark:bg-[#18312e]">
                <h3 className="mb-5 text-lg font-bold text-[#111817] dark:text-white">Order Summary</h3>
                
                {/* Items List */}
                <div className="mb-5 flex flex-col gap-4 border-b border-[#dbe6e5] pb-5 dark:border-[#2a4542]">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#111817] dark:text-white">{item.name}</span>
                        <span className="text-xs text-[#618986]">{item.description}</span>
                      </div>
                      <span className="text-sm font-semibold text-[#111817] dark:text-white">{item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Cost Breakdown */}
                <div className="mb-6 flex flex-col gap-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#618986]">Subtotal</span>
                    <span className="font-medium text-[#111817] dark:text-white">LKR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#618986]">Delivery Fee</span>
                    <span className="font-medium text-[#111817] dark:text-white">LKR {deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#618986]">Taxes (VAT 5%)</span>
                    <span className="font-medium text-[#111817] dark:text-white">LKR {tax.toLocaleString()}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="mb-8 flex items-end justify-between border-t border-[#dbe6e5] pt-4 dark:border-[#2a4542]">
                  <span className="text-base font-bold text-[#111817] dark:text-white">Total Amount</span>
                  <span className="text-2xl font-bold text-[#111817] dark:text-white">LKR {total.toLocaleString()}</span>
                </div>

                {/* CTA Button */}
                <button 
                  onClick={handlePayment}
                  disabled={processing}
                  className="group mb-4 flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#2beede] text-base font-bold text-[#111817] transition-all hover:bg-[#21dbc9] focus:ring-4 focus:ring-[#2beede]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <span className="animate-spin">⚪</span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Pay LKR {total.toLocaleString()}</span>
                      <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-2 text-xs text-[#618986]">
                  <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                  <span>256-bit SSL Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#dbe6e5] bg-white py-8 dark:border-[#2a4542] dark:bg-[#18312e]">
        <div className="px-6 text-center text-sm text-[#618986] lg:px-40">
          <p>© 2024 Cleanzy Mart. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-4">
            <a className="hover:text-[#111817] dark:hover:text-white" href="#">Privacy Policy</a>
            <a className="hover:text-[#111817] dark:hover:text-white" href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;