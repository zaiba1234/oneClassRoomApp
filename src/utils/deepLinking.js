/**
 * Deep Linking Utility
 * Handles deep linking for notifications and app navigation
 */

// URL Scheme for the app
export const URL_SCHEME = 'learningsaint';

// Deep link paths mapping
export const DEEP_LINK_PATHS = {
  // Notification routes
  NOTIFICATION: 'notification',
  NOTIFICATION_DETAIL: 'notification/:notificationId',
  
  // Lesson routes
  LESSON: 'lesson/:lessonId',
  LIVE_LESSON: 'lesson/live/:lessonId',
  
  // Course routes
  COURSE: 'course/:courseId',
  ENROLL: 'enroll/:courseId',
  
  // Internship routes
  INTERNSHIP: 'internship',
  INTERNSHIP_LETTER: 'internship/letter',
  
  // Other routes
  HOME: 'home',
  PROFILE: 'profile',
};

/**
 * Generate deep link URL from notification data
 * @param {Object} notificationData - Notification data from FCM
 * @returns {string} Deep link URL
 */
export const generateDeepLinkFromNotification = (notificationData) => {
  try {
    console.log('🔗 [DeepLinking] Generating deep link from notification:', JSON.stringify(notificationData, null, 2));
    
    // Handle different notification data structures
    // Firebase can send data in different formats:
    // 1. notificationData.data (from FCM data payload)
    // 2. notificationData.notification.data (from notification payload)
    // 3. notificationData (direct data)
    // 4. notificationData.data (after enrichment)
    let data = notificationData?.data || notificationData?.notification?.data || notificationData;
    
    // Also check if lessonId is at top level (from enrichment)
    if (!data.lessonId && !data.lesson_id && notificationData?.lessonId) {
      data = { ...data, lessonId: notificationData.lessonId };
    }
    
    // If data is nested, try to extract it
    if (!data || typeof data !== 'object') {
      console.log('⚠️ [DeepLinking] No data found, using home');
      return `${URL_SCHEME}://home`;
    }

    console.log('🔗 [DeepLinking] Extracted data:', JSON.stringify(data, null, 2));
    
    // Get notification type
    const notificationType = data.type || data.notificationType || data.notification_type;
    console.log('🔗 [DeepLinking] Notification type:', notificationType);

    // Handle different notification types
    switch (notificationType) {
      case 'live_lesson':
      case 'liveLesson':
      case 'liveLessonNotification':
      case 'lesson_live':  // Backend sends this type for live lessons
        const lessonId = data.lessonId || data.lesson_id;
        if (lessonId) {
          console.log('🔗 [DeepLinking] Live lesson detected, lessonId:', lessonId);
          return `${URL_SCHEME}://lesson/live/${lessonId}`;
        }
        // If lessonId not in FCM data, try to get from notificationData directly
        // This happens when enrichment hasn't happened yet
        const directLessonId = notificationData?.data?.lessonId || notificationData?.lessonId;
        if (directLessonId) {
          console.log('🔗 [DeepLinking] Live lesson detected, lessonId from direct data:', directLessonId);
          return `${URL_SCHEME}://lesson/live/${directLessonId}`;
        }
        // If still no lessonId, check if we have subcourseId as fallback
        const subcourseId = data.subcourseId || data.subcourse_id;
        if (subcourseId) {
          console.log('⚠️ [DeepLinking] Live lesson detected but no lessonId, using subcourseId as fallback:', subcourseId);
          // Still navigate to lesson screen, but we'll need to handle this in LessonVideo screen
          // For now, return notification screen as we can't navigate without lessonId
          return `${URL_SCHEME}://notification`;
        }
        console.log('⚠️ [DeepLinking] Live lesson detected but lessonId not in FCM data and no subcourseId');
        break;
        
      case 'lesson':
      case 'lessonNotification':
      case 'lesson_notification':
        if (data.lessonId || data.lesson_id) {
          const lessonId = data.lessonId || data.lesson_id;
          console.log('🔗 [DeepLinking] Lesson detected, lessonId:', lessonId);
          return `${URL_SCHEME}://lesson/${lessonId}`;
        }
        break;
        
      case 'buy_course':
      case 'buyCourse':
      case 'course':
      case 'courseNotification':
      case 'course_notification':
        if (data.subcourseId || data.subcourse_id || data.courseId || data.course_id) {
          const courseId = data.subcourseId || data.subcourse_id || data.courseId || data.course_id;
          console.log('🔗 [DeepLinking] Course detected, courseId:', courseId);
          return `${URL_SCHEME}://enroll/${courseId}`;
        }
        break;
        
      case 'request_internship_letter':
      case 'requestInternshipLetter':
      case 'upload_internship_letter':
      case 'uploadInternshipLetter':
      case 'internship_letter_uploaded':
      case 'internship_letter_payment':
      case 'internship_letter_payment_completed':
      case 'internship':
      case 'internshipNotification':
      case 'internship_notification':
        // For internship notifications, navigate to notification screen instead of internship screen
        console.log('🔗 [DeepLinking] Internship notification detected - navigating to notification screen');
        return `${URL_SCHEME}://notification`;
        
      case 'notification':
      case 'general':
      case 'generalNotification':
        if (data.notificationId || data.notification_id) {
          const notificationId = data.notificationId || data.notification_id;
          console.log('🔗 [DeepLinking] Notification detail detected, notificationId:', notificationId);
          return `${URL_SCHEME}://notification/${notificationId}`;
        }
        console.log('🔗 [DeepLinking] General notification detected');
        return `${URL_SCHEME}://notification`;
        
      default:
        // If notification has a URL, use it
        if (data.url || data.deepLink || data.deep_link) {
          const url = data.url || data.deepLink || data.deep_link;
          console.log('🔗 [DeepLinking] URL found in data:', url);
          return url.startsWith('http') ? url : `${URL_SCHEME}://${url}`;
        }
        // If lessonId exists but no type, assume it's a lesson
        if (data.lessonId || data.lesson_id) {
          const lessonId = data.lessonId || data.lesson_id;
          console.log('🔗 [DeepLinking] LessonId found without type, assuming lesson:', lessonId);
          return `${URL_SCHEME}://lesson/${lessonId}`;
        }
        // Default to notification screen
        console.log('⚠️ [DeepLinking] Unknown type, defaulting to notification screen');
        return `${URL_SCHEME}://notification`;
    }
    
    // Fallback to notification screen
    console.log('⚠️ [DeepLinking] Fallback to notification screen');
    return `${URL_SCHEME}://notification`;
  } catch (error) {
    console.error('❌ [DeepLinking] Error generating deep link:', error);
    return `${URL_SCHEME}://notification`;
  }
};

