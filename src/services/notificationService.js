import { Platform, Alert, Linking } from 'react-native';
import messaging, { getMessaging } from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../API/config';
import { getStoredFCMToken, getFirebaseApp } from './firebaseConfig';
import notificationAlertService from './notificationAlertService';

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
      console.log('📨 NotificationService: Handling background notification...');
      console.log('📨 NotificationService: Remote message:', JSON.stringify(remoteMessage, null, 2));
      
      const { notification, data } = remoteMessage;
      
      // Store notification for later processing - include full data structure for deep linking
      const storedNotification = {
        title: notification?.title || 'New Notification',
        body: notification?.body || 'You have a new notification',
        data: data || {},
        timestamp: new Date().toISOString(),
        isRead: false,
        type: data?.type || 'general',
        // Store notificationId for future reference
        id: remoteMessage.messageId || remoteMessage.messageId || Date.now().toString(),
        // Store full remoteMessage for deep linking
        remoteMessage: remoteMessage
      };
      
      // If this is a lesson_live notification, ensure lessonId is stored
      // Note: FCM payload might not have lessonId, but we'll try to get it from API when tapped
      if (data?.type === 'lesson_live' && data?.lessonId) {
        storedNotification.data.lessonId = data.lessonId;
      }
      
      await this.storeNotification(storedNotification);
      
      // Firebase handles system tray display automatically for background notifications
      console.log('📨 NotificationService: Background notification stored and will be visible in system tray');
      
    } catch (error) {
      console.error('❌ NotificationService: Background notification handling failed:', error);
    }
  }

  // Handle foreground notification
  async handleForegroundNotification(remoteMessage) {
    try {
      console.log('📱 NotificationService: Handling Firebase foreground notification...');
      console.log('📱 NotificationService: Data type:', remoteMessage.data?.type);
      console.log('📱 NotificationService: Title:', remoteMessage.notification?.title);
      console.log('📱 NotificationService: Body:', remoteMessage.notification?.body);
      
      const { notification, data } = remoteMessage;
      
      // Store notification first - include full data structure for deep linking
      const storedNotification = {
        title: notification?.title || 'New Notification',
        body: notification?.body || 'You have a new notification',
        data: data || {},
        timestamp: new Date().toISOString(),
        isRead: false,
        type: data?.type || 'general',
        // Store notificationId for future reference
        id: remoteMessage.messageId || remoteMessage.messageId || Date.now().toString(),
        // Store full remoteMessage for deep linking
        remoteMessage: remoteMessage
      };
      
      // If this is a lesson_live notification, ensure lessonId is stored
      if (data?.type === 'lesson_live' && data?.lessonId) {
        storedNotification.data.lessonId = data.lessonId;
      }
      
      await this.storeNotification(storedNotification);
      
      // For all notifications in foreground, show in-app notification
      // Note: Firebase doesn't have a direct method to show system notifications in foreground
      // Global notifications will be visible in the app's notification screen
      console.log('📱 NotificationService: Showing in-app notification for foreground notification...');
      this.showInAppNotification({
        title: notification?.title || 'New Notification',
        body: notification?.body || 'You have a new notification',
        data: data || {},
        type: data?.type || 'general',
        // CRITICAL: Pass full remoteMessage for deep linking to work
        remoteMessage: remoteMessage
      });
      
      // Log special handling for global notifications
      if (data?.type === 'admin_global_notification') {
        console.log('🌍 NotificationService: Global notification - will be visible in app notification screen');
      }
      
    } catch (error) {
      console.error('❌ NotificationService: Foreground notification handling failed:', error);
    }
  }

  // Show in-app notification
  showInAppNotification(notification) {
    try {
      console.log('📱 NotificationService: Showing in-app notification...');
      console.log('📱 NotificationService: Title:', notification.title);
      console.log('📱 NotificationService: Body:', notification.body);
      console.log('📱 NotificationService: Type:', notification.type);
      
      const { title, body, data, type } = notification;
      
      // Use custom alert based on notification type
      switch (type) {
        case 'admin_global_notification':
          notificationAlertService.showGlobalNotification(
            title || 'Global Notification',
            body || 'You have a new notification',
            {
              onConfirm: () => {
                console.log('📱 NotificationService: User viewed global notification');
                this.handleNotificationTap(notification);
              },
              onCancel: () => {
                console.log('📱 NotificationService: User dismissed global notification');
              },
            }
          );
          break;
          
        case 'course_notification':
        case 'course_update':
          notificationAlertService.showCourseNotification(
            title || 'Course Update',
            body || 'You have a new course notification',
            {
              onConfirm: () => {
                console.log('📱 NotificationService: User viewed course notification');
                this.handleNotificationTap(notification);
              },
              onCancel: () => {
                console.log('📱 NotificationService: User dismissed course notification');
              },
            }
          );
          break;
          
        case 'lesson_notification':
        case 'lesson_update':
          notificationAlertService.showLessonNotification(
            title || 'New Lesson Available',
            body || 'You have a new lesson notification',
            {
              onConfirm: () => {
                console.log('📱 NotificationService: User viewed lesson notification');
                this.handleNotificationTap(notification);
              },
              onCancel: () => {
                console.log('📱 NotificationService: User dismissed lesson notification');
              },
            }
          );
          break;
          
        case 'internship_notification':
        case 'internship_update':
          notificationAlertService.showInternshipNotification(
            title || 'Internship Update',
            body || 'You have a new internship notification',
            {
              onConfirm: () => {
                console.log('📱 NotificationService: User viewed internship notification');
                this.handleNotificationTap(notification);
              },
              onCancel: () => {
                console.log('📱 NotificationService: User dismissed internship notification');
              },
            }
          );
          break;
          
        default:
          // Default info notification
          notificationAlertService.showInfo(
            title || 'New Notification',
            body || 'You have a new notification',
            {
              onConfirm: () => {
                console.log('📱 NotificationService: User acknowledged notification');
                this.handleNotificationTap(notification);
              },
            }
          );
          break;
      }
      
    } catch (error) {
      console.error('❌ NotificationService: In-app notification failed:', error);
      
      // Fallback to native alert
      Alert.alert(
        notification.title || 'New Notification',
        notification.body || 'You have a new notification',
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
    }
  }

  // Enrich notification data with lessonId for lesson_live notifications
  // This is used by all notification handlers (foreground, background, cold start)
  async enrichNotificationDataWithLessonId(notificationData) {
    try {
      // Extract data from notification
      const fcmData = notificationData?.data || notificationData?.notification?.data || notificationData?.data || {};
      const notificationType = fcmData.type || fcmData.notificationType || 'general';
      
      // Only process lesson_live notifications
      if (notificationType !== 'lesson_live') {
        return notificationData;
      }
      
      // If lessonId already exists, return as is
      if (fcmData.lessonId || fcmData.lesson_id) {
        console.log('✅ NotificationService: lessonId already present in notification data');
        return notificationData;
      }
      
      console.log('🔔 NotificationService: lesson_live detected without lessonId, fetching from stored notifications...');
      
      // Try to get lessonId from stored notifications
      const storedNotifications = await this.getStoredNotifications();
      const notificationId = fcmData.notificationId || fcmData.notification_id;
      
      // Also check if notification was stored with remoteMessage that has data
      let foundLessonId = null;
      
      if (notificationId) {
        // Find stored notification by ID
        const storedNotification = storedNotifications.find(n => {
          // Check by notificationId in data
          if (n.data?.notificationId === notificationId) return true;
          // Check by stored id
          if (n.id === notificationId || n._id === notificationId) return true;
          // Check by messageId in remoteMessage
          if (n.remoteMessage?.messageId === notificationId) return true;
          return false;
        });
        
        if (storedNotification) {
          // Try to get lessonId from stored notification's data
          if (storedNotification.data?.lessonId) {
            foundLessonId = storedNotification.data.lessonId;
            console.log('✅ NotificationService: Found lessonId in stored notification data:', foundLessonId);
          }
          // Also check remoteMessage data
          else if (storedNotification.remoteMessage?.data?.lessonId) {
            foundLessonId = storedNotification.remoteMessage.data.lessonId;
            console.log('✅ NotificationService: Found lessonId in stored notification remoteMessage:', foundLessonId);
          }
        }
        
        // If still no lessonId, try to get from API
        if (!foundLessonId) {
          try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const userToken = await AsyncStorage.getItem('user_token');
            
              if (userToken) {
                console.log('🔔 NotificationService: Fetching notification from API with notificationId:', notificationId);
                const notifications = await this.getNotifications(userToken, 1, 50);
                
                if (notifications && notifications.notifications) {
                  console.log('🔔 NotificationService: Found', notifications.notifications.length, 'notifications from API');
                  
                  // Try to find by exact _id match first
                  let apiNotification = notifications.notifications.find(n => 
                    n._id && n._id.toString() === notificationId.toString()
                  );
                  
                  // If not found, try by id field
                  if (!apiNotification) {
                    apiNotification = notifications.notifications.find(n => 
                      n.id && n.id.toString() === notificationId.toString()
                    );
                  }
                  
                  // If still not found, try to find latest lesson_live notification
                  if (!apiNotification) {
                    console.log('🔔 NotificationService: Exact match not found, looking for latest lesson_live notification');
                    apiNotification = notifications.notifications
                      .filter(n => n.type === 'lesson_live' || n.data?.type === 'lesson_live')
                      .sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp))[0];
                  }
                  
                  if (apiNotification) {
                    console.log('🔔 NotificationService: Found API notification:', {
                      id: apiNotification._id || apiNotification.id,
                      type: apiNotification.type || apiNotification.data?.type,
                      hasData: !!apiNotification.data,
                      dataKeys: apiNotification.data ? Object.keys(apiNotification.data) : []
                    });
                    
                    if (apiNotification.data?.lessonId) {
                      foundLessonId = apiNotification.data.lessonId.toString();
                      console.log('✅ NotificationService: Found lessonId in API notification:', foundLessonId);
                    } else {
                      console.log('⚠️ NotificationService: API notification found but no lessonId in data');
                    }
                  } else {
                    console.log('⚠️ NotificationService: No matching notification found in API response');
                  }
                } else {
                  console.log('⚠️ NotificationService: No notifications returned from API');
                }
              } else {
                console.log('⚠️ NotificationService: No user token available for API call');
              }
          } catch (apiError) {
            console.error('❌ NotificationService: Error fetching notification from API:', apiError);
          }
        }
        
        // If we found lessonId, add it to notification data
        if (foundLessonId) {
          console.log('✅ NotificationService: Enriching notification data with lessonId:', foundLessonId);
          
          // Create a new object with enriched data
          // Ensure lessonId is available at multiple levels for compatibility
          const enrichedData = {
            ...notificationData,
            // Add lessonId at top level for easy access
            lessonId: foundLessonId,
            // Update data object
            data: {
              ...(notificationData.data || {}),
              ...fcmData,
              lessonId: foundLessonId,
              lesson_id: foundLessonId
            }
          };
          
          // Also update notification.data if it exists (Firebase structure)
          if (enrichedData.notification && enrichedData.notification.data) {
            enrichedData.notification.data = {
              ...enrichedData.notification.data,
              ...fcmData,
              lessonId: foundLessonId,
              lesson_id: foundLessonId
            };
          }
          
          // Also ensure data is directly accessible if notificationData.data exists
          if (notificationData.data) {
            enrichedData.data = {
              ...notificationData.data,
              ...fcmData,
              lessonId: foundLessonId,
              lesson_id: foundLessonId
            };
          }
          
          console.log('✅ NotificationService: Enriched notification data:', JSON.stringify({
            hasData: !!enrichedData.data,
            hasNotificationData: !!enrichedData.notification?.data,
            lessonIdInData: enrichedData.data?.lessonId,
            lessonIdInNotificationData: enrichedData.notification?.data?.lessonId,
            type: enrichedData.data?.type || enrichedData.notification?.data?.type
          }, null, 2));
          
          return enrichedData;
        }
      }
      
      return notificationData;
    } catch (error) {
      console.error('❌ NotificationService: Error enriching notification data:', error);
      return notificationData;
    }
  }

  // Handle notification tap
  async handleNotificationTap(notification) {
    try {
      console.log('🔔 NotificationService: Handling notification tap:', JSON.stringify(notification, null, 2));
      
      // Use deep linking for navigation
      const { generateDeepLinkFromNotification, navigateWithDeepLink } = require('../utils/deepLinking');
      
      // Handle different notification structures
      // notification might be:
      // 1. { title, body, data, type, remoteMessage } - from showInAppNotification
      // 2. remoteMessage directly - from Firebase
      // 3. { notification, data } - Firebase remoteMessage structure
      
      let notificationData = notification;
      
      // If it has remoteMessage, use that (from showInAppNotification)
      if (notification.remoteMessage) {
        notificationData = notification.remoteMessage;
      }
      // If it has notification property, it's a Firebase remoteMessage
      else if (notification.notification && notification.data) {
        notificationData = notification;
      }
      // Otherwise use as is
      
      console.log('🔔 NotificationService: Using notification data:', JSON.stringify(notificationData, null, 2));
      
      // Enrich notification data with lessonId for lesson_live notifications
      notificationData = await this.enrichNotificationDataWithLessonId(notificationData);
      
      // Extract data after enrichment
      const fcmData = notificationData?.data || notificationData?.notification?.data || notificationData?.data || {};
      const notificationType = fcmData.type || fcmData.notificationType || 'general';
      
      // Log the enriched data for debugging
      console.log('🔔 NotificationService: After enrichment -', {
        type: notificationType,
        lessonId: fcmData.lessonId || notificationData.lessonId,
        hasData: !!notificationData.data,
        hasNotificationData: !!notificationData.notification?.data,
        dataKeys: Object.keys(fcmData)
      });
      
      // Generate deep link from enriched notification
      let deepLink = generateDeepLinkFromNotification(notificationData);
      console.log('🔗 NotificationService: Generated deep link:', deepLink);
      
      // For internship notifications, always navigate to notification screen
      const internshipNotificationTypes = [
        'request_internship_letter',
        'upload_internship_letter',
        'internship_letter_uploaded',
        'internship_letter_payment',
        'internship_letter_payment_completed',
        'internship',
        'internshipNotification'
      ];
      
      if (internshipNotificationTypes.includes(notificationType)) {
        console.log('🔗 NotificationService: Internship notification detected, navigating to notification screen');
        deepLink = `${require('../utils/deepLinking').URL_SCHEME}://notification`;
        console.log('🔗 NotificationService: Updated deep link for internship notification:', deepLink);
      }
      
      // If deep link is still pointing to notification screen for lesson_live, try direct navigation
      if (notificationType === 'lesson_live' && deepLink.includes('notification')) {
        const lessonId = fcmData.lessonId || notificationData.lessonId || fcmData.lesson_id;
        if (lessonId) {
          console.log('🔗 NotificationService: Overriding deep link with lessonId:', lessonId);
          const correctDeepLink = `${require('../utils/deepLinking').URL_SCHEME}://lesson/live/${lessonId}`;
          console.log('🔗 NotificationService: Corrected deep link:', correctDeepLink);
          
          if (global.navigationRef && global.navigationRef.current) {
            setTimeout(() => {
              if (global.navigationRef && global.navigationRef.current) {
                navigateWithDeepLink(global.navigationRef.current, correctDeepLink);
              }
            }, 300);
          }
          return;
        } else if (fcmData.subcourseId) {
          console.log('⚠️ NotificationService: No lessonId found for lesson_live, using subcourseId to navigate to Enroll screen');
          const enrollDeepLink = `${require('../utils/deepLinking').URL_SCHEME}://enroll/${fcmData.subcourseId}`;
          
          if (global.navigationRef && global.navigationRef.current) {
            setTimeout(() => {
              if (global.navigationRef && global.navigationRef.current) {
                navigateWithDeepLink(global.navigationRef.current, enrollDeepLink);
              }
            }, 300);
          }
          return;
        }
      }
      
      if (global.navigationRef && global.navigationRef.current) {
        // Wait a bit to ensure navigation is ready
        setTimeout(() => {
          if (global.navigationRef && global.navigationRef.current) {
            navigateWithDeepLink(global.navigationRef.current, deepLink);
          }
        }, 300);
      } else {
        console.warn('⚠️ NotificationService: Navigation ref not available');
        // Retry after a delay
        setTimeout(() => {
          if (global.navigationRef && global.navigationRef.current) {
            navigateWithDeepLink(global.navigationRef.current, deepLink);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('❌ NotificationService: Notification tap handling failed:', error);
      // Fallback navigation
      if (global.navigationRef && global.navigationRef.current) {
        global.navigationRef.current.navigate('Notification');
      }
    }
  }

  // Navigate to notification screen
  navigateToNotificationScreen() {
    try {
      if (global.navigationRef && global.navigationRef.current) {
        global.navigationRef.current.navigate('Notification');
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
      console.log('🔔 NotificationService: Removing FCM token from backend...');
      console.log('🔔 NotificationService: FCM Token:', fcmToken ? `${fcmToken.substring(0, 20)}...` : 'null');
      console.log('🔔 NotificationService: User Token:', userToken ? `${userToken.substring(0, 20)}...` : 'null');
      
      const apiUrl = getApiUrl('/api/notification/remove-fcm-token');
      const deviceId = await this.getDeviceId();
      
      const response = await fetch(apiUrl, {
        method: 'DELETE', // Changed to DELETE method to match backend
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
      console.log('🔔 NotificationService: Remove FCM token response:', result);
      
      // Check for token errors but don't show popup (handled by skipSessionExpiredAlert flag)
      if (response.status === 401) {
        console.log('⚠️ NotificationService: Token expired during FCM token removal (expected during logout)');
        return false;
      }
      
      if (response.ok && result.success) {
        console.log('✅ NotificationService: FCM token removed successfully');
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
  async cleanup(userToken = null, fcmToken = null) {
    try {
      console.log('🔔 NotificationService: Starting cleanup...');
      
      // Get token and FCM token if not provided
      const tokenToUse = userToken || await AsyncStorage.getItem('user_token');
      const fcmTokenToUse = fcmToken || await getStoredFCMToken();
      
      console.log('🔔 NotificationService: Cleanup parameters:', {
        userTokenProvided: !!userToken,
        fcmTokenProvided: !!fcmToken,
        tokenFound: !!tokenToUse,
        fcmTokenFound: !!fcmTokenToUse,
        fcmTokenPreview: fcmTokenToUse ? `${fcmTokenToUse.substring(0, 20)}...` : 'null',
      });
      
      // Remove FCM token from backend
      if (tokenToUse && fcmTokenToUse) {
        console.log('🔔 NotificationService: Removing FCM token during cleanup...');
        const removed = await this.removeFCMTokenFromBackend(fcmTokenToUse, tokenToUse);
        if (removed) {
          console.log('✅ NotificationService: FCM token removed during cleanup');
        } else {
          console.log('⚠️ NotificationService: Failed to remove FCM token during cleanup');
        }
      } else {
        console.log('ℹ️ NotificationService: No FCM token or user token to remove during cleanup', {
          hasToken: !!tokenToUse,
          hasFcmToken: !!fcmTokenToUse,
        });
      }
      
      // Clear local notifications
      await AsyncStorage.removeItem('stored_notifications');
      console.log('✅ NotificationService: Local notifications cleared');
      
      // Clear FCM token from storage
      await AsyncStorage.removeItem('fcm_token');
      console.log('✅ NotificationService: FCM token cleared from storage');
      
    } catch (error) {
      console.error('❌ NotificationService: Cleanup failed:', error);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
