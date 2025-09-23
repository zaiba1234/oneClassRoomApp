import { Platform, PermissionsAndroid } from 'react-native';
import messaging, { getMessaging, getToken } from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApp, getApps } from '@react-native-firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJn8hIkaO-MCKB_HJFyz1mNi3IwMUdiAg",
  projectId: "learningsaint-971bd",
  storageBucket: "learningsaint-971bd.firebasestorage.app",
  messagingSenderId: "830620644032",
  appId: Platform.OS === 'ios' 
    ? "1:830620644032:ios:54d5247078117e3726f325" 
    : "1:830620644032:android:54d5247078117e3726f325"
};

// Web Client ID for manual OTP entry (required for auth/code-expired fix)
export const WEB_CLIENT_ID = "830620644032-j4kpao6k3jak2ovtluttrgsjdqhn8q1h.apps.googleusercontent.com";

// FCM Token Storage Key
const FCM_TOKEN_KEY = 'fcm_token';

// Single Firebase initialization
let firebaseApp = null;

const initFirebase = () => {
  try {
    // Check if already initialized
    const apps = getApps();
    if (apps.length > 0) {
      console.log('✅ Firebase: Using existing app');
      firebaseApp = apps[0];
      return firebaseApp;
    }
    
    // Initialize new app only once
    console.log('🔥 Firebase: Initializing new app');
    firebaseApp = initializeApp(firebaseConfig);
    console.log('✅ Firebase: App initialized successfully');
    return firebaseApp;
  } catch (error) {
    if (error.code === 'app/duplicate-app') {
      console.log('✅ Firebase: App already exists, getting it');
      try {
        firebaseApp = getApp();
        return firebaseApp;
      } catch (getError) {
        console.log('❌ Firebase: Error getting existing app');
        return null;
      }
    } else {
      console.log('❌ Firebase: Init error:', error.message);
      return null;
    }
  }
};

// Initialize Firebase once at module load
firebaseApp = initFirebase();

// Check if notification permission is already granted
export const checkNotificationPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().hasPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      console.log('🔔 iOS Permission Status:', enabled ? 'GRANTED' : 'DENIED');
      return enabled;
    } else if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        console.log('🔔 Android POST_NOTIFICATIONS Status:', granted ? 'GRANTED' : 'DENIED');
        return granted;
      } else {
        // For Android 12 and below, permission is always granted
        console.log('🔔 Android 12 and below: Permission always granted');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.log('❌ Error checking permission:', error.message);
    return false;
  }
};

// Request notification permission for both iOS and Android
export const requestUserPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      console.log('🔔 iOS: Requesting notification permission...');
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      console.log('🔔 iOS Permission:', enabled);
      return enabled;
    } else if (Platform.OS === 'android') {
      console.log('🔔 Android: Checking notification permission...');
      
      // For Android 13+ (API level 33+), request POST_NOTIFICATIONS permission
      if (Platform.Version >= 33) {
        console.log('🔔 Android 13+: Requesting POST_NOTIFICATIONS permission...');
        
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'This app needs permission to send you notifications for important updates and course reminders.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'Allow',
            }
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('✅ Android: POST_NOTIFICATIONS permission granted');
            return true;
          } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
            console.log('❌ Android: POST_NOTIFICATIONS permission denied');
            return false;
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            console.log('❌ Android: POST_NOTIFICATIONS permission denied permanently');
            return false;
          } else {
            console.log('⚠️ Android: POST_NOTIFICATIONS permission request cancelled');
            return false;
          }
        } catch (error) {
          console.log('❌ Android: Error requesting POST_NOTIFICATIONS permission:', error.message);
          return false;
        }
      } else {
        // For Android 12 and below, notification permission is granted automatically
        console.log('🔔 Android 12 and below: Notification permission granted automatically');
        return true;
      }
    } else {
      console.log('❌ Unknown platform:', Platform.OS);
      return false;
    }
  } catch (error) {
    console.log('❌ Permission error:', error.message);
    return false;
  }
};

// Manual permission request function for UI
export const requestNotificationPermissionManually = async () => {
  try {
    console.log('🔔 Manual permission request initiated...');
    const granted = await requestUserPermission();
    
    if (granted) {
      console.log('✅ Manual permission request: GRANTED');
      return {
        success: true,
        message: 'Notification permission granted successfully!',
        granted: true
      };
    } else {
      console.log('❌ Manual permission request: DENIED');
      return {
        success: false,
        message: 'Notification permission was denied. You can enable it later in Settings.',
        granted: false
      };
    }
  } catch (error) {
    console.log('❌ Manual permission request error:', error.message);
    return {
      success: false,
      message: 'Error requesting notification permission: ' + error.message,
      granted: false
    };
  }
};