/**
 * Parse deep link URL and extract route params
 * @param {string} url - Deep link URL
 * @returns {Object} Parsed route data
 */
export const parseDeepLink = (url) => {
  try {
    if (!url || !url.includes(URL_SCHEME)) {
      return null;
    }

    // Remove scheme and split
    const path = url.replace(`${URL_SCHEME}://`, '');
    const parts = path.split('/').filter(p => p);
    
    if (parts.length === 0) {
      return { route: 'Home', params: {} };
    }

    const [route, ...params] = parts;

    // Map route to screen name and params
    switch (route) {
      case 'home':
        return { route: 'Home', params: {} };
        
      case 'notification':
        if (params[0]) {
          return { route: 'Notification', params: { notificationId: params[0] } };
        }
        return { route: 'Notification', params: {} };
        
      case 'lesson':
        if (params[0] === 'live' && params[1]) {
          return { route: 'LessonVideo', params: { lessonId: params[1], isLive: true } };
        } else if (params[0]) {
          return { route: 'LessonVideo', params: { lessonId: params[0] } };
        }
        break;
        
      case 'enroll':
        if (params[0]) {
          return { route: 'Enroll', params: { courseId: params[0] } };
        }
        break;
        
      case 'course':
        if (params[0]) {
          return { route: 'SubCourse', params: { courseId: params[0] } };
        }
        break;
        
      case 'internship':
        if (params[0] === 'letter') {
          return { route: 'Internship', params: { tab: 'letter' } };
        }
        return { route: 'Internship', params: {} };
        
      case 'profile':
        return { route: 'Profile', params: {} };
        
      default:
        return { route: 'Home', params: {} };
    }
    
    return { route: 'Home', params: {} };
  } catch (error) {
    console.error('❌ [DeepLinking] Error parsing deep link:', error);
    return { route: 'Home', params: {} };
  }
};

/**
 * Navigate using deep link
 * @param {Object} navigation - Navigation object
 * @param {string} url - Deep link URL
 */
export const navigateWithDeepLink = (navigation, url) => {
  try {
    console.log('🔗 [DeepLinking] Navigating with URL:', url);
    
    if (!navigation) {
      console.error('❌ [DeepLinking] Navigation object not provided');
      return;
    }

    if (!navigation.isReady()) {
      console.log('⏳ [DeepLinking] Navigation not ready, waiting...');
      setTimeout(() => {
        navigateWithDeepLink(navigation, url);
      }, 500);
      return;
    }

    const parsed = parseDeepLink(url);
    
    if (!parsed || !parsed.route) {
      console.log('⚠️ [DeepLinking] Invalid deep link, navigating to Home');
      navigation.navigate('Home');
      return;
    }

    console.log('🔗 [DeepLinking] Navigating to:', parsed.route, 'with params:', JSON.stringify(parsed.params, null, 2));
    
    // Navigate to the route
    if (parsed.params && Object.keys(parsed.params).length > 0) {
      navigation.navigate(parsed.route, parsed.params);
    } else {
      navigation.navigate(parsed.route);
    }
  } catch (error) {
    console.error('❌ [DeepLinking] Error navigating with deep link:', error);
    // Fallback navigation
    if (navigation) {
      try {
        navigation.navigate('Home');
      } catch (navError) {
        console.error('❌ [DeepLinking] Even fallback navigation failed:', navError);
      }
    }
  }
};

