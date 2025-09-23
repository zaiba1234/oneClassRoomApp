import { 
  getFCMToken, 
  checkFirebaseStatus, 
  reinitializeFirebase,
  getStoredFCMToken 
} from './firebaseConfig';

// Simple FCM token generation test
export const testFCMTokenGeneration = async () => { 
  try {
    
    const token = await getFCMToken();
    
    if (token) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

// Test FCM token sending to backend
export const testFCMTokenSending = async (userToken) => {
  try {
    
    const token = await getStoredFCMToken();
    if (!token) {
      return false;
    }
    
    // Import API config
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
        platform: 'android',
      }),
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

// Get FCM token info
export const getFCMTokenInfo = async () => {
  try {
    const storedToken = await getStoredFCMToken();
    const isFirebaseReady = checkFirebaseStatus();
    
    return {
      firebaseReady: isFirebaseReady,
      hasStoredToken: !!storedToken,
      tokenPreview: storedToken ? storedToken.substring(0, 30) + '...' : null
    };
  } catch (error) {
    return {
      firebaseReady: false,
      hasStoredToken: false,
      tokenPreview: null,
      error: error.message
    };
  }
};

// Test Firebase configuration
export const testFirebaseConfig = () => {
  try {
    // Check if Firebase app is initialized (config is loaded from google-services.json)
    const { checkFirebaseStatus } = require('./firebaseConfig');
    
    const isFirebaseReady = checkFirebaseStatus();
    
    if (!isFirebaseReady) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};
