
const API_CONFIG = {
  
  BASE_URL: 'http://10.0.2.2:3000',

  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY_OTP: '/api/auth/verify-otp',
    
    // Profile endpoints
    GET_USER_PROFILE: '/api/user/profile/get-profile',
     
  },
  
  // API Headers
  HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Timeout configuration
  TIMEOUT: 30000, // 30 seconds
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get API headers
export const getApiHeaders = () => {
  return { ...API_CONFIG.HEADERS };
};

// Export ENDPOINTS for use in other files
export const { ENDPOINTS } = API_CONFIG;

export default API_CONFIG;
