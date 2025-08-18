// API Configuration
// ===========================================
// TO CHANGE ENVIRONMENT: Edit the BASE_URL below
// ===========================================

const API_CONFIG = {
  // Base URL - Change this for different environments
  // Development (Android Emulator)
  BASE_URL: 'http://192.168.1.28:3000',

  
  // Uncomment for iOS Simulator
  // BASE_URL: 'http://localhost:3000',
  
  // Uncomment for Production
  // BASE_URL: 'https://your-production-domain.com',
  
  // Uncomment for Staging
  // BASE_URL: 'https://your-staging-domain.com',
  
  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY_OTP: '/api/auth/verify-otp',
    
    // Add more endpoints here as needed
    // COURSES: '/api/courses',
    // USER_PROFILE: '/api/user/profile',
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
