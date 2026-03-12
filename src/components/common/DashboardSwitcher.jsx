import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUtils } from '../../services/api';

const DashboardSwitcher = () => {
  const navigate = useNavigate();
  const user = apiUtils.getCurrentUserFromStorage();
  const role = user?.role;

  const handleSwitch = () => {
    apiUtils.switchDashboard();
  };

  // Only show if user has both roles? (In your case, one user can't have both roles)
  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleSwitch}
        className="bg-[#2bee6c] text-white px-4 py-2 rounded-lg shadow-lg hover:bg-[#25d45f] transition-colors flex items-center gap-2"
      >
        <span>🔄</span>
        <span>Switch to {role === 'owner' ? 'Customer' : 'Owner'} Dashboard</span>
      </button>
    </div>
  );
};

export default DashboardSwitcher;