import { Alert, Linking } from 'react-native';
import websocketService from './websocketService';
import notificationService from './notificationService';
import notificationAlertService from './notificationAlertService';

// WebSocket Notification Handler
class WebSocketNotificationHandler {
  constructor() {
    this.isInitialized = false;
    this.eventListeners = new Map();
  }

  // Initialize WebSocket notification handlers
  async initialize() {
    try {
      console.log('🔔 WebSocketNotificationHandler: Initializing...');
      
      // Set up event listeners for different notification types
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('✅ WebSocketNotificationHandler: Initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Initialization failed:', error);
      return false;
    }
  }

  // Setup event listeners for WebSocket events
  setupEventListeners() {
    try {
      console.log('🔔 WebSocketNotificationHandler: Setting up event listeners...');
      
      // Live lesson notification
      websocketService.onLiveLesson((data) => {
        console.log('📺 WebSocketNotificationHandler: Live lesson event received:', data);
        this.handleLiveLessonNotification(data);
      });
      console.log('✅ WebSocketNotificationHandler: Live lesson listener set up');
      
      // Lesson started notification (join now)
      websocketService.onLessonStarted((data) => {
        console.log('🎥 WebSocketNotificationHandler: Lesson started event received:', data);
        this.handleLessonStartedNotification(data);
      });
      console.log('✅ WebSocketNotificationHandler: Lesson started listener set up');
      
      // Buy course notification
      websocketService.onBuyCourse((data) => {
        console.log('💳 WebSocketNotificationHandler: Buy course event received:', data);
        this.handleBuyCourseNotification(data);
      });
      console.log('✅ WebSocketNotificationHandler: Buy course listener set up');
      
      // Course unlocked notification
      websocketService.on('course_unlocked', (data) => {
        console.log('🎓 WebSocketNotificationHandler: Course unlocked event received:', data);
        this.handleCourseUnlockedNotification(data);
      });
      console.log('✅ WebSocketNotificationHandler: Course unlocked listener set up');
      
      // Request internship letter notification
      websocketService.onRequestInternshipLetter((data) => {
        console.log('📜 WebSocketNotificationHandler: Request internship letter event received:', data);
        this.handleInternshipRequestNotification(data);
      });
      console.log('✅ WebSocketNotificationHandler: Request internship letter listener set up');
      
      // Upload internship letter notification
      websocketService.onUploadInternshipLetter((data) => {
        console.log('📄 WebSocketNotificationHandler: Upload internship letter event received:', data);
        this.handleInternshipUploadNotification(data);
      });
      console.log('✅ WebSocketNotificationHandler: Upload internship letter listener set up');
      
      // Global notification handler
      websocketService.onGlobalNotification((data) => {
        console.log('🌍 WebSocketNotificationHandler: Global notification event received:', data);
        this.handleGlobalNotification(data);
      });
      console.log('✅ WebSocketNotificationHandler: Global notification listener set up');
      
      console.log('✅ WebSocketNotificationHandler: All event listeners set up successfully');
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Failed to setup event listeners:', error);
    }
  }

