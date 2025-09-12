import { Platform } from 'react-native';
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

// FCM Token Storage Key
const FCM_TOKEN_KEY = 'fcm_token';

// Single Firebase initialization
let firebaseApp = null;

const initFirebase = () => {
  try {
    // Check if already initialized
    const apps = getApps();
    if (apps.length > 0) {
      firebaseApp = apps[0];
      return firebaseApp;
    }
    
    // Initialize new app only once
    firebaseApp = initializeApp(firebaseConfig);
    return firebaseApp;
  } catch (error) {
    if (error.code === 'app/duplicate-app') {
      try {
        firebaseApp = getApp();
        return firebaseApp;
      } catch (getError) {
        return null;
      }
    } else {
      return null;
    }
  }
};

// Initialize Firebase once at module load
firebaseApp = initFirebase();

// Simple permission request
export const requestUserPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
};

// Simple FCM token generation (using modern API)
export const getFCMToken = async () => {
  try {
    
    // Use existing Firebase app
    if (!firebaseApp) {
      firebaseApp = getApp();
      if (!firebaseApp) {
        return null;
      }
    }
    
    // Request permission
    const hasPermission = await requestUserPermission();
    if (!hasPermission) {
      return null;
    }
    
    // Get token using modern API (no warnings)
    const messagingInstance = getMessaging(firebaseApp);
    const token = await getToken(messagingInstance);
    
    if (token) {
      // Show the actual token in console
      
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
    }
    
    return token;
  } catch (error) {
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
    const token = await getFCMToken();
    return token;
  } catch (error) {
    return null;
  }
};

// Message listener (using modern API)
export const onMessageReceived = (callback) => {
  try {
    const messagingInstance = getMessaging(firebaseApp);
    return messagingInstance.onMessage((remoteMessage) => {
      if (callback) callback(remoteMessage);
    });
  } catch (error) {
    return null;
  }
};

// Token refresh (using modern API)
export const onTokenRefresh = (callback) => {
  try {
    const messagingInstance = getMessaging(firebaseApp);
    return messagingInstance.onTokenRefresh((token) => {
      AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      if (callback) callback(token);
    });
  } catch (error) {
    return null;
  }
};

// Background message handler
export const onBackgroundMessage = async (remoteMessage) => {
};

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
    return false;
  }
};

// Display FCM token details
export const displayFCMToken = async () => {
  try {
    const token = await getStoredFCMToken();
    if (token) {
      return token;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export default {
  firebaseConfig,
  firebaseApp,
  checkFirebaseStatus,
  getFirebaseApp,
  requestUserPermission,
  getFCMToken,
  getStoredFCMToken,
  initializeFirebaseMessaging,
  sendFCMTokenToBackend,
  onMessageReceived,
  onTokenRefresh,
  onBackgroundMessage,
  displayFCMToken,
};
