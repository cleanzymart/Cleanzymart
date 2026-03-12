import React, { useState } from 'react';

const CardDetailsModal = ({ onClose, onPaymentSuccess, amount = 450.00 }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      if (onPaymentSuccess) {
        onPaymentSuccess({
          cardLastFour: cardNumber.slice(-4),
          amount,
          timestamp: new Date().toISOString()
        });
      }
    }, 1500);
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : '';
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-[560px] bg-white dark:bg-[#172d2b] rounded-2xl shadow-lg flex flex-col overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="px-8 pt-8 pb-2 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-[#111817] dark:text-white text-2xl font-bold tracking-tight">Enter Card Details</h1>
            <span className="material-symbols-outlined text-[#618986] dark:text-[#8aaead]">lock</span>
          </div>
          <p className="text-[#618986] dark:text-[#8aaead] text-sm font-normal">
            Complete your transaction securely for Cleanzy Mart.
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="px-8 py-6 flex-1 overflow-y-auto max-h-[70vh]">
          {/* Dynamic Card Preview */}
          <div className="mb-8 w-full aspect-[1.586] rounded-xl bg-gradient-to-br from-[#102220] to-[#0f3532] relative shadow-lg text-white p-6 md:p-7 flex flex-col justify-between select-none transition-all duration-300 ring-1 ring-white/10">
            {/* Decorative background elements */}
            <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-[#2beede]/10 to-transparent rounded-r-xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#2beede]/20 blur-3xl rounded-full pointer-events-none"></div>
            
            {/* Card Top Row */}
            <div className="relative z-10 flex justify-between items-start">
              {/* EMV Chip */}
              <div className="w-12 h-9 bg-gradient-to-tr from-amber-200 to-amber-400 rounded-md border border-amber-500/30 shadow-inner flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 border-[0.5px] border-black/20 rounded-[4px] m-[2px]"></div>
                <div className="w-full h-[1px] bg-black/10 absolute top-1/2 -translate-y-1/2"></div>
                <div className="h-full w-[1px] bg-black/10 absolute left-1/3"></div>
                <div className="h-full w-[1px] bg-black/10 absolute right-1/3"></div>
              </div>
              
              {/* Contactless Icon */}
              <span className="material-symbols-outlined text-white/80 text-3xl">contactless</span>
            </div>
            
            {/* Card Middle (Number) */}
            <div className="relative z-10 mt-2">
              <p className="text-xl md:text-2xl font-mono tracking-widest text-white drop-shadow-md">
                {cardNumber || '0000 0000 0000 0000'}
              </p>
            </div>
            
            {/* Card Bottom (Name, Date, Logo) */}
            <div className="relative z-10 flex justify-between items-end">
              <div className="flex gap-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest text-white/60 font-semibold">Card Holder</span>
                  <span className="text-sm font-medium tracking-wide uppercase truncate max-w-[140px]">
                    {cardholderName || 'Ginuka Wadugedara'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest text-white/60 font-semibold">Expires</span>
                  <span className="text-sm font-medium tracking-wide font-mono">
                    {expiryDate || 'MM/YY'}
                  </span>
                </div>
              </div>
              
              {/* Brand Logo Circles */}
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full bg-red-500/90 mix-blend-screen shadow-sm"></div>
                <div className="w-8 h-8 rounded-full bg-yellow-500/90 mix-blend-screen shadow-sm"></div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Card Number Input */}
            <label className="flex flex-col gap-2 group/input">
              <p className="text-[#111817] dark:text-gray-200 text-sm font-medium leading-normal">Card Number</p>
              <div className="flex w-full items-center rounded-lg border border-[#dbe6e5] dark:border-gray-600 bg-white dark:bg-[#172d2b] focus-within:border-[#2beede] focus-within:ring-1 focus-within:ring-[#2beede] transition-all duration-200 overflow-hidden h-14">
                <div className="pl-4 pr-2 text-[#618986]">
                  <span className="material-symbols-outlined">credit_card</span>
                </div>
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="flex-1 w-full h-full border-none bg-transparent p-0 px-2 text-base text-[#111817] dark:text-white placeholder:text-[#618986] focus:ring-0"
                  placeholder="0000 0000 0000 0000"
                  type="text"
                  maxLength={19}
                  required
                />
              </div>
            </label>

            {/* Cardholder Name Input */}
            <label className="flex flex-col gap-2">
              <p className="text-[#111817] dark:text-gray-200 text-sm font-medium leading-normal">Cardholder Name</p>
              <input
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                className="w-full h-14 rounded-lg border border-[#dbe6e5] dark:border-gray-600 bg-white dark:bg-[#172d2b] px-4 text-base text-[#111817] dark:text-white placeholder:text-[#618986] focus:border-[#2beede] focus:ring-1 focus:ring-[#2beede] focus:outline-none transition-colors"
                placeholder="e.g. Ginuka Wadugedara"
                type="text"
                required
              />
            </label>

            {/* Expiry and CVV Row */}
            <div className="flex flex-wrap gap-4">
              <label className="flex flex-col gap-2 flex-1 min-w-[140px]">
                <p className="text-[#111817] dark:text-gray-200 text-sm font-medium leading-normal">Expiry Date</p>
                <input
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  className="w-full h-14 rounded-lg border border-[#dbe6e5] dark:border-gray-600 bg-white dark:bg-[#172d2b] px-4 text-base text-[#111817] dark:text-white placeholder:text-[#618986] focus:border-[#2beede] focus:ring-1 focus:ring-[#2beede] focus:outline-none transition-colors"
                  placeholder="MM/YY"
                  type="text"
                  maxLength={5}
                  required
                />
              </label>
              
              <label className="flex flex-col gap-2 flex-1 min-w-[140px]">
                <div className="flex items-center justify-between">
                  <p className="text-[#111817] dark:text-gray-200 text-sm font-medium leading-normal">CVV</p>
                  <div className="group relative flex items-center">
                    <span className="material-symbols-outlined text-[18px] text-[#618986] cursor-help hover:text-[#2beede] transition-colors">help</span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 hidden w-32 rounded bg-[#102220] p-2 text-xs text-white shadow-lg group-hover:block z-20">
                      3 digits on the back of your card.
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full h-14 rounded-lg border border-[#dbe6e5] dark:border-gray-600 bg-white dark:bg-[#172d2b] px-4 pr-10 text-base text-[#111817] dark:text-white placeholder:text-[#618986] focus:border-[#2beede] focus:ring-1 focus:ring-[#2beede] focus:outline-none transition-colors"
                    placeholder="123"
                    type="password"
                    maxLength={4}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#618986]">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                </div>
              </label>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <label className="relative flex items-center cursor-pointer">
                <input
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="peer h-5 w-5 appearance-none rounded border border-[#dbe6e5] dark:border-gray-600 bg-white dark:bg-[#172d2b] checked:border-[#2beede] checked:bg-[#2beede] transition-all focus:ring-2 focus:ring-[#2beede]/20"
                  type="checkbox"
                />
                <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[16px] text-[#102220] font-bold opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
              </label>
              <span className="text-[#111817] dark:text-gray-300 text-sm font-normal cursor-pointer select-none">
                Save this card for faster checkout
              </span>
            </div>

            {/* Footer / Action Buttons */}
            <div className="pt-4">
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-14 px-6 rounded-lg border border-[#dbe6e5] dark:border-gray-600 text-[#111817] dark:text-white font-medium text-base hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98] transition-all duration-200"
                  disabled={isProcessing}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 h-14 rounded-lg bg-[#2beede] hover:bg-[#20dcca] text-[#102220] font-bold text-base shadow-lg shadow-[#2beede]/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#102220]"></span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay LKR{amount.toFixed(2)}</span>
                      <span className="material-symbols-outlined text-[20px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trust Signals */}
              <div className="border-t border-[#f0f4f4] dark:border-gray-700 pt-4 flex justify-center">
                <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                  <div className="flex items-center gap-1.5" title="SSL Secured">
                    <span className="material-symbols-outlined text-[#2beede] text-2xl">verified_user</span>
                    <div className="flex flex-col leading-none">
                      <span className="text-[9px] font-bold uppercase text-gray-800 dark:text-gray-300">SSL</span>
                      <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400">Secured</span>
                    </div>
                  </div>
                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex items-center gap-1.5" title="PCI-DSS Compliant">
                    <span className="material-symbols-outlined text-[#2beede] text-2xl">shield_lock</span>
                    <div className="flex flex-col leading-none">
                      <span className="text-[9px] font-bold uppercase text-gray-800 dark:text-gray-300">PCI-DSS</span>
                      <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400">Compliant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CardDetailsModal;