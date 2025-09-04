/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Import notification service for background handling
import notificationService from './src/services/notificationService';

// Initialize notification service for background handling
notificationService.initialize().then(() => {
  console.log('🔔 Background notification service initialized');
}).catch((error) => {
  console.error('❌ Background notification service initialization failed:', error);
});

AppRegistry.registerComponent(appName, () => App);
