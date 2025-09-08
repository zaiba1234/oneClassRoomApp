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
      
      // Set up event listeners for different notification types
      this.setupEventListeners();
      
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Initialization failed:', error);
      return false;
    }
  }

  // Setup event listeners for WebSocket events
  setupEventListeners() {
    try {
      
      // Live lesson notification
      websocketService.onLiveLesson((data) => {
        this.handleLiveLessonNotification(data);
      });
      
      // Lesson started notification (join now)
      websocketService.onLessonStarted((data) => {
        this.handleLessonStartedNotification(data);
      });
      
      // Buy course notification
      websocketService.onBuyCourse((data) => {
        this.handleBuyCourseNotification(data);
      });
      
      // Course unlocked notification
      websocketService.on('course_unlocked', (data) => {
        this.handleCourseUnlockedNotification(data);
      });
      
      // Request internship letter notification
      websocketService.onRequestInternshipLetter((data) => {
        this.handleInternshipRequestNotification(data);
      });
      
      // Upload internship letter notification
      websocketService.onUploadInternshipLetter((data) => {
        this.handleInternshipUploadNotification(data);
      });
      
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Failed to setup event listeners:', error);
    }
  }

  // Handle live lesson notification
  async handleLiveLessonNotification(data) {
    try {
      
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
      
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Live lesson notification failed:', error);
    }
  }

  // Handle lesson started notification (join now)
  async handleLessonStartedNotification(data) {
    try {
      
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
      
      
      // Show in-app notification
      this.showInAppNotification(notification);
      
      // Store notification locally
      await notificationService.storeNotification(notification);
      
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Lesson started notification failed:', error);
    }
  }

  // Handle buy course notification
  async handleBuyCourseNotification(data) {
    try {
      
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
      
      
      // Show in-app notification
      this.showInAppNotification(notification);
      
      // Store notification locally
      await notificationService.storeNotification(notification);
      
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Buy course notification failed:', error);
    }
  }

  // Handle course unlocked notification
  async handleCourseUnlockedNotification(data) {
    try {
      
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
      
      
      // Show in-app notification
      this.showInAppNotification(notification);
      
      // Store notification locally
      await notificationService.storeNotification(notification);
      
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Course unlocked notification failed:', error);
    }
  }

  // Handle internship request notification
  async handleInternshipRequestNotification(data) {
    try {
      
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
      
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Internship request notification failed:', error);
    }
  }

  // Handle internship upload notification
  async handleInternshipUploadNotification(data) {
    try {
      
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
      
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Internship upload notification failed:', error);
    }
  }

  // Show in-app notification
  showInAppNotification(notification) {
    try {
      
      // Show alert with action buttons
      Alert.alert(
        notification.title,
        notification.body,
        [
          {
            text: 'View',
            onPress: () => {
              this.handleNotificationTap(notification);
            }
          },
          {
            text: 'Dismiss',
            style: 'cancel',
            onPress: () => {
            }
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
      
      // Navigate to notification screen
      this.navigateToNotificationScreen();
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Notification tap handling failed:', error);
    }
  }

  // Navigate to notification screen
  navigateToNotificationScreen() {
    try {
      
      // Import navigation service or use global navigation
      // For now, we'll use a simple approach
      // You might need to adjust this based on your navigation setup
      if (global.navigationRef && global.navigationRef.current) {
        global.navigationRef.current.navigate('Notification');
      } else {
      }
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Navigation failed:', error);
    }
  }

  // Navigate to live lesson
  navigateToLiveLesson(data) {
    try {
      
      // You can use navigation service here
      // For now, we'll just log the action
      
      // You can implement navigation logic here
      // Example: navigationService.navigate('LessonVideo', { lessonId: data.lessonId });
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Live lesson navigation failed:', error);
    }
  }

  // Navigate to course
  navigateToCourse(data) {
    try {
      
      
      // You can implement navigation logic here
      // Example: navigationService.navigate('Enroll', { courseId: data.subcourseId });
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Course navigation failed:', error);
    }
  }

  // Navigate to internship letter
  navigateToInternshipLetter(data) {
    try {
      
      
      // You can implement navigation logic here
      // Example: navigationService.navigate('Internship', { internshipLetterId: data.internshipLetterId });
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Internship letter navigation failed:', error);
    }
  }

  // Cleanup
  cleanup() {
    try {
      
      // Remove all event listeners
      this.eventListeners.forEach((callback, event) => {
        websocketService.off(event, callback);
      });
      
      this.eventListeners.clear();
      this.isInitialized = false;
      
    } catch (error) {
      console.error('❌ WebSocketNotificationHandler: Cleanup failed:', error);
    }
  }
}

// Create singleton instance
const websocketNotificationHandler = new WebSocketNotificationHandler();

export default websocketNotificationHandler;