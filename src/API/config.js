import { Platform } from 'react-native';

const API_CONFIG = {
  
  // Base URL configuration for different platforms
  BASE_URL: Platform.select({
    android: 'http://192.168.1.39:3000', 
    // android: 'http://10.0.2.2:3000', 
      
      // A android: 'http://10.0.2.2:3000', ndroid emulator
    ios: 'http://localhost:3000', // iOS simulator
    default: 'http://localhost:3000', // Default fallback
  }),

  // Razorpay configuration
  RAZORPAY: {
    KEY: 'rzp_test_YOUR_KEY', // Replace with your actual Razorpay test key
  },

  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY_OTP: '/api/auth/verify-otp',
    GET_USER_PROFILE: '/api/user/profile/get-profile',
    UPDATE_USER_PROFILE: '/api/user/profile/update-profile',
    
    // Course endpoints
    GET_ALL_SUBCOURSES: '/api/user/course/getAll-subcourses',
    GET_POPULAR_SUBCOURSES: '/api/user/course/getPopular-subcourses',
    GET_NEWEST_SUBCOURSES: '/api/user/course/getNewest-subcourses',
    GET_SUBCOURSE_BY_ID: '/api/user/course/getsubcourseById',
    GET_ALL_COURSES: '/api/user/course/getAllCourses',
    GET_PURCHASED_SUBCOURSES: '/api/user/course/purchased-subcourses',
    GET_IN_PROGRESS_SUBCOURSES: '/api/user/course/in-progress-subcourses',
    GET_COMPLETED_SUBCOURSES: '/api/user/course/completed-subcourses',
    GET_PURCHASED_COURSE: '/api/user/course/get-purchased-course',
    HOMEPAGE_BANNER: '/api/user/course/homePage-banner',
    
    // Favorite endpoints
    GET_FAVORITE_COURSES: '/api/user/favorite/get-favouriteCourses', // Fixed spelling: favourite -> favorite
    ADD_FAVORITE_COURSE: '/api/user/favorite/add-favouriteCourse', // Fixed spelling: favourite -> favorite
  },

  HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Timeout configuration
  TIMEOUT: 30000, // 30 seconds
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  if (!API_CONFIG.BASE_URL) {
    console.error('❌ API Config: BASE_URL is undefined! Platform:', Platform.OS);
    // Fallback to a default URL if BASE_URL is somehow undefined
    const fallbackUrl = `http://localhost:3000${endpoint}`;
    console.log('🌐 API Config: Using fallback URL:', fallbackUrl);
    return fallbackUrl;
  }
  
  const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log('🌐 API Config: Full URL:', fullUrl);
  console.log('🌐 API Config: Platform:', Platform.OS);
  return fullUrl;
};

// Helper function to get API headers
export const getApiHeaders = () => {
  return { ...API_CONFIG.HEADERS };
};

// Export ENDPOINTS for use in other files
export const { ENDPOINTS } = API_CONFIG;

export default API_CONFIG;
