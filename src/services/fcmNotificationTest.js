import { 
  getFCMToken, 
  getStoredFCMToken, 
  checkFirebaseStatus,
  onMessageReceived,
  onTokenRefresh,
  sendFCMTokenToBackend
} from './firebaseConfig';

// Test FCM notification functionality
export const testFCMNotifications = async () => {
  console.log('🧪 [FCM Test] Starting FCM notification tests...');
  
  try {
    // Test 1: Check Firebase status
    console.log('🧪 [FCM Test] 1. Checking Firebase status...');
    const isFirebaseReady = checkFirebaseStatus();
    console.log('🧪 [FCM Test] Firebase ready:', isFirebaseReady);
    
    if (!isFirebaseReady) {
      console.error('❌ [FCM Test] Firebase not ready - notifications will not work');
      return false;
    }
    
    // Test 2: Generate FCM token
    console.log('🧪 [FCM Test] 2. Generating FCM token...');
    const fcmToken = await getFCMToken();
    console.log('🧪 [FCM Test] FCM token generated:', fcmToken ? 'SUCCESS' : 'FAILED');
    
    if (!fcmToken) {
      console.error('❌ [FCM Test] Failed to generate FCM token');
      return false;
    }
    
    console.log('🧪 [FCM Test] Token preview:', fcmToken.substring(0, 30) + '...');
    
    // Test 3: Check stored token
    console.log('🧪 [FCM Test] 3. Checking stored token...');
    const storedToken = await getStoredFCMToken();
    console.log('🧪 [FCM Test] Stored token exists:', !!storedToken);
    
    // Test 4: Set up message listener
    console.log('🧪 [FCM Test] 4. Setting up message listener...');
    const unsubscribe = onMessageReceived((message) => {
      console.log('🧪 [FCM Test] Message received in foreground:', message);
    });
    
    if (unsubscribe) {
      console.log('✅ [FCM Test] Message listener set up successfully');
    } else {
      console.error('❌ [FCM Test] Failed to set up message listener');
    }
    
    // Test 5: Set up token refresh listener
    console.log('🧪 [FCM Test] 5. Setting up token refresh listener...');
    const refreshUnsubscribe = onTokenRefresh((newToken) => {
      console.log('🧪 [FCM Test] Token refreshed:', newToken ? 'SUCCESS' : 'FAILED');
    });
    
    if (refreshUnsubscribe) {
      console.log('✅ [FCM Test] Token refresh listener set up successfully');
    } else {
      console.error('❌ [FCM Test] Failed to set up token refresh listener');
    }
    
    console.log('✅ [FCM Test] All FCM tests completed successfully!');
    console.log('🧪 [FCM Test] FCM notifications should now work properly');
    
    return true;
    
  } catch (error) {
    console.error('❌ [FCM Test] Error during FCM testing:', error);
    return false;
  }
};

// Test FCM token sending to backend
export const testFCMTokenSending = async (userToken) => {
  console.log('🧪 [FCM Test] Testing FCM token sending to backend...');
  
  try {
    if (!userToken) {
      console.error('❌ [FCM Test] No user token provided');
      return false;
    }
    
    const fcmToken = await getStoredFCMToken();
    if (!fcmToken) {
      console.error('❌ [FCM Test] No FCM token available');
      return false;
    }
    
    console.log('🧪 [FCM Test] Sending FCM token to backend...');
    const success = await sendFCMTokenToBackend(fcmToken, userToken);
    
    if (success) {
      console.log('✅ [FCM Test] FCM token sent to backend successfully');
    } else {
      console.error('❌ [FCM Test] Failed to send FCM token to backend');
    }
    
    return success;
    
  } catch (error) {
    console.error('❌ [FCM Test] Error sending FCM token:', error);
    return false;
  }
};

// Get FCM status summary
export const getFCMStatus = async () => {
  try {
    const isFirebaseReady = checkFirebaseStatus();
    const fcmToken = await getStoredFCMToken();
    
    return {
      firebaseReady: isFirebaseReady,
      hasFCMToken: !!fcmToken,
      tokenPreview: fcmToken ? fcmToken.substring(0, 30) + '...' : null,
      status: isFirebaseReady && fcmToken ? 'READY' : 'NOT_READY'
    };
  } catch (error) {
    return {
      firebaseReady: false,
      hasFCMToken: false,
      tokenPreview: null,
      status: 'ERROR',
      error: error.message
    };
  }
};

export default {
  testFCMNotifications,
  testFCMTokenSending,
  getFCMStatus
};
