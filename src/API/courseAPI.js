
import { getApiUrl, getApiHeaders, ENDPOINTS } from './config';
import { checkApiResponseForTokenError, handleTokenError } from '../utils/tokenErrorHandler';

export const courseAPI = {
  getAllSubcourses: async (token, options = {}) => {
    try {
      const { page = 1, limit = 5 } = options;
      console.log('🔍 [API DEBUG] getAllSubcourses called');
      console.log('🔍 [API DEBUG] - Page:', page, 'Limit:', limit);
      console.log('🔍 [API DEBUG] - Pagination enabled');

      const url = getApiUrl(`${ENDPOINTS.GET_ALL_SUBCOURSES}?page=${page}&limit=${limit}`);
      console.log('🔍 [API DEBUG] getAllSubcourses URL:', url);
      
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };
      console.log('🔍 [API DEBUG] getAllSubcourses headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const responseData = await response.json();

      // Check for token errors
      if (checkApiResponseForTokenError({ status: response.status, data: responseData })) {
        console.log('🔐 [courseAPI] Token error detected in getAllSubcourses');
        await handleTokenError(responseData, true);
        return {
          success: false,
          data: responseData,
          status: response.status,
          isTokenError: true,
        };
      }

      // DETAILED API RESPONSE DEBUG FOR ALL COURSES
      console.log('🔥🔥🔥 API LEVEL - ALL COURSES RESPONSE DEBUG 🔥🔥🔥');
      console.log('🔥 API Name: getAllSubcourses');
      console.log('🔥 Endpoint: /api/course/get-all-subcourses');
      console.log('🔥 Full URL:', url);
      console.log('🔥 Response Status:', response.status);
      console.log('🔥 Response Success:', responseData.success);
      console.log('🔥 Response Data:', responseData.data);
      console.log('🔥 Courses Count:', responseData.data?.length);
      console.log('🔥 Has Pagination:', !!responseData.pagination);
      if (responseData.pagination) {
        console.log('🔥 Pagination Details:');
        console.log('🔥 - currentPage:', responseData.pagination.currentPage);
        console.log('🔥 - totalPages:', responseData.pagination.totalPages);
        console.log('🔥 - totalCourses:', responseData.pagination.totalCourses);
        console.log('🔥 - hasNextPage:', responseData.pagination.hasNextPage);
        console.log('🔥 - hasPrevPage:', responseData.pagination.hasPrevPage);
        console.log('🔥 - limit:', responseData.pagination.limit);
        console.log('🔥 - offset:', responseData.pagination.offset);
      }
      console.log('🔥🔥🔥 END API LEVEL - ALL COURSES DEBUG 🔥🔥🔥');

      if (response.ok) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error fetching subcourses:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  getAllCourses: async (token, page = 1, limit = 10) => {
    try {
      
      const url = getApiUrl(`${ENDPOINTS.GET_ALL_COURSES}?page=${page}&limit=${limit}`);
      console.log('🔥 courseAPI.getAllCourses: API URL:', url);
      
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };
      console.log('🔥 courseAPI.getAllCourses: Request headers:', headers);

      console.log('🔥 courseAPI.getAllCourses: Making fetch request...');
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      

      const responseData = await response.json();
     
      // Check for token errors
      if (checkApiResponseForTokenError({ status: response.status, data: responseData })) {
        console.log('🔐 [courseAPI] Token error detected in getAllCourses');
        await handleTokenError(responseData, true);
        return {
          success: false,
          data: responseData,
          status: response.status,
          isTokenError: true,
        };
      }
     
      // DETAILED API RESPONSE DEBUG FOR ALL COURSES
      
      if (responseData.pagination) {
        console.log('🔥 Pagination Details:');
     
      }
      console.log('🔥🔥🔥 END API LEVEL - ALL COURSES DEBUG 🔥🔥🔥');

      if (response.ok) {
        console.log('✅ courseAPI.getAllCourses: API call successful');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI.getAllCourses: API call failed');
        console.log('❌ courseAPI.getAllCourses: Error response data:', responseData);
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      
      return { success: false, data: { message: 'Network error occurred: ' + error.message }, status: 0 };
    }
  },

  getPopularSubcourses: async (token, options = {}) => {
    try {
      const { page = 1, limit = 6 } = options;
      console.log('🔍 [API DEBUG] getPopularSubcourses called');
      console.log('🔍 [API DEBUG] - Page:', page, 'Limit:', limit);
      console.log('🔍 [API DEBUG] - Pagination enabled');

      const url = getApiUrl(`${ENDPOINTS.GET_POPULAR_SUBCOURSES}?page=${page}&limit=${limit}`);
      console.log('🔍 [API DEBUG] getPopularSubcourses URL:', url);
      
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };
      console.log('🔍 [API DEBUG] getPopularSubcourses headers:', headers);
      

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // Check for token errors
      if (checkApiResponseForTokenError({ status: response.status, data: responseData })) {
        console.log('🔐 [courseAPI] Token error detected in getPopularSubcourses');
        await handleTokenError(responseData, true);
        return {
          success: false,
          data: responseData,
          status: response.status,
          isTokenError: true,
        };
      }

      // DETAILED API RESPONSE DEBUG FOR POPULAR COURSES
      
      if (responseData.pagination) {
        
      }
      console.log('🔥🔥🔥 END API LEVEL - POPULAR COURSES DEBUG 🔥🔥🔥');
      
      if (responseData.data && Array.isArray(responseData.data)) {
        responseData.data.forEach((course, index) => {
        });
      }

      return {
        success: response.ok,
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      console.error('💥 courseAPI: Error fetching popular subcourses:', error);
      return {
        success: false,
        data: { message: 'Network error occurred' },
        status: 0,
      };
    }
  },

  getNewestSubcourses: async (token, options = {}) => {
    try {
      const { page = 1, limit = 6 } = options;
      console.log('🔍 [API DEBUG] getNewestSubcourses called');
      console.log('🔍 [API DEBUG] - Page:', page, 'Limit:', limit);
      console.log('🔍 [API DEBUG] - Pagination enabled');

      const url = getApiUrl(`${ENDPOINTS.GET_NEWEST_SUBCOURSES}?page=${page}&limit=${limit}`);
      console.log('🔍 [API DEBUG] getNewestSubcourses URL:', url);
      
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };
      console.log('🔍 [API DEBUG] getNewestSubcourses headers:', headers);
      

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // Check for token errors
      if (checkApiResponseForTokenError({ status: response.status, data: responseData })) {
        console.log('🔐 [courseAPI] Token error detected in getNewestSubcourses');
        await handleTokenError(responseData, true);
        return {
          success: false,
          data: responseData,
          status: response.status,
          isTokenError: true,
        };
      }

      // DETAILED API RESPONSE DEBUG FOR NEWEST COURSES
     
      console.log('🔥 Has Pagination:', !!responseData.pagination);
      if (responseData.pagination) {
        
        console.log('🔥 - offset:', responseData.pagination.offset);
      }
      console.log('🔥🔥🔥 END API LEVEL - NEWEST COURSES DEBUG 🔥🔥🔥');

      if (responseData.success) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error fetching newest courses:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  getEnrolledStudents: async (token, subcourseId) => {
    try {

      const url = getApiUrl(`/api/user/course/get-enrolled-students/${subcourseId}`);
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };


      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseData = await response.json();

      if (response.ok) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error fetching enrolled students:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  getSubcourseById: async (token, subcourseId) => {
    try {

      const url = getApiUrl(`/api/user/course/getsubcourseById/${subcourseId}`);
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };


      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const responseData = await response.json();

      // DETAILED API RESPONSE DEBUG FOR COURSE DETAILS
      

      if (response.ok) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error fetching subcourse:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  // New method to fetch ratings for a subcourse
  getSubcourseRatings: async (token, subcourseId) => {
    try {

      const url = getApiUrl(`/api/user/rating/getAll-ratings?subcourseId=${subcourseId}`);
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };


      const response = await fetch(url, {
        method: 'GET',
        headers,
      });


      const responseData = await response.json();

      if (response.ok) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error fetching ratings:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  // New method to submit a rating for a subcourse
  submitRating: async (token, subcourseId, rating) => {
    try {

      const url = getApiUrl('/api/user/rating/rate-subcourse');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      const requestBody = {
        subcourseId: subcourseId,
        rating: rating
      };


      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });


      const responseData = await response.json();

      if (response.ok) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error submitting rating:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  // New method to create course order for Razorpay payment
  createCourseOrder: async (token, subcourseId) => {
    try {

      const url = getApiUrl('/api/user/buy/buy-course');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      const requestBody = {
        subcourseId: subcourseId
      };


      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });


      const responseData = await response.json();

      if (response.ok) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error creating course order:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  // New method to verify payment after Razorpay payment
  verifyPayment: async (token, razorpayOrderId, razorpayPaymentId, razorpaySignature, subcourseId) => {
    try {

      const url = getApiUrl('/api/user/buy/verify-payment');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      const requestBody = {
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: razorpaySignature,
        subcourseId: subcourseId
      };


      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });


      const responseData = await response.json();

      if (response.ok) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error verifying payment:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  enrollInCourse: async (token, subcourseId) => {
    try {

      const url = getApiUrl('/api/user/buy/buy-course');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          subcourseId: subcourseId
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error enrolling in course:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  getPurchasedSubcourses: async (token, page = 1, limit = 10) => {
    try {
      

      const url = getApiUrl(`/api/user/course/purchased-subcourses?page=${page}&limit=${limit}`);
      console.log('🔥 courseAPI.getPurchasedSubcourses: API URL:', url);
      
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };
      console.log('🔥 courseAPI.getPurchasedSubcourses: Request headers:', headers);

      console.log('🔥 courseAPI.getPurchasedSubcourses: Making fetch request...');
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

     
      console.log('🔥 courseAPI.getPurchasedSubcourses: Response ok:', response.ok);
      console.log('🔥 courseAPI.getPurchasedSubcourses: Response headers:', response.headers);

      const responseData = await response.json();
     

      if (response.ok) {
        console.log('✅ courseAPI.getPurchasedSubcourses: API call successful');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI.getPurchasedSubcourses: API call failed');
        console.log('❌ courseAPI.getPurchasedSubcourses: Error response data:', responseData);
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      
      return { success: false, data: { message: 'Network error occurred: ' + error.message }, status: 0 };
    }
  },

  getInProgressSubcourses: async (token, page = 1, limit = 10) => {
    try {
     

      const url = getApiUrl(`/api/user/course/in-progress-subcourses?page=${page}&limit=${limit}`);
      console.log('🔥 courseAPI.getInProgressSubcourses: API URL:', url);
      
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };
      console.log('🔥 courseAPI.getInProgressSubcourses: Request headers:', headers);

      console.log('🔥 courseAPI.getInProgressSubcourses: Making fetch request...');
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

     
      const responseData = await response.json();
      if (__DEV__) {
        console.log('🔥 courseAPI.getInProgressSubcourses: Response success:', responseData.success);
      }
      console.log('🔥 courseAPI.getInProgressSubcourses: Response data.data isArray:', Array.isArray(responseData?.data));

      if (response.ok) {
        console.log('✅ courseAPI.getInProgressSubcourses: API call successful');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI.getInProgressSubcourses: API call failed');
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI.getInProgressSubcourses: Exception caught:', error);
      return { success: false, data: { message: 'Network error occurred: ' + error.message }, status: 0 };
    }
  },

  getCompletedSubcourses: async (token, page = 1, limit = 10) => {
    try {
      console.log('🔥 courseAPI.getCompletedSubcourses: Starting API call...');
      console.log('🔥 courseAPI.getCompletedSubcourses: Page:', page, 'Limit:', limit);

      const url = getApiUrl(`/api/user/course/completed-subcourses?page=${page}&limit=${limit}`);
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      console.log('🔥 courseAPI.getCompletedSubcourses: API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseData = await response.json();
      if (__DEV__) {
        console.log('🔥 courseAPI.getCompletedSubcourses: Response success:', responseData.success);
      }

      if (response.ok) {
        console.log('✅ courseAPI.getCompletedSubcourses: API call successful');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI.getCompletedSubcourses: API call failed');
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error fetching completed subcourses:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  getPurchasedCourse: async (token) => {
    try {

      const url = getApiUrl('/api/user/course/get-purchased-course');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };


      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseData = await response.json();

      if (response.ok) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error fetching purchased course:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  enrollInCourse: async (token, subcourseId) => {
    try {

      const url = getApiUrl('/api/user/buy/buy-course');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          subcourseId: subcourseId
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error enrolling in course:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  getLessonById: async (token, lessonId) => {
    try {

      const url = getApiUrl(`/api/user/course/getLessonById/${lessonId}`);
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };


      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseData = await response.json();

      if (response.ok) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error fetching lesson details:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  markLessonCompleted: async (token, lessonId) => {
    try {

      const url = getApiUrl('/api/user/mark/lessons/mark-completed');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const body = JSON.stringify({
        lessonId: lessonId,
      });


      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      const responseData = await response.json();

      if (response.ok) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error marking lesson as completed:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  toggleFavorite: async (token, subcourseId) => {
    try {
     
      const url = getApiUrl(ENDPOINTS.ADD_FAVORITE_COURSE);
      console.log('🔥 courseAPI.toggleFavorite: API URL:', url);
      
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      console.log('🔥 courseAPI.toggleFavorite: Request headers:', headers);

      const body = JSON.stringify({
        subcourseId: subcourseId,
      });
      console.log('🔥 courseAPI.toggleFavorite: Request body:', body);

      console.log('🔥 courseAPI.toggleFavorite: Making fetch request...');
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

     

      const responseData = await response.json();
    
      if (response.ok) {
        console.log('✅ courseAPI.toggleFavorite: API call successful');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI.toggleFavorite: API call failed');
        console.log('❌ courseAPI.toggleFavorite: Error response data:', responseData);
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
     
      return { success: false, data: { message: 'Network error occurred: ' + error.message }, status: 0 };
    }
  },

  // Get favorite courses
  getFavoriteCourses: async (token, page = 1, limit = 10) => {
    try {
     

      const url = getApiUrl(`${ENDPOINTS.GET_FAVORITE_COURSES}?page=${page}&limit=${limit}`);
      console.log('🔥 courseAPI.getFavoriteCourses: API URL:', url);
      
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };
      console.log('🔥 courseAPI.getFavoriteCourses: Request headers:', headers);

      console.log('🔥 courseAPI.getFavoriteCourses: Making fetch request...');
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      

      if (!response.ok) {
        console.log('❌ courseAPI.getFavoriteCourses: HTTP error! status:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
    
      // DETAILED API RESPONSE DEBUG FOR FAVORITE COURSES
     
      console.log('🔥 Response Message:', responseData.message);
      console.log('🔥 Courses Data:', responseData.data);
      console.log('🔥 Courses Count:', responseData.data?.length);
      console.log('🔥 Has Pagination:', !!responseData.pagination);
      if (responseData.pagination) {
        
        console.log('🔥 - limit:', responseData.pagination.limit);
        console.log('🔥 - offset:', responseData.pagination.offset);
      }
      console.log('🔥🔥🔥 END API LEVEL - FAVORITE COURSES DEBUG 🔥🔥🔥');

      if (response.ok) {
        console.log('✅ courseAPI.getFavoriteCourses: API call successful');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI.getFavoriteCourses: API call failed');
        console.log('❌ courseAPI.getFavoriteCourses: Error response data:', responseData);
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      
      return { success: false, data: { message: 'Network error occurred: ' + error.message }, status: 0 };
    }
  },

  // Get subcourses by course ID
  getSubcoursesByCourseId: async (token, courseId) => {
    try {

      const url = getApiUrl(`/api/user/course/getALLSubcoursesbyId/${courseId}`);
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };


      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseData = await response.json();

      if (response.ok) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error fetching subcourses by course ID:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },
    // Get course certificate description and details
    getCourseCertificateDesc: async (token, courseId) => {
      try {
        const url = getApiUrl(`/api/user/course/get-certificateDesc/${courseId}`);
        const headers = {
          ...getApiHeaders(),
          'Authorization': `Bearer ${token}`,
        };
  
        console.log('🌐 courseAPI: Course certificate desc URL:', url);
        console.log('📋 courseAPI: Course certificate desc headers:', headers);
  
        const response = await fetch(url, {
          method: 'GET',
          headers: headers,
        });
  
        const responseData = await response.json();
        console.log('📡 courseAPI: Course certificate desc response status:', response.status);
        console.log('📡 courseAPI: Course certificate desc response data:', responseData);
  
        if (response.ok) {
          console.log('✅ courseAPI: Successfully fetched course certificate description');
          return { success: true, data: responseData, status: response.status };
        } else {
          console.log('❌ courseAPI: Failed to fetch course certificate description:', responseData.message);
          return { success: false, data: responseData, status: response.status };
        }
      } catch (error) {
        console.error('💥 courseAPI: Error fetching course certificate description:', error);
        return { success: false, data: { message: 'Network error occurred' }, status: 0 };
      }
    },

  // Recorded Lesson APIs
  createRecordedLessonOrder: async (token, subcourseId) => {
    try {
      const url = getApiUrl('/api/user/recordedLessons/purchase-recorded-lessons');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      console.log('🌐 courseAPI: Create recorded lesson order URL:', url);
      console.log('📋 courseAPI: Create recorded lesson order headers:', headers);
      console.log('📋 courseAPI: Subcourse ID:', subcourseId);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ subcourseId }),
      });

      const responseData = await response.json();
      console.log('📡 courseAPI: Create recorded lesson order response status:', response.status);
      console.log('📡 courseAPI: Create recorded lesson order response data:', responseData);

      if (response.ok) {
        console.log(' courseAPI: Successfully created recorded lesson order');
        return { success: true, data: responseData, orderId: responseData.data?.orderId };
      } else {
        console.log(' courseAPI: Failed to create recorded lesson order:', responseData.message);
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error(' courseAPI: Error creating recorded lesson order:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  verifyRecordedLessonPayment: async (token, paymentData) => {
    try {
      const url = getApiUrl('/api/user/recordedLessons/verify-lessons-payment');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      console.log('🌐 courseAPI: Verify recorded lesson payment URL:', url);
      console.log('📋 courseAPI: Verify recorded lesson payment headers:', headers);
      console.log('📋 courseAPI: Payment data:', paymentData);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(paymentData),
      });

      const responseData = await response.json();
      console.log('📡 courseAPI: Verify recorded lesson payment response status:', response.status);
      console.log('📡 courseAPI: Verify recorded lesson payment response data:', responseData);

      if (response.ok) {
        console.log('✅ courseAPI: Successfully verified recorded lesson payment');
        return { success: true, data: responseData };
      } else {
        console.log('❌ courseAPI: Failed to verify recorded lesson payment:', responseData.message);
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error verifying recorded lesson payment:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

};