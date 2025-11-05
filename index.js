/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Import Firebase messaging for background handling
import messaging from '@react-native-firebase/messaging';
import notificationService from './src/services/notificationService';

// Register background message handler - MUST be at top level
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📨 Background message received in index.js:', JSON.stringify(remoteMessage, null, 2));
  
  try {
    // Initialize notification service if not already done
    if (!notificationService.isInitialized) {
      await notificationService.initialize();
    }
    
    // Handle the background notification
    await notificationService.handleBackgroundNotification(remoteMessage);
    console.log('✅ Background notification processed successfully');
    
    // Note: Deep linking will be handled when user taps the notification
    // The notification tap will trigger navigation via deep link
  } catch (error) {
    console.error('❌ Background notification processing failed:', error);
  }
});

// Handle notification that opened the app (when app was closed)
messaging().getInitialNotification().then(async (remoteMessage) => {
  if (remoteMessage) {
    console.log('🔗 [index.js] App opened from notification:', JSON.stringify(remoteMessage, null, 2));
    
    try {
      // Enrich notification data with lessonId for lesson_live notifications
      // Note: This is async, so we need to wait for it
      const notificationService = require('./src/services/notificationService').default;
      await notificationService.initialize(); // Ensure service is initialized
      const enrichedNotification = await notificationService.enrichNotificationDataWithLessonId(remoteMessage);
      
      // Generate deep link from enriched notification
      const { generateDeepLinkFromNotification } = require('./src/utils/deepLinking');
      let deepLink = generateDeepLinkFromNotification(enrichedNotification);
      console.log('🔗 [index.js] Generated deep link from initial notification:', deepLink);
      
      // For internship notifications, always navigate to notification screen
      const fcmData = enrichedNotification?.data || enrichedNotification?.notification?.data || {};
      const notificationType = fcmData.type || fcmData.notificationType || 'general';
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
        console.log('🔗 [index.js] Internship notification detected, navigating to notification screen');
        deepLink = `learningsaint://notification`;
        console.log('🔗 [index.js] Updated deep link for internship notification:', deepLink);
      }
      
      // Store in AsyncStorage for App.js to pick up
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('pending_deep_link', deepLink);
      
      // Also store the enriched notification data for App.js to use
      await AsyncStorage.setItem('pending_notification_data', JSON.stringify(enrichedNotification));
    } catch (err) {
      console.error('❌ [index.js] Error processing initial notification:', err);
      // Fallback: store basic deep link
      try {
        const { generateDeepLinkFromNotification } = require('./src/utils/deepLinking');
        const deepLink = generateDeepLinkFromNotification(remoteMessage);
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('pending_deep_link', deepLink);
      } catch (fallbackErr) {
        console.error('❌ [index.js] Error storing pending deep link (fallback):', fallbackErr);
      }
    }
  }
});

// Initialize notification service for background handling
notificationService.initialize().then(() => {
  console.log('🔔 Background notification service initialized');
}).catch((error) => {
  console.error('❌ Background notification service initialization failed:', error);
});

AppRegistry.registerComponent(appName, () => App);
