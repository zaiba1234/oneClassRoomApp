import { Platform, Alert, Linking } from 'react-native';
import messaging, { getMessaging } from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../API/config';
import { getStoredFCMToken, getFirebaseApp } from './firebaseConfig';

// Notification Service for handling all notification operations
class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.messageListeners = [];
    this.backgroundMessageHandler = null;
    this.foregroundMessageHandler = null;
  }

  // Initialize notification service
  async initialize() {
    try {
      
      // Set up background message handler
      this.setupBackgroundHandler();
      
      // Set up foreground message handler
      this.setupForegroundHandler();
      
      // Set up token refresh handler
      this.setupTokenRefreshHandler();
      
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      console.error('❌ NotificationService: Initialization failed:', error);
      return false;
    }
  }

  // Setup background message handler
  setupBackgroundHandler() {
    try {
      // Note: Background handler is now registered in index.js at top level
      // This is required for React Native Firebase to work properly
      console.log('📨 Background handler setup completed in index.js');
    } catch (error) {
      console.error('❌ NotificationService: Background handler setup failed:', error);
    }
  }

  // Setup foreground message handler
  setupForegroundHandler() {
    try {
      // Use the messaging instance directly
      this.foregroundMessageHandler = messaging().onMessage(async (remoteMessage) => {
        console.log('📱 Foreground message received:', remoteMessage);
        
        // Handle foreground notification
        await this.handleForegroundNotification(remoteMessage);
      });
      
      console.log('✅ Foreground message handler setup completed');
    } catch (error) {
      console.error('❌ NotificationService: Foreground handler setup failed:', error);
    }
  }

  // Setup token refresh handler
  setupTokenRefreshHandler() {
    try {
      // Use the messaging instance directly
      messaging().onTokenRefresh(async (token) => {
        console.log('🔄 FCM Token refreshed:', token);
        
        // Store new token
        await AsyncStorage.setItem('fcm_token', token);
        
        // Send to backend if user is logged in
        const userToken = await AsyncStorage.getItem('user_token');
        if (userToken) {
          await this.sendFCMTokenToBackend(token, userToken);
        }
      });
      
      console.log('✅ Token refresh handler setup completed');
    } catch (error) {
      console.error('❌ NotificationService: Token refresh handler setup failed:', error);
    }
  }

  // Handle background notification
  async handleBackgroundNotification(remoteMessage) {
    try {
      
      const { notification, data } = remoteMessage;
      
      // Store notification for later processing
      await this.storeNotification({
        title: notification?.title || 'New Notification',
        body: notification?.body || 'You have a new notification',
        data: data || {},
        timestamp: new Date().toISOString(),
        isRead: false,
        type: data?.type || 'general'
      });
      
      // For background notifications, the system automatically shows them
      // when the app is in background or closed
      if (notification) {
      }
      
    } catch (error) {
      console.error('❌ NotificationService: Background notification handling failed:', error);
    }
  }

  // Handle foreground notification
  async handleForegroundNotification(remoteMessage) {
    try {
      
      const { notification, data } = remoteMessage;
      
      // Show in-app notification
      this.showInAppNotification({
        title: notification?.title || 'New Notification',
        body: notification?.body || 'You have a new notification',
        data: data || {},
        type: data?.type || 'general'
      });
      
      // Store notification
      await this.storeNotification({
        title: notification?.title || 'New Notification',
        body: notification?.body || 'You have a new notification',
        data: data || {},
        timestamp: new Date().toISOString(),
        isRead: false,
        type: data?.type || 'general'
      });
      
    } catch (error) {
      console.error('❌ NotificationService: Foreground notification handling failed:', error);
    }
  }

  // Show in-app notification
  showInAppNotification(notification) {
    try {
      
      // Show alert for now (you can replace with custom notification component)
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
      console.error('❌ NotificationService: In-app notification failed:', error);
    }
  }

  // Handle notification tap
  handleNotificationTap(notification) {
    try {
      
      // Navigate to notification screen
      this.navigateToNotificationScreen();
    } catch (error) {
      console.error('❌ NotificationService: Notification tap handling failed:', error);
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
      console.error('❌ NotificationService: Navigation failed:', error);
    }
  }

  // Handle live lesson notification
  handleLiveLessonNotification(data) {
    // Navigate to lesson or show live lesson screen
    // You can use navigation service here
  }

  // Handle buy course notification
  handleBuyCourseNotification(data) {
    // Navigate to course enrollment screen
  }

  // Handle internship request notification
  handleInternshipRequestNotification(data) {
    // Navigate to internship letter screen
  }
