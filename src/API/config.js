import { Platform } from 'react-native';

const API_CONFIG = {
  
  // Base URL configuration for different platforms
  BASE_URL: Platform.select({
    // android: 'https://main.learningsaint.com', // Production URL (commented)
    // ios: 'https://main.learningsaint.com', // Production URL (commented)
    // default: 'https://main.learningsaint.com', // Production URL (commented)
    android: 'http://192.168.29.119:3000', // Local development URL
    ios: 'http://192.168.29.119:3000', // Local development URL
    default: 'http://192.168.29.119:3000', // Local development URL
  }),

  // Razorpay configuration
  RAZORPAY: {
    KEY: 'rzp_live_ZumwCLoX1AZdm9', // Replace with your actual Razorpay test key
  },

  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints (Firebase)
    LOGIN: '/api/auth/firebase/login',
    REGISTER: '/api/auth/firebase/register',
    VERIFY_OTP: '/api/auth/firebase/verify-otp',
    RESEND_OTP: '/api/auth/firebase/resend-otp',
    SEND_EMAIL_OTP: '/api/auth/send-emailotp',
    VERIFY_EMAIL_OTP: '/api/auth/verify-emailOtp',
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
    TOGGLE_FAVORITE: '/api/user/favorite/toggle-favouriteCourse', // Add missing toggle endpoint
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
    // const fallbackUrl = `https://main.learningsaint.com${endpoint}`; // Production URL (commented)
    const fallbackUrl = `http://192.168.29.119:3000${endpoint}`; // Local development URL
    return fallbackUrl;
  }
  
  const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
  return fullUrl;
};

// Helper function to get API headers
export const getApiHeaders = () => {
  return { ...API_CONFIG.HEADERS };
};

// Export ENDPOINTS for use in other files
export const { ENDPOINTS } = API_CONFIG;

export default API_CONFIG;