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
      console.log('🔔 NotificationService: Initializing...');
      
      // Set up background message handler
      this.setupBackgroundHandler();
      
      // Set up foreground message handler
      this.setupForegroundHandler();
      
      // Set up token refresh handler
      this.setupTokenRefreshHandler();
      
      this.isInitialized = true;
      console.log('✅ NotificationService: Initialized successfully');
      
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
      console.log('✅ NotificationService: Background handler is registered in index.js');
    } catch (error) {
      console.error('❌ NotificationService: Background handler setup failed:', error);
    }
  }

  // Setup foreground message handler
  setupForegroundHandler() {
    try {
      const messagingInstance = getMessaging(getFirebaseApp());
      this.foregroundMessageHandler = messagingInstance.onMessage(async (remoteMessage) => {
        console.log('📨 NotificationService: Foreground message received:', remoteMessage);
        
        // Handle foreground notification
        await this.handleForegroundNotification(remoteMessage);
      });
      
      console.log('✅ NotificationService: Foreground handler set up');
    } catch (error) {
      console.error('❌ NotificationService: Foreground handler setup failed:', error);
    }
  }

  // Setup token refresh handler
  setupTokenRefreshHandler() {
    try {
      const messagingInstance = getMessaging(getFirebaseApp());
      messagingInstance.onTokenRefresh(async (token) => {
        console.log('🔄 NotificationService: Token refreshed:', token);
        
        // Store new token
        await AsyncStorage.setItem('fcm_token', token);
        
        // Send to backend if user is logged in (only if token actually changed)
        const userToken = await AsyncStorage.getItem('user_token');
        if (userToken) {
          // Check if this is a different token than what we last sent
          const lastSentToken = await AsyncStorage.getItem('last_sent_fcm_token');
          if (lastSentToken !== token) {
            console.log('🔄 NotificationService: New token detected, sending to backend');
            const success = await this.sendFCMTokenToBackend(token, userToken);
            if (success) {
              await AsyncStorage.setItem('last_sent_fcm_token', token);
            }
          } else {
            console.log('ℹ️ NotificationService: Token unchanged, skipping send');
          }
        }
      });
      
      console.log('✅ NotificationService: Token refresh handler set up');
    } catch (error) {
      console.error('❌ NotificationService: Token refresh handler setup failed:', error);
    }
  }

  // Handle background notification
  async handleBackgroundNotification(remoteMessage) {
    try {
      console.log('🔔 NotificationService: Processing background notification...');
      console.log('📨 NotificationService: Background message data:', JSON.stringify(remoteMessage, null, 2));
      
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
        console.log('🔔 NotificationService: Background notification will be shown by system');
        console.log('📱 NotificationService: Title:', notification.title);
        console.log('📱 NotificationService: Body:', notification.body);
      }
      
      console.log('✅ NotificationService: Background notification processed and stored');
    } catch (error) {
      console.error('❌ NotificationService: Background notification handling failed:', error);
    }
  }

  // Handle foreground notification
  async handleForegroundNotification(remoteMessage) {
    try {
      console.log('🔔 NotificationService: Processing foreground notification...');
      
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
      
      console.log('✅ NotificationService: Foreground notification processed');
    } catch (error) {
      console.error('❌ NotificationService: Foreground notification handling failed:', error);
    }
  }

  // Show in-app notification
  showInAppNotification(notification) {
    try {
      console.log('🔔 NotificationService: Showing in-app notification:', notification);
      
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
      console.log('🔔 NotificationService: Handling notification tap:', notification);
      
      // Navigate to notification screen
      this.navigateToNotificationScreen();
    } catch (error) {
      console.error('❌ NotificationService: Notification tap handling failed:', error);
    }
  }

  // Navigate to notification screen
  navigateToNotificationScreen() {
    try {
      console.log('🔔 NotificationService: Navigating to notification screen...');
      
      // Import navigation service or use global navigation
      // For now, we'll use a simple approach
      // You might need to adjust this based on your navigation setup
      if (global.navigationRef && global.navigationRef.current) {
        global.navigationRef.current.navigate('Notification');
        console.log('✅ NotificationService: Navigated to notification screen');
      } else {
        console.log('❌ NotificationService: Navigation not available');
      }
    } catch (error) {
      console.error('❌ NotificationService: Navigation failed:', error);
    }
  }

  // Handle live lesson notification
  handleLiveLessonNotification(data) {
    console.log('📺 NotificationService: Live lesson notification:', data);
    // Navigate to lesson or show live lesson screen
    // You can use navigation service here
  }

  // Handle buy course notification
  handleBuyCourseNotification(data) {
    console.log('💳 NotificationService: Buy course notification:', data);
    // Navigate to course enrollment screen
  }

  // Handle internship request notification
  handleInternshipRequestNotification(data) {
    console.log('📜 NotificationService: Internship request notification:', data);
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
      console.log('💾 NotificationService: Notification stored locally');
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
      console.log('🔔 NotificationService: Sending FCM token to backend...');
      
      // Check if this token was already sent recently
      const lastSentToken = await AsyncStorage.getItem('last_sent_fcm_token');
      if (lastSentToken === fcmToken) {
        console.log('ℹ️ NotificationService: Token already sent, skipping duplicate');
        return true;
      }
      
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
        console.log('✅ NotificationService: FCM token sent to backend successfully');
        // Store the sent token to prevent duplicates
        await AsyncStorage.setItem('last_sent_fcm_token', fcmToken);
        return true;
      } else {
        console.log('❌ NotificationService: Failed to send FCM token:', result.message);
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
      console.log('🔔 NotificationService: Removing FCM token from backend...');
      
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
        console.log('✅ NotificationService: FCM token removed from backend successfully');
        return true;
      } else {
        console.log('❌ NotificationService: Failed to remove FCM token:', result.message);
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
      console.log('🔔 NotificationService: Fetching notifications from backend...');
      
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
        console.log('✅ NotificationService: Notifications fetched successfully');
        return result.data;
      } else {
        console.log('❌ NotificationService: Failed to fetch notifications:', result.message);
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
      console.log('🔔 NotificationService: Marking all notifications as read...');
      
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
        console.log('✅ NotificationService: All notifications marked as read');
        return true;
      } else {
        console.log('❌ NotificationService: Failed to mark notifications as read:', result.message);
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
      console.log('🔔 NotificationService: Getting unread count...');
      
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
        console.log('✅ NotificationService: Unread count fetched:', result.data.count);
        return result.data.count;
      } else {
        console.log('❌ NotificationService: Failed to get unread count:', result.message);
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
      console.log('🔔 NotificationService: Initializing FCM token...');
      
      const fcmToken = await getStoredFCMToken();
      if (!fcmToken) {
        console.log('❌ NotificationService: No FCM token available');
        return false;
      }
      
      const success = await this.sendFCMTokenToBackend(fcmToken, userToken);
      if (success) {
        console.log('✅ NotificationService: FCM token initialized and sent to backend');
        return true;
      } else {
        console.log('❌ NotificationService: Failed to send FCM token to backend');
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
      console.log('🔔 NotificationService: Cleaning up...');
      
      // Remove FCM token from backend
      const userToken = await AsyncStorage.getItem('user_token');
      const fcmToken = await getStoredFCMToken();
      
      if (userToken && fcmToken) {
        await this.removeFCMTokenFromBackend(fcmToken, userToken);
      }
      
      // Clear local notifications
      await AsyncStorage.removeItem('stored_notifications');
      
      console.log('✅ NotificationService: Cleanup completed');
    } catch (error) {
      console.error('❌ NotificationService: Cleanup failed:', error);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
