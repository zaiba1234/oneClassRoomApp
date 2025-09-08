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
  } catch (error) {
    console.error('❌ Background notification processing failed:', error);
  }
});

// Initialize notification service for background handling
notificationService.initialize().then(() => {
  console.log('🔔 Background notification service initialized');
}).catch((error) => {
  console.error('❌ Background notification service initialization failed:', error);
});

AppRegistry.registerComponent(appName, () => App);
