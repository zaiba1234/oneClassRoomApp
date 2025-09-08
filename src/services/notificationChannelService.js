import { Platform, PermissionsAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';

class NotificationChannelService {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize notification channels and permissions
  async initialize() {
    try {
      console.log('🔔 NotificationChannelService: Initializing...');
      
      if (Platform.OS === 'android') {
        // Request notification permission for Android 13+
        await this.requestNotificationPermission();
        
        // Create notification channels
        await this.createNotificationChannels();
      }
      
      this.isInitialized = true;
      console.log('✅ NotificationChannelService: Initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ NotificationChannelService: Initialization failed:', error);
      return false;
    }
  }

  // Request notification permission for Android 13+
  async requestNotificationPermission() {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs notification permission to send you important updates.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('✅ Notification permission granted');
          return true;
        } else {
          console.log('❌ Notification permission denied');
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  // Create notification channels for Android
  async createNotificationChannels() {
    try {
      if (Platform.OS === 'android') {
        // Import the native module
        const { NotificationChannelService } = require('react-native').NativeModules;
        
        if (NotificationChannelService) {
          // Create default channel
          await NotificationChannelService.createNotificationChannel({
            id: 'fcm_default_channel',
            name: 'Default Notifications',
            description: 'Default notification channel for LearningSaint app',
            importance: 'high',
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#FF6B35'
          });

          // Create course notifications channel
          await NotificationChannelService.createNotificationChannel({
            id: 'course_notifications',
            name: 'Course Notifications',
            description: 'Notifications about courses, lessons, and learning updates',
            importance: 'high',
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#FF6B35'
          });

          // Create live lesson channel
          await NotificationChannelService.createNotificationChannel({
            id: 'live_lessons',
            name: 'Live Lessons',
            description: 'Notifications for live lessons and classes',
            importance: 'high',
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#FF6B35'
          });

          // Create general notifications channel
          await NotificationChannelService.createNotificationChannel({
            id: 'general_notifications',
            name: 'General Notifications',
            description: 'General app notifications and updates',
            importance: 'default',
            sound: 'default',
            vibration: false,
            lights: false
          });

          console.log('✅ Notification channels created successfully');
        } else {
          console.log('⚠️ NotificationChannelService native module not available');
        }
      }
    } catch (error) {
      console.error('❌ Error creating notification channels:', error);
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log('📱 Notification settings:', {
        authorizationStatus: authStatus,
        enabled: enabled
      });

      return {
        enabled: enabled,
        authorizationStatus: authStatus
      };
    } catch (error) {
      console.error('❌ Error getting notification settings:', error);
      return {
        enabled: false,
        authorizationStatus: messaging.AuthorizationStatus.NOT_DETERMINED
      };
    }
  }

  // Check if notifications are enabled
  async areNotificationsEnabled() {
    try {
      const settings = await this.getNotificationSettings();
      return settings.enabled;
    } catch (error) {
      console.error('❌ Error checking notification status:', error);
      return false;
    }
  }

  // Show notification permission dialog
  async showPermissionDialog() {
    try {
      return new Promise((resolve) => {
        Alert.alert(
          'Enable Notifications',
          'To receive important updates about your courses and lessons, please enable notifications for this app.',
          [
            {
              text: 'Not Now',
              style: 'cancel',
              onPress: () => resolve(false)
            },
            {
              text: 'Enable',
              onPress: async () => {
                const granted = await this.requestNotificationPermission();
                resolve(granted);
              }
            }
          ]
        );
      });
    } catch (error) {
      console.error('❌ Error showing permission dialog:', error);
      return false;
    }
  }
}

// Create singleton instance
const notificationChannelService = new NotificationChannelService();

export default notificationChannelService;
