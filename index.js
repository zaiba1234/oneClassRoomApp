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
      // Always navigate to NotificationScreen when app is opened from notification (cold start)
      console.log('🔗 [index.js] Navigating to NotificationScreen for all cold start notifications');
      
      // Store notification screen deep link for App.js to pick up
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('pending_deep_link', 'learningsaint://notification');
      console.log('✅ [index.js] Stored NotificationScreen deep link for cold start');
    } catch (err) {
      console.error('❌ [index.js] Error processing initial notification:', err);
      // Fallback: store notification screen deep link
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('pending_deep_link', 'learningsaint://notification');
        console.log('✅ [index.js] Stored NotificationScreen deep link (fallback)');
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
