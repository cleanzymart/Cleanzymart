import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const OwnerSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    businessName: 'Cleanzy Mart',
    email: 'owner@cleanzymart.com',
    phone: '077-1234567',
    address: 'Colombo, Sri Lanka',
    taxRate: '5',
    currency: 'LKR',
    timezone: 'Asia/Colombo'
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const handleBack = () => {
    navigate('/owner-dashboard');
  };

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to Dashboard"
        >
          <span className="text-2xl">←</span>
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => setSettings({...settings, businessName: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({...settings, email: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({...settings, phone: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={settings.address}
              onChange={(e) => setSettings({...settings, address: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) => setSettings({...settings, taxRate: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
              >
                <option value="LKR">LKR - Sri Lankan Rupee</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
            >
              <option value="Asia/Colombo">Asia/Colombo</option>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#2bee6c] text-white rounded-lg hover:bg-[#25d45f]"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerSettings;