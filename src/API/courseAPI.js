import { getApiUrl, getApiHeaders } from './config';

export const courseAPI = {
  getAllSubcourses: async (token) => {
    try {
      console.log('🚀 courseAPI: Fetching all subcourses...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');

      const url = getApiUrl('/api/user/course/getAll-subcourses');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      console.log('🌐 courseAPI: Making request to:', url);
      console.log('📋 courseAPI: Headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const responseData = await response.json();
      console.log('📡 courseAPI: Response status:', response.status);
      console.log('📡 courseAPI: Response data:', responseData);

      if (response.ok) {
        console.log('✅ courseAPI: Successfully fetched subcourses');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to fetch subcourses:', responseData.message);
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error fetching subcourses:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  getAllCourses: async (token) => {
    try {
      console.log('🚀 courseAPI: Fetching all courses...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');

      const url = getApiUrl('/api/user/course/getAllCourses');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      console.log('🌐 courseAPI: Making request to:', url);
      console.log('📋 courseAPI: Headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const responseData = await response.json();
      console.log('📡 courseAPI: Response status:', response.status);
      console.log('📡 courseAPI: Response data:', responseData);

      if (response.ok) {
        console.log('✅ courseAPI: Successfully fetched courses');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to fetch courses:', responseData.message);
        return { success: false, data: responseData, status: response.status };
      }
    } catch (error) {
      console.error('💥 courseAPI: Error fetching courses:', error);
      return { success: false, data: { message: 'Network error occurred' }, status: 0 };
    }
  },

  getPopularSubcourses: async (token) => {
    try {
      console.log('🚀 courseAPI: Fetching popular subcourses...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');

      const url = getApiUrl('/api/user/course/getPopular-subcourses');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };
      
      console.log('🌐 courseAPI: Popular courses URL:', url);
      console.log('📋 courseAPI: Popular courses headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('📄 courseAPI: Popular courses response:', responseData);
      
      if (responseData.data && Array.isArray(responseData.data)) {
        console.log('📚 courseAPI: Popular courses found:', responseData.data.length, 'courses');
        responseData.data.forEach((course, index) => {
          console.log(`📚 courseAPI: Popular Course ${index + 1}:`, course.subcourseName);
          console.log(`🖼️ courseAPI: Thumbnail URL: ${course.thumbnailImageUrl || 'No thumbnail'}`);
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
      console.log('🚀 courseAPI: Fetching newest subcourses...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');

      const url = getApiUrl('/api/user/course/getNewest-subcourses');
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
      console.log('🚀 courseAPI: Fetching enrolled students...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      console.log('🆔 courseAPI: Subcourse ID:', subcourseId);

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
      console.log('🚀 courseAPI: Fetching subcourse by ID:', subcourseId);
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');

      const url = getApiUrl(`/api/user/course/getsubcourseById/${subcourseId}`);
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      console.log('🌐 courseAPI: Making request to:', url);
      console.log('📋 courseAPI: Headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const responseData = await response.json();
      console.log('📡 courseAPI: Response status:', response.status);
      console.log('📡 courseAPI: Response data:', responseData);

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
      console.log('🚀 courseAPI: Fetching ratings for subcourse:', subcourseId);
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');

      const url = getApiUrl(`/api/user/rating/getAll-ratings?subcourseId=${subcourseId}`);
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      console.log('🌐 courseAPI: Making request to:', url);
      console.log('📋 courseAPI: Headers:', headers);
      console.log('🔍 courseAPI: Query parameters: subcourseId=', subcourseId);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('📡 courseAPI: Response status:', response.status);
      console.log('📡 courseAPI: Response headers:', response.headers);

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
      console.log('🚀 courseAPI: Submitting rating for subcourse:', subcourseId);
      console.log('⭐ courseAPI: Rating value:', rating);
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');

      const url = getApiUrl('/api/user/rating/rate-subcourse');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      const requestBody = {
        subcourseId: subcourseId,
        rating: rating
      };

      console.log('🌐 courseAPI: Making POST request to:', url);
      console.log('📋 courseAPI: Headers:', headers);
      console.log('📦 courseAPI: Request body:', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('📡 courseAPI: Response status:', response.status);
      console.log('📡 courseAPI: Response headers:', response.headers);

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
  createCourseOrder: async (token, subcourseId) => {
    try {
      console.log('🚀 courseAPI: Creating course order for subcourse:', subcourseId);
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');

      const url = getApiUrl('/api/user/buy/buy-course');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      const requestBody = {
        subcourseId: subcourseId
      };

      console.log('🌐 courseAPI: Making POST request to:', url);
      console.log('📋 courseAPI: Headers:', headers);
      console.log('📦 courseAPI: Request body:', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('📡 courseAPI: Response status:', response.status);
      console.log('📡 courseAPI: Response headers:', response.headers);

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
      console.log('🚀 courseAPI: Verifying payment for order:', razorpayOrderId);
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      console.log('🆔 courseAPI: Subcourse ID:', subcourseId);

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

      console.log('🌐 courseAPI: Making POST request to:', url);
      console.log('📋 courseAPI: Headers:', headers);
      console.log('📦 courseAPI: Request body:', requestBody);
      console.log('🔍 courseAPI: Request body details:');
      console.log('  - razorpayOrderId:', requestBody.razorpayOrderId);
      console.log('  - razorpayPaymentId:', requestBody.razorpayPaymentId);
      console.log('  - razorpaySignature:', requestBody.razorpaySignature);
      console.log('  - subcourseId:', requestBody.subcourseId);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('📡 courseAPI: Response status:', response.status);
      console.log('📡 courseAPI: Response headers:', response.headers);

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
      console.log('🚀 courseAPI: Enrolling in course...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      console.log('🆔 courseAPI: Subcourse ID:', subcourseId);

      const url = getApiUrl('/api/user/buy/buy-course');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      console.log('🌐 courseAPI: Enrollment URL:', url);
      console.log('📋 courseAPI: Enrollment headers:', headers);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          subcourseId: subcourseId
        }),
      });

      const responseData = await response.json();
      console.log('📡 courseAPI: Enrollment response status:', response.status);
      console.log('📡 courseAPI: Enrollment response data:', responseData);

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
      console.log('🚀 courseAPI: Fetching purchased subcourses...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');

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
      console.log('📡 courseAPI: Purchased subcourses response status:', response.status);
      console.log('📡 courseAPI: Purchased subcourses response data:', responseData);

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
      console.log('🚀 courseAPI: Fetching in-progress subcourses...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');

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
      console.log('📡 courseAPI: In-progress subcourses response status:', response.status);
      console.log('📡 courseAPI: In-progress subcourses response data:', responseData);

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
      console.log('🚀 courseAPI: Fetching completed subcourses...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');

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
      console.log('🚀 courseAPI: Fetching purchased course for banner...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');

      const url = getApiUrl('/api/user/course/get-purchased-course');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      console.log('🌐 courseAPI: Purchased course URL:', url);
      console.log('📋 courseAPI: Purchased course headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const responseData = await response.json();
      console.log('📡 courseAPI: Purchased course response status:', response.status);
      console.log('📡 courseAPI: Purchased course response data:', responseData);

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
      console.log('🚀 courseAPI: Enrolling in course...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      console.log('🆔 courseAPI: Subcourse ID:', subcourseId);

      const url = getApiUrl('/api/user/buy/buy-course');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      console.log('🌐 courseAPI: Enrollment URL:', url);
      console.log('📋 courseAPI: Enrollment headers:', headers);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          subcourseId: subcourseId
        }),
      });

      const responseData = await response.json();
      console.log('📡 courseAPI: Enrollment response status:', response.status);
      console.log('📡 courseAPI: Enrollment response data:', responseData);

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
      console.log('🚀 courseAPI: Fetching lesson details...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      console.log('🆔 courseAPI: Lesson ID:', lessonId);

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
      console.log('📡 courseAPI: Lesson details response status:', response.status);
      console.log('📡 courseAPI: Lesson details response data:', responseData);

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
      console.log('🚀 courseAPI: Marking lesson as completed...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      console.log('🆔 courseAPI: Lesson ID:', lessonId);

      const url = getApiUrl('/api/user/mark/lessons/mark-completed');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const body = JSON.stringify({
        lessonId: lessonId,
      });

      console.log('🌐 courseAPI: Mark lesson completed URL:', url);
      console.log('📋 courseAPI: Mark lesson completed headers:', headers);
      console.log('📦 courseAPI: Mark lesson completed body:', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      const responseData = await response.json();
      console.log('📡 courseAPI: Mark lesson completed response status:', response.status);
      console.log('📡 courseAPI: Mark lesson completed response data:', responseData);

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
      console.log('🚀 courseAPI: Toggling favorite status...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      console.log('🆔 courseAPI: Subcourse ID:', subcourseId);

      const url = getApiUrl('/api/user/favourite/add-favouriteCourse');
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
      console.log('🚀 courseAPI: Fetching favorite courses...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');

      const url = getApiUrl('/api/user/favourite/get-favouriteCourses');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };

      console.log('🌐 courseAPI: Favorite courses URL:', url);
      console.log('📋 courseAPI: Favorite courses headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('📄 courseAPI: Favorite courses response:', responseData);

      if (response.ok) {
        console.log('✅ courseAPI: Successfully fetched favorite courses');
        return { success: true, data: responseData, status: response.status };
      } else {
        console.log('❌ courseAPI: Failed to fetch favorite courses:', responseData.message);
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
      console.log('🚀 courseAPI: Fetching subcourses by course ID...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      console.log('🆔 courseAPI: Course ID:', courseId);

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
