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

      return {
        success: response.ok,
        data: responseData,
        status: response.status,
      };
    } catch (error) {
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
      
      console.log('🌐 courseAPI: Newest courses URL:', url);
      console.log('📋 courseAPI: Newest courses headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('📄 courseAPI: Newest courses response:', responseData);

      if (responseData.success) {
        console.log('✅ courseAPI: Successfully fetched newest courses');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to fetch newest courses:', responseData.message);
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

      console.log('🌐 courseAPI: Enrolled students URL:', url);
      console.log('📋 courseAPI: Enrolled students headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseData = await response.json();
      console.log('📡 courseAPI: Enrolled students response status:', response.status);
      console.log('📡 courseAPI: Enrolled students response data:', responseData);

      if (response.ok) {
        console.log('✅ courseAPI: Successfully fetched enrolled students');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to fetch enrolled students:', responseData.message);
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
        console.log('✅ courseAPI: Successfully fetched subcourse');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to fetch subcourse:', responseData.message);
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
      console.log('📡 courseAPI: Response data:', responseData);

      if (response.ok) {
        console.log('✅ courseAPI: Successfully fetched ratings');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to fetch ratings:', responseData.message);
        console.log('❌ courseAPI: Response status:', response.status);
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
      console.log('📡 courseAPI: Response data:', responseData);

      if (response.ok) {
        console.log('✅ courseAPI: Successfully submitted rating');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to submit rating:', responseData.message);
        console.log('❌ courseAPI: Response status:', response.status);
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error submitting rating:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  // New method to create course order for Razorpay payment
  createCourseOrder: async (token, subcourseId, priceInPaise = 100) => {
    try {
 
      const url = getApiUrl('/api/user/buy/buy-course');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      const requestBody = {
        subcourseId: subcourseId,
        amount: priceInPaise
      };

    
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      console.log('📡 courseAPI: Response data:', responseData);

      if (response.ok) {
        console.log('✅ courseAPI: Successfully created course order');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to create course order:', responseData.message);
        console.log('❌ courseAPI: Response status:', response.status);
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
      console.log('📡 courseAPI: Response data:', responseData);

      if (response.ok) {
        console.log('✅ courseAPI: Successfully verified payment');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to verify payment:', responseData.message);
        console.log('❌ courseAPI: Response status:', response.status);
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
        console.log('✅ courseAPI: Successfully enrolled in course');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to enroll in course:', responseData.message);
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

      console.log('🌐 courseAPI: Purchased subcourses URL:', url);
      console.log('📋 courseAPI: Purchased subcourses headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseData = await response.json();
   
      if (response.ok) {
        console.log('✅ courseAPI: Successfully fetched purchased subcourses');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to fetch purchased subcourses:', responseData.message);
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

      console.log('🌐 courseAPI: In-progress subcourses URL:', url);
      console.log('📋 courseAPI: In-progress subcourses headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseData = await response.json();
   
      if (response.ok) {
        console.log('✅ courseAPI: Successfully fetched in-progress subcourses');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to fetch in-progress subcourses:', responseData.message);
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

      console.log('🌐 courseAPI: Completed subcourses URL:', url);
      console.log('📋 courseAPI: Completed subcourses headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseData = await response.json();
      console.log('📡 courseAPI: Completed subcourses response status:', response.status);
      console.log('📡 courseAPI: Completed subcourses response data:', responseData);

      if (response.ok) {
        console.log('✅ courseAPI: Successfully fetched completed subcourses');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to fetch completed subcourses:', responseData.message);
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
        console.log('✅ courseAPI: Successfully fetched purchased course');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to fetch purchased course:', responseData.message);
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
        console.log('✅ courseAPI: Successfully enrolled in course');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to enroll in course:', responseData.message);
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

      console.log('🌐 courseAPI: Lesson details URL:', url);
      console.log('📋 courseAPI: Lesson details headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseData = await response.json();
    
      if (response.ok) {
        console.log('✅ courseAPI: Successfully fetched lesson details');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to fetch lesson details:', responseData.message);
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
        console.log('✅ courseAPI: Successfully marked lesson as completed');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to mark lesson as completed:', responseData.message);
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

     
      console.log('🔍 courseAPI: About to make fetch request...');

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      console.log('📡 courseAPI: Fetch response received');
     

      const responseData = await response.json();
      console.log('📡 courseAPI: Toggle favorite response data:', responseData);

      if (response.ok) {
        console.log('✅ courseAPI: Successfully toggled favorite status');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to toggle favorite status:', responseData.message);
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

      console.log('🌐 courseAPI: Subcourses by course ID URL:', url);
      console.log('📋 courseAPI: Subcourses by course ID headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseData = await response.json();
      console.log('📡 courseAPI: Subcourses by course ID response status:', response.status);
      console.log('📡 courseAPI: Subcourses by course ID response data:', responseData);

      if (response.ok) {
        console.log('✅ courseAPI: Successfully fetched subcourses by course ID');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to fetch subcourses by course ID:', responseData.message);
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error fetching subcourses by course ID:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },
};