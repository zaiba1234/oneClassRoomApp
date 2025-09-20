import { Platform, Alert, Linking, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../API/config';
import websocketService from './websocketService';
import notificationService from './notificationService';
import notificationAlertService from './notificationAlertService';

class GlobalNotificationService {
  constructor() {
    this.isInitialized = false;
    this.globalNotificationListeners = [];
    this.notificationChannelId = 'global_notifications';
    this.notificationChannelName = 'Global Notifications';
    this.notificationChannelDescription = 'System-wide announcements and updates';
  }

  // Initialize global notification service
  async initialize() {
    try {
      console.log('🌍 GlobalNotificationService: Initializing...');
      
      // Setup push notification channels
      this.setupNotificationChannels();
      
      // Setup websocket listener for global notifications
      this.setupWebSocketListener();
      
      // Setup notification handlers
      this.setupNotificationHandlers();
      
      this.isInitialized = true;
      console.log('✅ GlobalNotificationService: Initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ GlobalNotificationService: Initialization failed:', error);
      return false;
    }
  }

  // Setup notification channels for Android
  setupNotificationChannels() {
    try {
      console.log('📱 GlobalNotificationService: Setting up notification channels...');
      // For now, we'll use the existing notification service
      // This can be enhanced later with proper channel setup
      console.log('✅ GlobalNotificationService: Notification channels setup completed');
    } catch (error) {
      console.error('❌ GlobalNotificationService: Channel setup failed:', error);
    }
  }

  // Setup websocket listener for global notifications
  setupWebSocketListener() {
    try {
      // Check if WebSocket is connected first
      const connectionStatus = websocketService.getConnectionStatus();
      console.log('🔌 GlobalNotificationService: WebSocket status:', connectionStatus);
      
      if (!connectionStatus.isConnected) {
        console.log('⚠️ GlobalNotificationService: WebSocket not connected, will setup listener when connected');
        // Setup listener anyway - it will work when WebSocket connects
      }
      
      websocketService.onGlobalNotification((data) => {
        console.log('🌍 GlobalNotificationService: Global notification received via WebSocket:', data);
        this.handleGlobalNotification(data);
      });
      
      console.log('✅ GlobalNotificationService: WebSocket listener setup completed');
    } catch (error) {
      console.error('❌ GlobalNotificationService: WebSocket listener setup failed:', error);
    }
  }

  // Setup notification handlers
  setupNotificationHandlers() {
    try {
      console.log('📱 GlobalNotificationService: Setting up notification handlers...');
      // For now, we'll use the existing notification service
      // This can be enhanced later with proper push notification setup
      console.log('✅ GlobalNotificationService: Notification handlers setup completed');
    } catch (error) {
      console.error('❌ GlobalNotificationService: Notification handlers setup failed:', error);
    }
  }

  // Handle global notification from websocket
  async handleGlobalNotification(data) {
    try {
      console.log('🌍 GlobalNotificationService: Processing global notification:', data);
      console.log('🌍 GlobalNotificationService: Data type:', typeof data);
      console.log('🌍 GlobalNotificationService: Data keys:', Object.keys(data || {}));
      
      const notificationData = {
        id: data.id || Date.now().toString(),
        title: data.title || 'System Announcement',
        body: data.body || 'You have a new system notification',
        data: data.data || {},
        timestamp: new Date().toISOString(),
        type: 'global',
        isRead: false,
        priority: data.priority || 'normal',
        category: data.category || 'announcement'
      };

      console.log('🌍 GlobalNotificationService: Processed notification data:', notificationData);

      // Store notification locally
      await this.storeGlobalNotification(notificationData);
      console.log('💾 GlobalNotificationService: Notification stored locally');

      // Show notification based on app state
      const appState = await this.getAppState();
      console.log('📱 GlobalNotificationService: App state for notification:', appState);
      
      if (appState === 'background' || appState === 'inactive') {
        console.log('📱 GlobalNotificationService: Showing push notification (background/inactive)');
        // Show push notification for background/inactive
        this.showPushNotification(notificationData);
      } else {
        console.log('📱 GlobalNotificationService: Showing in-app notification (foreground)');
        // Show in-app notification for foreground
        this.showInAppNotification(notificationData);
      }

      // Notify listeners
      this.notifyListeners(notificationData);
      console.log('🔔 GlobalNotificationService: Notification processing completed');

    } catch (error) {
      console.error('❌ GlobalNotificationService: Error handling global notification:', error);
      console.error('❌ GlobalNotificationService: Error stack:', error.stack);
    }
  }

  // Show push notification (for background/inactive app)
  showPushNotification(notificationData) {
    try {
      console.log('📱 GlobalNotificationService: Showing push notification:', notificationData.title);
      
      // Use custom alert for background notifications
      notificationAlertService.showGlobalNotification(
        notificationData.title,
        notificationData.body,
        {
          onConfirm: () => {
            console.log('📱 GlobalNotificationService: User acknowledged notification');
            this.handleNotificationTap(notificationData);
          },
          onCancel: () => {
            console.log('📱 GlobalNotificationService: User dismissed notification');
          },
        }
      );
      
      console.log('✅ GlobalNotificationService: Push notification sent successfully');
    } catch (error) {
      console.error('❌ GlobalNotificationService: Error showing push notification:', error);
      console.error('❌ GlobalNotificationService: Error details:', error.message);
    }
  }

  // Show in-app notification (for foreground app)
  showInAppNotification(notificationData) {
    try {
      console.log('📱 GlobalNotificationService: Showing in-app notification:', notificationData.title);
      
      // Use custom alert for in-app notifications
      notificationAlertService.showGlobalNotification(
        notificationData.title,
        notificationData.body,
        {
          onConfirm: () => {
            console.log('📱 GlobalNotificationService: User viewed notification details');
            this.handleNotificationTap(notificationData);
          },
          onCancel: () => {
            console.log('📱 GlobalNotificationService: User dismissed notification');
          },
        }
      );
    } catch (error) {
      console.error('❌ GlobalNotificationService: Error showing in-app notification:', error);
    }
  }

  // Handle notification tap
  handleNotificationTap(notificationData) {
    try {
      console.log('🌍 GlobalNotificationService: Notification tapped:', notificationData);
      
      // Mark as read
      this.markNotificationAsRead(notificationData.id);
      
      // Navigate based on notification data
      if (notificationData.data?.action) {
        this.handleNotificationAction(notificationData);
      } else {
        // Default navigation to notification screen
        this.navigateToNotificationScreen(notificationData);
      }
    } catch (error) {
      console.error('❌ GlobalNotificationService: Error handling notification tap:', error);
    }
  }

  // Handle notification action
  handleNotificationAction(notificationData) {
    try {
      console.log('🌍 GlobalNotificationService: Handling notification action:', notificationData);
      
      const { action, data } = notificationData;
      
      switch (action) {
        case 'open_course':
          this.navigateToCourse(data.courseId);
          break;
        case 'open_lesson':
          this.navigateToLesson(data.lessonId);
          break;
        case 'open_profile':
          this.navigateToProfile();
          break;
        case 'open_settings':
          this.navigateToSettings();
          break;
        case 'open_url':
          this.openUrl(data.url);
          break;
        default:
          this.navigateToNotificationScreen(notificationData);
      }
    } catch (error) {
      console.error('❌ GlobalNotificationService: Error handling notification action:', error);
    }
  }

  // Handle notification opened
  handleNotificationOpened(notification) {
    try {
      console.log('🌍 GlobalNotificationService: Notification opened:', notification);
      
      if (notification.userInfo?.type === 'global') {
        const notificationData = {
          id: notification.userInfo.notificationId,
          title: notification.title,
          body: notification.message,
          data: notification.userInfo,
          timestamp: new Date().toISOString(),
          type: 'global'
        };
        
        this.handleNotificationTap(notificationData);
      }
    } catch (error) {
      console.error('❌ GlobalNotificationService: Error handling notification opened:', error);
    }
  }

  // Navigation methods
  navigateToNotificationScreen(notificationData) {
    try {
      if (global.navigationRef && global.navigationRef.current) {
        global.navigationRef.current.navigate('Notification', { 
          notification: notificationData 
        });
      } else {
        console.warn('⚠️ GlobalNotificationService: Navigation ref not available');
      }
    } catch (error) {
      console.error('❌ GlobalNotificationService: Navigation error:', error);
    }
  }

  navigateToCourse(courseId) {
    try {
      if (global.navigationRef && global.navigationRef.current) {
        global.navigationRef.current.navigate('Enroll', { courseId });
      }
    } catch (error) {
      console.error('❌ GlobalNotificationService: Course navigation error:', error);
    }
  }

  navigateToLesson(lessonId) {
    try {
      if (global.navigationRef && global.navigationRef.current) {
        global.navigationRef.current.navigate('LessonVideo', { lessonId });
      }
    } catch (error) {
      console.error('❌ GlobalNotificationService: Lesson navigation error:', error);
    }
  }

  navigateToProfile() {
    try {
      if (global.navigationRef && global.navigationRef.current) {
        global.navigationRef.current.navigate('Profile');
      }
    } catch (error) {
      console.error('❌ GlobalNotificationService: Profile navigation error:', error);
    }
  }

  navigateToSettings() {
    try {
      if (global.navigationRef && global.navigationRef.current) {
        global.navigationRef.current.navigate('Setting');
      }
    } catch (error) {
      console.error('❌ GlobalNotificationService: Settings navigation error:', error);
    }
  }

  openUrl(url) {
    try {
      Linking.openURL(url);
    } catch (error) {
      console.error('❌ GlobalNotificationService: URL opening error:', error);
    }
  }

  // Store global notification locally
  async storeGlobalNotification(notificationData) {
    try {
      const storedNotifications = await this.getStoredGlobalNotifications();
      storedNotifications.unshift(notificationData);
      
      // Keep only last 50 global notifications
      if (storedNotifications.length > 50) {
        storedNotifications.splice(50);
      }
      
      await AsyncStorage.setItem('global_notifications', JSON.stringify(storedNotifications));
      console.log('💾 GlobalNotificationService: Notification stored locally');
    } catch (error) {
      console.error('❌ GlobalNotificationService: Error storing notification:', error);
    }
  }

  // Get stored global notifications
  async getStoredGlobalNotifications() {
    try {
      const stored = await AsyncStorage.getItem('global_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ GlobalNotificationService: Error getting stored notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const notifications = await this.getStoredGlobalNotifications();
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
        await AsyncStorage.setItem('global_notifications', JSON.stringify(notifications));
        console.log('✅ GlobalNotificationService: Notification marked as read');
      }
    } catch (error) {
      console.error('❌ GlobalNotificationService: Error marking notification as read:', error);
    }
  }

  // Get app state
  async getAppState() {
    try {
      const currentState = AppState.currentState;
      console.log('📱 GlobalNotificationService: Current app state:', currentState);
      return currentState;
    } catch (error) {
      console.error('❌ GlobalNotificationService: Error getting app state:', error);
      return 'active';
    }
  }

  // Add listener for global notifications
  addListener(callback) {
    this.globalNotificationListeners.push(callback);
  }

  // Remove listener
  removeListener(callback) {
    const index = this.globalNotificationListeners.indexOf(callback);
    if (index > -1) {
      this.globalNotificationListeners.splice(index, 1);
    }
  }

  // Notify all listeners
  notifyListeners(notificationData) {
    this.globalNotificationListeners.forEach(callback => {
      try {
        callback(notificationData);
      } catch (error) {
        console.error('❌ GlobalNotificationService: Error in listener callback:', error);
      }
    });
  }

  // Send global notification to backend (for testing)
  async sendGlobalNotification(userToken, notificationData) {
    try {
      console.log('📤 GlobalNotificationService: Sending global notification to backend');
      
      const apiUrl = getApiUrl('/api/notification/send-global-notification');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ GlobalNotificationService: Global notification sent successfully');
        return true;
      } else {
        console.error('❌ GlobalNotificationService: Failed to send global notification:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ GlobalNotificationService: Error sending global notification:', error);
      return false;
    }
  }

  // Test global notification
  async testGlobalNotification(userToken) {
    try {
      const testNotification = {
        title: "Test Global Notification",
        body: "This is a test notification from the app",
        data: {
          customData: {
            feature: "Global Notification Test",
            version: "1.0.0"
          }
        }
      };
      
      return await this.sendGlobalNotification(userToken, testNotification);
    } catch (error) {
      console.error('❌ GlobalNotificationService: Error testing global notification:', error);
      return false;
    }
  }

  // Simulate global notification locally (for testing)
  simulateGlobalNotification() {
    try {
      console.log('🧪 GlobalNotificationService: Simulating global notification...');
      
      const testData = {
        id: 'test_' + Date.now(),
        title: 'Simulated Global Notification',
        body: 'This is a simulated notification for testing',
        data: {
          customData: {
            feature: 'Simulation Test',
            version: '1.0.0'
          }
        },
        priority: 'normal',
        category: 'test'
      };
      
      this.handleGlobalNotification(testData);
      console.log('✅ GlobalNotificationService: Simulated notification sent');
      return true;
    } catch (error) {
      console.error('❌ GlobalNotificationService: Error simulating notification:', error);
      return false;
    }
  }

  // Cleanup
  cleanup() {
    try {
      this.globalNotificationListeners = [];
      console.log('🧹 GlobalNotificationService: Cleanup completed');
    } catch (error) {
      console.error('❌ GlobalNotificationService: Cleanup error:', error);
    }
  }
}

// Create singleton instance
const globalNotificationService = new GlobalNotificationService();

export default globalNotificationService;
