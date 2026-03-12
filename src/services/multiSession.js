// Multi-session management
const SESSIONS = {
  CUSTOMER: 'customer_session',
  OWNER: 'owner_session'
};

export const sessionManager = {
  // Save customer session
  saveCustomerSession: (token, user) => {
    console.log('💾 Saving customer session:', { token, user });
    sessionStorage.setItem(SESSIONS.CUSTOMER, JSON.stringify({
      token,
      user,
      timestamp: Date.now()
    }));
    // Also save to localStorage for persistence
    localStorage.setItem('customer_token', token);
    localStorage.setItem('customer_user', JSON.stringify(user));
  },

  // Save owner session
  saveOwnerSession: (token, user) => {
    console.log('💾 Saving owner session:', { token, user });
    sessionStorage.setItem(SESSIONS.OWNER, JSON.stringify({
      token,
      user,
      timestamp: Date.now()
    }));
    // Also save to localStorage for persistence
    localStorage.setItem('owner_token', token);
    localStorage.setItem('owner_user', JSON.stringify(user));
  },

  // Get customer session
  getCustomerSession: () => {
    // Try sessionStorage first
    const session = sessionStorage.getItem(SESSIONS.CUSTOMER);
    if (session) {
      return JSON.parse(session);
    }
    // Fallback to localStorage
    const token = localStorage.getItem('customer_token');
    const userStr = localStorage.getItem('customer_user');
    if (token && userStr) {
      return {
        token,
        user: JSON.parse(userStr),
        timestamp: Date.now()
      };
    }
    return null;
  },

  // Get owner session
  getOwnerSession: () => {
    // Try sessionStorage first
    const session = sessionStorage.getItem(SESSIONS.OWNER);
    if (session) {
      return JSON.parse(session);
    }
    // Fallback to localStorage
    const token = localStorage.getItem('owner_token');
    const userStr = localStorage.getItem('owner_user');
    if (token && userStr) {
      return {
        token,
        user: JSON.parse(userStr),
        timestamp: Date.now()
      };
    }
    return null;
  },

  // Get current session based on URL
  getCurrentSession: () => {
    const isOwner = window.location.pathname.includes('owner') || 
                    window.location.pathname.includes('owner-dashboard');
    console.log('📍 Current path:', window.location.pathname, 'isOwner:', isOwner);
    
    const session = isOwner ? 
      sessionManager.getOwnerSession() : 
      sessionManager.getCustomerSession();
    
    console.log('👤 Current session:', session);
    return session;
  },

  // Get current token
  getCurrentToken: () => {
    const session = sessionManager.getCurrentSession();
    return session?.token || null;
  },

  // Get current user
  getCurrentUser: () => {
    const session = sessionManager.getCurrentSession();
    return session?.user || null;
  },

  // Clear specific session
  clearCustomerSession: () => {
    sessionStorage.removeItem(SESSIONS.CUSTOMER);
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
  },

  clearOwnerSession: () => {
    sessionStorage.removeItem(SESSIONS.OWNER);
    localStorage.removeItem('owner_token');
    localStorage.removeItem('owner_user');
  },

  // Clear current session
  clearCurrentSession: () => {
    const isOwner = window.location.pathname.includes('owner');
    if (isOwner) {
      sessionManager.clearOwnerSession();
    } else {
      sessionManager.clearCustomerSession();
    }
  },

  // Clear all sessions
  clearAll: () => {
    sessionStorage.removeItem(SESSIONS.CUSTOMER);
    sessionStorage.removeItem(SESSIONS.OWNER);
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    localStorage.removeItem('owner_token');
    localStorage.removeItem('owner_user');
  },

  // Switch dashboard
  switchDashboard: () => {
    const currentUser = sessionManager.getCurrentUser();
    if (!currentUser) return;

    if (currentUser.role === 'owner') {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/owner-dashboard';
    }
  }
};