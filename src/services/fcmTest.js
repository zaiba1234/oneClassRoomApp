import { 
  getFCMToken, 
  checkFirebaseStatus, 
  reinitializeFirebase,
  getStoredFCMToken 
} from './firebaseConfig';

// Simple FCM token generation test
export const testFCMTokenGeneration = async () => {
  try {
    console.log('🧪 FCM Test: Starting...');
    
    const token = await getFCMToken();
    
    if (token) {
      console.log('✅ FCM Test: SUCCESS - Token generated');
      console.log('🔑 FCM Test: Token Value:', token);
      console.log('📏 FCM Test: Token Length:', token.length);
      console.log('👀 FCM Test: Token Preview:', token.substring(0, 50) + '...');
      return true;
    } else {
      console.log('❌ FCM Test: FAILED - No token');
      return false;
    }
  } catch (error) {
    console.log('❌ FCM Test: ERROR -', error.message);
    return false;
  }
};

// Test FCM token sending to backend
export const testFCMTokenSending = async (userToken) => {
  try {
    console.log('🧪 FCM Test: Testing backend send...');
    
    const token = await getStoredFCMToken();
    if (!token) {
      console.log('❌ FCM Test: No stored token to send');
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
      console.log('✅ FCM Test: Backend send SUCCESS');
      return true;
    } else {
      console.log('❌ FCM Test: Backend send FAILED');
      return false;
    }
  } catch (error) {
    console.log('❌ FCM Test: Backend send ERROR -', error.message);
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
    console.log('🧪 FCM Test: Testing Firebase config...');
    
    const { firebaseConfig } = require('./firebaseConfig');
    
    const requiredFields = ['apiKey', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ FCM Test: Missing fields:', missingFields);
      return false;
    }
    
    if (firebaseConfig.apiKey === 'undefined' || firebaseConfig.apiKey === 'null') {
      console.log('❌ FCM Test: Invalid API key');
      return false;
    }
    
    console.log('✅ FCM Test: Config is valid');
    return true;
  } catch (error) {
    console.log('❌ FCM Test: Config test error -', error.message);
    return false;
  }
};
