import { Alert, Linking } from 'react-native';
import websocketService from './websocketService';
import notificationService from './notificationService';

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
      websocketService.on('live_lesson', (data) => {
        console.log('📺 WebSocketNotificationHandler: Live lesson event received:', data);
        this.handleLiveLessonNotification(data);
      });
      
      // Buy course notification
      websocketService.on('buy_course', (data) => {
        console.log('💳 WebSocketNotificationHandler: Buy course event received:', data);
        this.handleBuyCourseNotification(data);
      });
      
      // Request internship letter notification
      websocketService.on('request_internship_letter', (data) => {
        console.log('📜 WebSocketNotificationHandler: Request internship letter event received:', data);
        this.handleInternshipRequestNotification(data);
      });
      
      // Upload internship letter notification
      websocketService.on('upload_internship_letter', (data) => {
        console.log('📄 WebSocketNotificationHandler: Upload internship letter event received:', data);
        this.handleInternshipUploadNotification(data);
      });
      
      console.log('✅ WebSocketNotificationHandler: Event listeners set up successfully');
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

  // Handle buy course notification
  async handleBuyCourseNotification(data) {
    try {
      console.log('💳 WebSocketNotificationHandler: Processing buy course notification...');
      
      const notification = {
        title: 'Course Purchase Successful!',
        body: data.courseName ? `You have successfully enrolled in "${data.courseName}"` : 'You have successfully enrolled in a new course',
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
      
      // Show in-app notification
      this.showInAppNotification(notification);
      
      // Store notification locally
      await notificationService.storeNotification(notification);
      
      console.log('✅ WebSocketNotificationHandler: Buy course notification processed');
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Buy course notification failed:', error);
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

  // Show in-app notification
  showInAppNotification(notification) {
    try {
      console.log('🔔 WebSocketNotificationHandler: Showing in-app notification:', notification);
      
      // Show alert with action buttons
      Alert.alert(
        notification.title,
        notification.body,
        [
          {
            text: 'View',
            onPress: () => this.handleNotificationTap(notification)
          },
          {
            text: 'Dismiss',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: In-app notification failed:', error);
    }
  }

  // Handle notification tap
  handleNotificationTap(notification) {
    try {
      console.log('🔔 WebSocketNotificationHandler: Handling notification tap:', notification);
      
      const { data } = notification;
      
      // Handle different notification types
      switch (data?.type) {
        case 'live_lesson':
          this.navigateToLiveLesson(data);
          break;
        case 'buy_course':
          this.navigateToCourse(data);
          break;
        case 'request_internship_letter':
          this.navigateToInternshipLetter(data);
          break;
        case 'upload_internship_letter':
          this.navigateToInternshipLetter(data);
          break;
        default:
          console.log('🔔 WebSocketNotificationHandler: Unknown notification type:', data?.type);
      }
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Notification tap handling failed:', error);
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
