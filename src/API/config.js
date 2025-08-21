
const API_CONFIG = {
  
  BASE_URL: 'http://10.0.2.2:3000',

  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY_OTP: '/api/auth/verify-otp',
    GET_USER_PROFILE: '/api/user/profile/get-profile',
    GET_ALL_SUBCOURSES: '/api/user/course/getAll-subcourses',
    GET_POPULAR_SUBCOURSES: '/api/user/course/getPopular-subcourses',
    GET_NEWEST_SUBCOURSES: '/api/user/course/getNewest-subcourses',
    GET_SUBCOURSE_BY_ID: '/api/user/course/getsubcourseById',
    GET_ALL_COURSES: '/api/user/course/getAllCourses',
     
  },

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