z

  // Store notification locally
  async storeNotification(notification) {
    try {
      const storedNotifications = await this.getStoredNotifications();
      storedNotifications.unshift(notification);
      
      // Keep only last 100 notifications
      if (storedNotifications.length > 100) {
        storedNotifications.splice(100);
      }
      
      await AsyncStorage.setItem('stored_notifications', JSON.stringify(storedNotifications));
    } catch (error) {
      console.error('❌ NotificationService: Failed to store notification:', error);
    }
  }

  // Get stored notifications
  async getStoredNotifications() {
    try {
      const stored = await AsyncStorage.getItem('stored_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ NotificationService: Failed to get stored notifications:', error);
      return [];
    }
  }

  // Send FCM token to backend
  async sendFCMTokenToBackend(fcmToken, userToken) {
    try {
      
      const apiUrl = getApiUrl('/api/notification/save-fcm-token');
      const deviceId = await this.getDeviceId();
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fcmToken: fcmToken,
          deviceId: deviceId
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('❌ NotificationService: Error sending FCM token:', error);
      return false;
    }
  }

  // Remove FCM token from backend
  async removeFCMTokenFromBackend(fcmToken, userToken) {
    try {
      
      const apiUrl = getApiUrl('/api/notification/remove-fcm-token');
      const deviceId = await this.getDeviceId();
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fcmToken: fcmToken,
          deviceId: deviceId
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('❌ NotificationService: Error removing FCM token:', error);
      return false;
    }
  }

  // Get notifications from backend
  async getNotifications(userToken, page = 1, limit = 20) {
    try {
      
      const apiUrl = getApiUrl(`/api/notification/get-notifications?page=${page}&limit=${limit}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        return result.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ NotificationService: Error fetching notifications:', error);
      return null;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userToken) {
    try {
      
      const apiUrl = getApiUrl('/api/notification/read-all');
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('❌ NotificationService: Error marking notifications as read:', error);
      return false;
    }
  }

  // Get unread count
  async getUnreadCount(userToken) {
    try {
      
      const apiUrl = getApiUrl('/api/notification/unread-count');
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        return result.data.count;
      } else {
        return 0;
      }
    } catch (error) {
      console.error('❌ NotificationService: Error getting unread count:', error);
      return 0;
    }
  }

  // Get device ID
  async getDeviceId() {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        // Generate a simple device ID
        deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('❌ NotificationService: Error getting device ID:', error);
      return `${Platform.OS}_${Date.now()}`;
    }
  }

  // Initialize FCM token and send to backend
  async initializeFCMToken(userToken) {
    try {
      
      const fcmToken = await getStoredFCMToken();
      if (!fcmToken) {
        return false;
      }
      
      const success = await this.sendFCMTokenToBackend(fcmToken, userToken);
      if (success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('❌ NotificationService: Error initializing FCM token:', error);
      return false;
    }
  }

  // Cleanup on logout
  async cleanup() {
    try {
      
      // Remove FCM token from backend
      const userToken = await AsyncStorage.getItem('user_token');
      const fcmToken = await getStoredFCMToken();
      
      if (userToken && fcmToken) {
        await this.removeFCMTokenFromBackend(fcmToken, userToken);
      }
      
      // Clear local notifications
      await AsyncStorage.removeItem('stored_notifications');
      
    } catch (error) {
      console.error('❌ NotificationService: Cleanup failed:', error);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
