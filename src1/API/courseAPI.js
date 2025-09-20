
import { getApiUrl, getApiHeaders, ENDPOINTS } from './config';

export const courseAPI = {
  getAllSubcourses: async (token) => {
    try {

      const url = getApiUrl(ENDPOINTS.GET_ALL_SUBCOURSES);
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
      console.error('💥 courseAPI: Error fetching subcourses:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  getAllCourses: async (token) => {
    try {

      const url = getApiUrl(ENDPOINTS.GET_ALL_COURSES);
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
      console.error('💥 courseAPI: Error fetching courses:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  getPopularSubcourses: async (token) => {
    try {

      const url = getApiUrl(ENDPOINTS.GET_POPULAR_SUBCOURSES);
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };
      

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
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

  getNewestSubcourses: async (token) => {
    try {

      const url = getApiUrl(ENDPOINTS.GET_NEWEST_SUBCOURSES);
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };
      

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

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

  getPurchasedSubcourses: async (token) => {
    try {

      const url = getApiUrl('/api/user/course/purchased-subcourses');
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
      console.error('💥 courseAPI: Error fetching purchased subcourses:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  getInProgressSubcourses: async (token) => {
    try {

      const url = getApiUrl('/api/user/course/in-progress-subcourses');
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
      console.error('💥 courseAPI: Error fetching in-progress subcourses:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  getCompletedSubcourses: async (token) => {
    try {

      const url = getApiUrl('/api/user/course/completed-subcourses');
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
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const body = JSON.stringify({
        subcourseId: subcourseId,
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
    
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  // Get favorite courses
  getFavoriteCourses: async (token) => {
    try {

      const url = getApiUrl(ENDPOINTS.GET_FAVORITE_COURSES);
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };


      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (response.ok) {
        return { success: true, data: responseData, status: response.status };
      } else {
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error fetching favorite courses:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
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
        const url = getApiUrl(`/api/user/course/get-CoursecertificateDesc/${courseId}`);
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

};