// Simple FCM token generation (using modern API)
export const getFCMToken = async () => {
  try {
    console.log('🔔 Getting FCM token...');
    
    // Use existing Firebase app
    if (!firebaseApp) {
      console.log('🔄 Getting Firebase app...');
      firebaseApp = getApp();
      if (!firebaseApp) {
        console.log('❌ Firebase not available');
        return null;
      }
    }
    
    // Check if permission is already granted
    let hasPermission = await checkNotificationPermission();
    
    // If not granted, request permission
    if (!hasPermission) {
      console.log('🔔 Permission not granted, requesting...');
      hasPermission = await requestUserPermission();
      if (!hasPermission) {
        console.log('❌ No permission granted');
        return null;
      }
    } else {
      console.log('✅ Permission already granted');
    }
    
    // Get token using modern API (no warnings)
    const messagingInstance = getMessaging(firebaseApp);
    const token = await getToken(messagingInstance);
    console.log('✅ FCM Token generated:', token ? 'SUCCESS' : 'FAILED');
    
    if (token) {
      // Show the actual token in console
      console.log('🔑 FCM Token Value:', token);
      console.log('📏 Token Length:', token.length);
      console.log('👀 Token Preview:', token.substring(0, 50) + '...');
      
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      console.log('💾 Token stored in AsyncStorage');
    }
    
    return token;
  } catch (error) {
    console.log('❌ FCM Token error:', error.message);
    return null;
  }
};

// Get stored token
export const getStoredFCMToken = async () => {
  try {
    const token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    return token;
  } catch (error) {
    return null;
  }
};

// Initialize messaging
export const initializeFirebaseMessaging = async () => {
  try {
    console.log('🚀 Initializing Firebase messaging...');
    const token = await getFCMToken();
    return token;
  } catch (error) {
    console.log('❌ Messaging init error:', error.message);
    return null;
  }
};

// Message listener (using modern API)
export const onMessageReceived = (callback) => {
  try {
    const messagingInstance = getMessaging(firebaseApp);
    return messagingInstance.onMessage((remoteMessage) => {
      console.log('📨 Message received');
      if (callback) callback(remoteMessage);
    });
  } catch (error) {
    console.log('❌ Message listener error:', error.message);
    return null;
  }
};

// Token refresh (using modern API)
export const onTokenRefresh = (callback) => {
  try {
    const messagingInstance = getMessaging(firebaseApp);
    return messagingInstance.onTokenRefresh((token) => {
      console.log('🔄 Token refreshed');
      AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      if (callback) callback(token);
    });
  } catch (error) {
    console.log('❌ Token refresh error:', error.message);
    return null;
  }
};

// Background message handler
export const onBackgroundMessage = async (remoteMessage) => {
  console.log('📨 Background message:', remoteMessage);
};

// Set background handler (using modern API)
try {
  const messagingInstance = getMessaging(firebaseApp);
  messagingInstance.setBackgroundMessageHandler(onBackgroundMessage);
} catch (error) {
  console.log('❌ Background handler error:', error.message);
}

// Note: Background handler is now registered in index.js at top level
// This is required for React Native Firebase to work properly

// Status check
export const checkFirebaseStatus = () => {
  return firebaseApp !== null;
};

// Get Firebase app (no reinitialization)
export const getFirebaseApp = () => {
  if (!firebaseApp) {
    firebaseApp = getApp();
  }
  return firebaseApp;
};

// Send to backend
export const sendFCMTokenToBackend = async (token, userToken) => {
  try {
    const { getApiUrl } = require('../API/config');
    const apiUrl = getApiUrl('/api/user/fcm-token/update');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fcmToken: token,
        platform: Platform.OS,
      }),
    });
    
    const result = await response.json();
    return response.ok && result.success;
  } catch (error) {
    console.log('❌ Backend send error:', error.message);
    return false;
  }
};

// Display FCM token details
export const displayFCMToken = async () => {
  try {
    const token = await getStoredFCMToken();
    if (token) {
      console.log('🎯 FCM Token Details:');
      console.log('🔑 Full Token:', token);
      console.log('📏 Token Length:', token.length);
      console.log('👀 Token Preview:', token.substring(0, 50) + '...');
      console.log('💾 Storage Key:', FCM_TOKEN_KEY);
      return token;
    } else {
      console.log('❌ No FCM token found in storage');
      return null;
    }
  } catch (error) {
    console.log('❌ Error displaying FCM token:', error.message);
    return null;
  }
};

export default {
  firebaseConfig,
  firebaseApp,
  checkFirebaseStatus,
  getFirebaseApp,
  checkNotificationPermission,
  requestUserPermission,
  requestNotificationPermissionManually,
  getFCMToken,
  getStoredFCMToken,
  initializeFirebaseMessaging,
  sendFCMTokenToBackend,
  onMessageReceived,
  onTokenRefresh,
  onBackgroundMessage,
  displayFCMToken,
};