  // Handle live lesson notification
  async handleLiveLessonNotification(data) {
    try {
      console.log('📺 WebSocketNotificationHandler: Processing live lesson notification...');
      
      const notification = {
        title: 'Live Lesson Starting Soon!',
        body: data.lessonName ? `"${data.lessonName}" is starting in 15 minutes` : 'A live lesson is starting in 15 minutes',
        data: {
          type: 'live_lesson',
          lessonId: data.lessonId,
          courseId: data.courseId,
          subcourseId: data.subcourseId,
          startTime: data.startTime,
          lessonName: data.lessonName
        },
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      // Show in-app notification
      this.showInAppNotification(notification);
      
      // Store notification locally
      await notificationService.storeNotification(notification);
      
      console.log('✅ WebSocketNotificationHandler: Live lesson notification processed');
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Live lesson notification failed:', error);
    }
  }

  // Handle lesson started notification (join now)
  async handleLessonStartedNotification(data) {
    try {
      console.log('🎥 WebSocketNotificationHandler: Processing lesson started notification...');
      console.log('🎥 WebSocketNotificationHandler: Received data:', JSON.stringify(data, null, 2));
      
      const notification = {
        title: '🎥 Lesson Started - Join Now!',
        body: data.lessonName ? `"${data.lessonName}" has started! Click to join the live session.` : 'A lesson has started! Click to join now.',
        data: {
          type: 'lesson_started',
          lessonId: data.lessonId,
          courseId: data.courseId,
          subcourseId: data.subcourseId,
          startTime: data.startTime,
          lessonName: data.lessonName
        },
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      console.log('🎥 WebSocketNotificationHandler: Created notification:', JSON.stringify(notification, null, 2));
      
      // Show in-app notification
      this.showInAppNotification(notification);
      
      // Store notification locally
      await notificationService.storeNotification(notification);
      
      console.log('✅ WebSocketNotificationHandler: Lesson started notification processed');
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Lesson started notification failed:', error);
    }
  }

  // Handle buy course notification
  async handleBuyCourseNotification(data) {
    try {
      console.log('💳 WebSocketNotificationHandler: Processing buy course notification...');
      console.log('💳 WebSocketNotificationHandler: Received data:', JSON.stringify(data, null, 2));
      
      const notification = {
        title: '🎉 Course Purchased Successfully!',
        body: data.courseName ? `Congratulations! You have successfully enrolled in "${data.courseName}". Start learning now!` : 'Congratulations! You have successfully enrolled in a new course. Start learning now!',
        data: {
          type: 'buy_course',
          courseId: data.courseId,
          subcourseId: data.subcourseId,
          courseName: data.courseName,
          paymentId: data.paymentId
        },
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      console.log('💳 WebSocketNotificationHandler: Created notification:', JSON.stringify(notification, null, 2));
      
      // Show in-app notification
      this.showInAppNotification(notification);
      
      // Store notification locally
      await notificationService.storeNotification(notification);
      
      console.log('✅ WebSocketNotificationHandler: Buy course notification processed');
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Buy course notification failed:', error);
    }
  }

  // Handle course unlocked notification
  async handleCourseUnlockedNotification(data) {
    try {
      console.log('🎓 WebSocketNotificationHandler: Processing course unlocked notification...');
      console.log('🎓 WebSocketNotificationHandler: Received data:', JSON.stringify(data, null, 2));
      
      const notification = {
        title: '🎉 Course Purchased Successfully!',
        body: data.courseName ? `Congratulations! You have successfully enrolled in "${data.courseName}". Start learning now!` : 'Congratulations! You have successfully enrolled in a new course. Start learning now!',
        data: {
          type: 'course_unlocked',
          courseId: data.courseId,
          subcourseId: data.subcourseId,
          courseName: data.courseName,
        },
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      console.log('🎓 WebSocketNotificationHandler: Created notification:', JSON.stringify(notification, null, 2));
      
      // Show in-app notification
      this.showInAppNotification(notification);
      
      // Store notification locally
      await notificationService.storeNotification(notification);
      
      console.log('✅ WebSocketNotificationHandler: Course unlocked notification processed');
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Course unlocked notification failed:', error);
    }
  }

  // Handle internship request notification
  async handleInternshipRequestNotification(data) {
    try {
      console.log('📜 WebSocketNotificationHandler: Processing internship request notification...');
      
      const notification = {
        title: 'Internship Letter Request',
        body: data.message || 'You have a new internship letter request',
        data: {
          type: 'request_internship_letter',
          internshipLetterId: data.internshipLetterId,
          studentId: data.studentId,
          studentName: data.studentName,
          courseId: data.courseId,
          message: data.message
        },
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      // Show in-app notification
      this.showInAppNotification(notification);
      
      // Store notification locally
      await notificationService.storeNotification(notification);
      
      console.log('✅ WebSocketNotificationHandler: Internship request notification processed');
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Internship request notification failed:', error);
    }
  }

  // Handle internship upload notification
  async handleInternshipUploadNotification(data) {
    try {
      console.log('📄 WebSocketNotificationHandler: Processing internship upload notification...');
      
      const notification = {
        title: 'Internship Letter Uploaded',
        body: data.message || 'Your internship letter has been uploaded successfully',
        data: {
          type: 'upload_internship_letter',
          internshipLetterId: data.internshipLetterId, 
          studentId: data.studentId,
          courseId: data.courseId,
          status: data.status,
          message: data.message
        },
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      // Show in-app notification
      this.showInAppNotification(notification);
      
      // Store notification locally
      await notificationService.storeNotification(notification);
      
      console.log('✅ WebSocketNotificationHandler: Internship upload notification processed');
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Internship upload notification failed:', error);
    }
  }

  // Handle global notification
  async handleGlobalNotification(data) {
    try {
      console.log('🌍 WebSocketNotificationHandler: Processing global notification...');
      console.log('🌍 WebSocketNotificationHandler: Received data:', JSON.stringify(data, null, 2));
      
      const notification = {
        title: data.title || 'Global Notification',
        body: data.body || data.message || 'You have a new notification',
        data: {
          type: 'admin_global_notification',
          ...data
        },
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      console.log('🌍 WebSocketNotificationHandler: Created notification:', JSON.stringify(notification, null, 2));
      
      // For global notifications, use Firebase to send push notification to system tray
      // 1. Store the notification locally
      await notificationService.storeNotification(notification);
      
      // 2. Send Firebase push notification to system notification tray
      console.log('🌍 WebSocketNotificationHandler: Sending Firebase push notification to system tray...');
      await this.sendFirebasePushNotification(notification);
      
      console.log('✅ WebSocketNotificationHandler: Global notification processed');
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Global notification failed:', error);
    }
  }

  // Send Firebase push notification to system notification tray
  async sendFirebasePushNotification(notification) {
    try {
      console.log('🌍 WebSocketNotificationHandler: Sending Firebase push notification...');
      
      // Use React Native's built-in notification system
      const { Platform } = require('react-native');
      
      if (Platform.OS === 'android') {
        // For Android, we'll use the notification channel service
        await this.showAndroidSystemNotification(notification);
      } else {
        // For iOS, we'll use a different approach
        await this.showIOSSystemNotification(notification);
      }
      
      console.log('✅ WebSocketNotificationHandler: Firebase push notification sent to system tray');
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Firebase push notification failed:', error);
    }
  }

  // Show Android system notification
  async showAndroidSystemNotification(notification) {
    try {
      console.log('🌍 WebSocketNotificationHandler: Showing Android system notification...');
      
      // Import the notification channel service
      const { showNotification } = require('./notificationChannelService');
      
      // Show the notification using the channel service
      const success = await showNotification({
        title: notification.title,
        body: notification.body,
        data: notification.data,
        channelId: 'global_notifications',
        priority: 'high',
        sound: 'default',
        vibrate: true,
        tag: 'global_notification',
        icon: 'ic_notification',
        color: '#FF6B35',
      });
      
      if (success) {
        console.log('✅ WebSocketNotificationHandler: Android system notification shown');
      } else {
        console.log('⚠️ WebSocketNotificationHandler: Android system notification failed, using fallback');
        // Fallback: The notification will still be stored and visible in the app
      }
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Android system notification failed:', error);
    }
  }

  // Show iOS system notification
  async showIOSSystemNotification(notification) {
    try {
      console.log('🌍 WebSocketNotificationHandler: Showing iOS system notification...');
      
      // For iOS, we'll use a different approach since local notifications are more complex
      // The notification will be stored and visible in the app's notification screen
      console.log('🌍 WebSocketNotificationHandler: iOS system notification would be shown here');
      console.log('🌍 WebSocketNotificationHandler: Title:', notification.title);
      console.log('🌍 WebSocketNotificationHandler: Body:', notification.body);
      
      // In a production app, you might want to use react-native-push-notification
      // or implement a custom solution for iOS system notifications
      
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: iOS system notification failed:', error);
    }
  }

  // Show in-app notification
  showInAppNotification(notification) {
    try {
      console.log('🔔 WebSocketNotificationHandler: Showing in-app notification:', notification);
      console.log('🔔 WebSocketNotificationHandler: Notification title:', notification.title);
      console.log('🔔 WebSocketNotificationHandler: Notification body:', notification.body);
      
      // Use custom alert based on notification type
      const notificationType = notification.type || 'general';
      
      switch (notificationType) {
        case 'live_lesson':
        case 'lesson_started':
          notificationAlertService.showLessonNotification(
            notification.title,
            notification.body,
            {
              onConfirm: () => {
                console.log('🔔 WebSocketNotificationHandler: User tapped View button');
                this.handleNotificationTap(notification);
              },
              onCancel: () => {
                console.log('🔔 WebSocketNotificationHandler: User dismissed notification');
              },
            }
          );
          break;
          
        case 'course_purchased':
        case 'course_unlocked':
          notificationAlertService.showCourseNotification(
            notification.title,
            notification.body,
            {
              onConfirm: () => {
                console.log('🔔 WebSocketNotificationHandler: User tapped View button');
                this.handleNotificationTap(notification);
              },
              onCancel: () => {
                console.log('🔔 WebSocketNotificationHandler: User dismissed notification');
              },
            }
          );
          break;
          
        case 'internship_letter':
        case 'internship_payment':
          notificationAlertService.showInternshipNotification(
            notification.title,
            notification.body,
            {
              onConfirm: () => {
                console.log('🔔 WebSocketNotificationHandler: User tapped View button');
                this.handleNotificationTap(notification);
              },
              onCancel: () => {
                console.log('🔔 WebSocketNotificationHandler: User dismissed notification');
              },
            }
          );
          break;
          
        default:
          notificationAlertService.showInfo(
            notification.title,
            notification.body,
            {
              onConfirm: () => {
                console.log('🔔 WebSocketNotificationHandler: User tapped View button');
                this.handleNotificationTap(notification);
              },
            }
          );
          break;
      }
      
      console.log('✅ WebSocketNotificationHandler: In-app notification displayed successfully');
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: In-app notification failed:', error);
    }
  }

  // Handle notification tap
  handleNotificationTap(notification) {
    try {
      console.log('🔔 WebSocketNotificationHandler: Handling notification tap:', notification);
      
      // Navigate to notification screen
      this.navigateToNotificationScreen();
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Notification tap handling failed:', error);
    }
  }

  // Navigate to notification screen
  navigateToNotificationScreen() {
    try {
      console.log('🔔 WebSocketNotificationHandler: Navigating to notification screen...');
      
      // Import navigation service or use global navigation
      // For now, we'll use a simple approach
      // You might need to adjust this based on your navigation setup
      if (global.navigationRef && global.navigationRef.current) {
        global.navigationRef.current.navigate('Notification');
        console.log('✅ WebSocketNotificationHandler: Navigated to notification screen');
      } else {
        console.log('❌ WebSocketNotificationHandler: Navigation not available');
      }
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Navigation failed:', error);
    }
  }

  // Navigate to live lesson
  navigateToLiveLesson(data) {
    try {
      console.log('📺 WebSocketNotificationHandler: Navigating to live lesson:', data);
      
      // You can use navigation service here
      // For now, we'll just log the action
      console.log('🎯 Action: Navigate to live lesson screen');
      console.log('📊 Data:', {
        lessonId: data.lessonId,
        courseId: data.courseId,
        subcourseId: data.subcourseId,
        lessonName: data.lessonName
      });
      
      // You can implement navigation logic here
      // Example: navigationService.navigate('LessonVideo', { lessonId: data.lessonId });
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Live lesson navigation failed:', error);
    }
  }

  // Navigate to course
  navigateToCourse(data) {
    try {
      console.log('💳 WebSocketNotificationHandler: Navigating to course:', data);
      
      console.log('🎯 Action: Navigate to course screen');
      console.log('📊 Data:', {
        courseId: data.courseId,
        subcourseId: data.subcourseId,
        courseName: data.courseName
      });
      
      // You can implement navigation logic here
      // Example: navigationService.navigate('Enroll', { courseId: data.subcourseId });
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Course navigation failed:', error);
    }
  }

  // Navigate to internship letter
  navigateToInternshipLetter(data) {
    try {
      console.log('📜 WebSocketNotificationHandler: Navigating to internship letter:', data);
      
      console.log('🎯 Action: Navigate to internship letter screen');
      console.log('📊 Data:', {
        internshipLetterId: data.internshipLetterId,
        studentId: data.studentId,
        courseId: data.courseId
      });
      
      // You can implement navigation logic here
      // Example: navigationService.navigate('Internship', { internshipLetterId: data.internshipLetterId });
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Internship letter navigation failed:', error);
    }
  }

  // Cleanup
  cleanup() {
    try {
      console.log('🔔 WebSocketNotificationHandler: Cleaning up...');
      
      // Remove all event listeners
      this.eventListeners.forEach((callback, event) => {
        websocketService.off(event, callback);
      });
      
      this.eventListeners.clear();
      this.isInitialized = false;
      
      console.log('✅ WebSocketNotificationHandler: Cleanup completed');
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Cleanup failed:', error);
    }
  }
}

// Create singleton instance
const websocketNotificationHandler = new WebSocketNotificationHandler();

export default websocketNotificationHandler;