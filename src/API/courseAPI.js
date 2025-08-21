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
      console.log('🚀 courseAPI: Fetching subcourse by ID...');
      console.log('🔑 courseAPI: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      console.log('🆔 courseAPI: Subcourse ID:', subcourseId);

      const url = getApiUrl(`/api/user/course/getsubcourseById/${subcourseId}`);
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };
      
      console.log('🌐 courseAPI: Subcourse by ID URL:', url);
      console.log('📋 courseAPI: Subcourse by ID headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('📄 courseAPI: Subcourse by ID response:', responseData);
      
      if (responseData.data) {
        console.log('📚 courseAPI: Subcourse details found:', responseData.data.subcourseName);
        console.log('🎥 courseAPI: Intro video URL:', responseData.data.introVideoUrl);
        console.log('📚 courseAPI: Total lessons:', responseData.data.totalLessons);
        console.log('⭐ courseAPI: Average rating:', responseData.data.avgRating);
        console.log('👥 courseAPI: Total students enrolled:', responseData.data.totalStudentsEnrolled);
        console.log('🏷️ courseAPI: Is best seller:', responseData.data.isBestSeller);
        
        if (responseData.data.lessons && Array.isArray(responseData.data.lessons)) {
          console.log('📚 courseAPI: Lessons found:', responseData.data.lessons.length);
          responseData.data.lessons.forEach((lesson, index) => {
            console.log(`📚 courseAPI: Lesson ${index + 1}:`, lesson.lessonName);
            console.log(`🖼️ courseAPI: Lesson thumbnail:`, lesson.thumbnailImageUrl);
            console.log(`⏱️ courseAPI: Lesson duration:`, lesson.duration);
          });
        }
      }

      return {
        success: response.ok,
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      console.error('💥 courseAPI: Error fetching subcourse by ID:', error);
      return {
        success: false,
        data: { message: 'Network error occurred' },
        status: 0,
      };
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
};
