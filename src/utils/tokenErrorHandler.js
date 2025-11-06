/**
 * Token Error Handler Utility
 * Handles token expiration and invalid token errors across the app
 */

import store from '../Redux/store';
import { logout, clearUserFromStorage } from '../Redux/userSlice';
import { getStoredFCMToken } from '../services/firebaseConfig';
import { getApiUrl } from '../API/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import notificationService from '../services/notificationService';

// Navigation reference (will be set by App.js)
let navigationRef = null;

// Flag to skip session expired alert during logout/delete flows
let skipSessionExpiredAlert = false;

// Set navigation reference
export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

// Set flag to skip session expired alert (for logout/delete flows)
export const setSkipSessionExpiredAlert = (skip = true) => {
  skipSessionExpiredAlert = skip;
  console.log('🔐 [TokenErrorHandler] Skip session expired alert set to:', skip);
};

// Check if error is a token-related error
export const isTokenError = (error) => {
  if (!error) return false;

  const errorMessage = typeof error === 'string' ? error.toLowerCase() : '';
  const errorData = error?.error || error?.message || '';
  const errorString = typeof errorData === 'string' ? errorData.toLowerCase() : JSON.stringify(errorData).toLowerCase();

  // Check for token-related error messages
  const tokenErrorPatterns = [
    'invalid token',
    'token expired',
    'jwt expired',
    'jwt malformed',
    'token malformed',
    'unauthorized',
    'authentication failed',
    'token invalid',
    'expired token',
    'invalid authentication',
  ];

  // Check in error message
  if (tokenErrorPatterns.some(pattern => errorMessage.includes(pattern))) {
    return true;
  }

  // Check in error data
  if (tokenErrorPatterns.some(pattern => errorString.includes(pattern))) {
    return true;
  }

  // Check status code (401 = Unauthorized)
  if (error?.status === 401 || error?.statusCode === 401) {
    return true;
  }

  return false;
};

// Helper function to get device ID
const getDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem('device_id');
    if (!deviceId) {
      // Generate a simple device ID
      deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('❌ [TokenErrorHandler] Error getting device ID:', error);
    return `${Platform.OS}_${Date.now()}`;
  }
};

// Remove FCM token from backend when 401 error occurs
const removeFCMTokenOn401 = async () => {
  try {
    console.log('🔔 [TokenErrorHandler] Removing FCM token due to 401 error...');
    
    // IMPORTANT: Get all required data BEFORE logout clears Redux state
    const currentState = store.getState();
    const userToken = currentState.user?.token; // Get token from Redux BEFORE logout
    
    // Get FCM token and device ID from storage
    const fcmToken = await getStoredFCMToken();
    const deviceId = await getDeviceId();
    
    console.log('🔔 [TokenErrorHandler] Data captured:', {
      hasUserToken: !!userToken,
      hasFcmToken: !!fcmToken,
      deviceId: deviceId,
      userTokenPreview: userToken ? `${userToken.substring(0, 20)}...` : 'null',
      fcmTokenPreview: fcmToken ? `${fcmToken.substring(0, 20)}...` : 'null'
    });
    
    if (!fcmToken) {
      console.log('⚠️ [TokenErrorHandler] No FCM token found to remove');
      return false;
    }
    
    if (!userToken) {
      console.log('⚠️ [TokenErrorHandler] No user token available (may be expired, but will try anyway)');
    }
    
    // Try direct API call first (with detailed logging)
    console.log('🔔 [TokenErrorHandler] Making direct API call to remove FCM token...');
    const apiUrl = getApiUrl('/api/notification/remove-fcm-token');
    console.log('🔔 [TokenErrorHandler] API URL:', apiUrl);
    
    try {
      const requestBody = {
        fcmToken: fcmToken,
        deviceId: deviceId
      };
      
      console.log('🔔 [TokenErrorHandler] Request body:', JSON.stringify({
        fcmToken: fcmToken ? `${fcmToken.substring(0, 20)}...` : 'null',
        deviceId: deviceId
      }, null, 2));
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': userToken ? `Bearer ${userToken}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('🔔 [TokenErrorHandler] API Response status:', response.status);
      console.log('🔔 [TokenErrorHandler] API Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
      
      // Get response text first (might be JSON or text)
      const responseText = await response.text();
      console.log('🔔 [TokenErrorHandler] API Response text:', responseText);
      
      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('🔔 [TokenErrorHandler] API Response JSON:', JSON.stringify(responseData, null, 2));
      } catch (parseError) {
        console.log('⚠️ [TokenErrorHandler] Response is not JSON, raw text:', responseText);
        responseData = { message: responseText };
      }
      
      if (response.ok) {
        console.log('✅ [TokenErrorHandler] FCM token removed successfully!');
        console.log('✅ [TokenErrorHandler] Full API response:', JSON.stringify(responseData, null, 2));
        return true;
      } else {
        console.log('❌ [TokenErrorHandler] API call failed');
        console.log('❌ [TokenErrorHandler] Status:', response.status);
        console.log('❌ [TokenErrorHandler] Response:', JSON.stringify(responseData, null, 2));
        
        // If 401, try without auth header as fallback
        if (response.status === 401) {
          console.log('🔄 [TokenErrorHandler] Got 401, trying without auth header as fallback...');
          try {
            const fallbackResponse = await fetch(apiUrl, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            });
            
            const fallbackText = await fallbackResponse.text();
            console.log('🔔 [TokenErrorHandler] Fallback response status:', fallbackResponse.status);
            console.log('🔔 [TokenErrorHandler] Fallback response:', fallbackText);
            
            if (fallbackResponse.ok) {
              let fallbackData;
              try {
                fallbackData = JSON.parse(fallbackText);
              } catch (e) {
                fallbackData = { message: fallbackText };
              }
              console.log('✅ [TokenErrorHandler] FCM token removed via fallback (no auth):', JSON.stringify(fallbackData, null, 2));
              return true;
            }
          } catch (fallbackError) {
            console.error('❌ [TokenErrorHandler] Fallback error:', fallbackError);
          }
        }
        
        return false;
      }
    } catch (fetchError) {
      console.error('❌ [TokenErrorHandler] Fetch error:', fetchError);
      console.error('❌ [TokenErrorHandler] Error details:', {
        message: fetchError.message,
        stack: fetchError.stack
      });
      
      // Fallback: Try notificationService method
      console.log('🔄 [TokenErrorHandler] Trying notificationService method as fallback...');
      try {
        const removed = await notificationService.removeFCMTokenFromBackend(fcmToken, userToken);
        if (removed) {
          console.log('✅ [TokenErrorHandler] FCM token removed via notificationService fallback');
          return true;
        }
      } catch (serviceError) {
        console.error('❌ [TokenErrorHandler] notificationService fallback error:', serviceError);
      }
      
      return false;
    }
  } catch (error) {
    // Don't block logout flow if FCM token removal fails
    console.error('❌ [TokenErrorHandler] Error removing FCM token (non-blocking):', error);
    return false;
  }
};

// Helper function to get current navigation route
const getCurrentRoute = () => {
  try {
    if (navigationRef && navigationRef.current) {
      const nav = navigationRef.current;
      if (nav.isReady()) {
        const state = nav.getRootState();
        if (state && state.routes && state.routes.length > 0) {
          // Get the deepest route
          let route = state.routes[state.index || 0];
          while (route.state && route.state.routes) {
            route = route.state.routes[route.state.index || 0];
          }
          return route?.name;
        }
      }
    } else if (global.navigationRef && global.navigationRef.current) {
      const nav = global.navigationRef.current;
      if (nav.isReady()) {
        const state = nav.getRootState();
        if (state && state.routes && state.routes.length > 0) {
          let route = state.routes[state.index || 0];
          while (route.state && route.state.routes) {
            route = route.state.routes[route.state.index || 0];
          }
          return route?.name;
        }
      }
    }
  } catch (error) {
    console.warn('🔐 [TokenErrorHandler] Error getting current route:', error);
  }
  return null;
};

// Handle token error - logout and navigate to login
export const handleTokenError = async (error = null, showAlert = true) => {
  try {
    console.log('🔐 [TokenErrorHandler] Handling token error:', error);
    
    // Check if user is already logged out (from Redux state) BEFORE dispatching logout
    const currentState = store.getState();
    const isAuthenticated = currentState.user?.isAuthenticated;
    const currentRoute = getCurrentRoute();
    
    console.log('🔐 [TokenErrorHandler] Current state:', {
      isAuthenticated,
      currentRoute,
      skipSessionExpiredAlert,
      showAlert
    });
    
    // Remove FCM token from backend when 401 error occurs (before logout)
    // IMPORTANT: Await this call with timeout to ensure it completes
    console.log('🔔 [TokenErrorHandler] Starting FCM token removal before logout...');
    
    try {
      // Set a timeout to ensure we don't wait too long (max 3 seconds)
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.log('⏱️ [TokenErrorHandler] FCM token removal timeout (3s), proceeding with logout');
          resolve(false);
        }, 3000);
      });
      
      // Race between FCM removal and timeout
      const fcmRemovalResult = await Promise.race([
        removeFCMTokenOn401().catch(err => {
          console.error('❌ [TokenErrorHandler] Error in FCM token removal:', err);
          return false;
        }),
        timeoutPromise
      ]);
      
      if (fcmRemovalResult) {
        console.log('✅ [TokenErrorHandler] FCM token removal completed successfully before logout');
      } else {
        console.log('⚠️ [TokenErrorHandler] FCM token removal failed or timed out, proceeding with logout');
      }
    } catch (error) {
      console.error('❌ [TokenErrorHandler] Error in FCM token removal process:', error);
      // Continue with logout even if FCM removal fails
    }
    
    // Don't show popup if:
    // 1. User is already logged out (not authenticated)
    // 2. Currently on Login screen
    // 3. Flag is set (logout/delete flow)
    if (!isAuthenticated || currentRoute === 'Login') {
      console.log('🔐 [TokenErrorHandler] User already logged out or on Login screen, skipping popup');
      // Still clear data and navigate if needed, but don't show popup
      if (isAuthenticated) {
        store.dispatch(logout());
        await store.dispatch(clearUserFromStorage()).unwrap().catch(() => {});
      }
      return true;
    }
    
    // Clear user data from Redux
    store.dispatch(logout());
    
    // Clear user data from storage
    await store.dispatch(clearUserFromStorage()).unwrap().catch(() => {
      // Ignore errors during cleanup
    });

    // Navigate to login screen
    if (navigationRef && navigationRef.current) {
      const nav = navigationRef.current;
      if (nav.isReady()) {
        console.log('🔐 [TokenErrorHandler] Navigating to Login screen');
        nav.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        console.warn('🔐 [TokenErrorHandler] Navigation not ready yet');
      }
    } else if (global.navigationRef && global.navigationRef.current) {
      const nav = global.navigationRef.current;
      if (nav.isReady()) {
        console.log('🔐 [TokenErrorHandler] Navigating to Login screen (via global ref)');
        nav.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } else {
      console.warn('🔐 [TokenErrorHandler] Navigation ref not available');
    }

    // Show alert if requested and not skipping (for logout/delete flows)
    // Also check again if user is authenticated after logout dispatch
    const stateAfterLogout = store.getState();
    const isStillAuthenticated = stateAfterLogout.user?.isAuthenticated;
    
    if (showAlert && !skipSessionExpiredAlert && isStillAuthenticated && global.customAlertRef && global.customAlertRef.current) {
      console.log('🔐 [TokenErrorHandler] Showing session expired alert');
      global.customAlertRef.current.show({
        title: 'Session Expired',
        message: 'Your session has expired. Please login again.',
        type: 'warning',
        showCancel: false,
        confirmText: 'OK',
      });
    } else {
      if (skipSessionExpiredAlert) {
        console.log('🔐 [TokenErrorHandler] Skipping session expired alert (logout/delete flow)');
      } else if (!isStillAuthenticated) {
        console.log('🔐 [TokenErrorHandler] User already logged out, skipping popup');
      }
    }

    return true;
  } catch (handleError) {
    console.error('❌ [TokenErrorHandler] Error handling token error:', handleError);
    return false;
  }
};

// Check API response for token errors
export const checkApiResponseForTokenError = (response) => {
  try {
    // Check response status
    if (response?.status === 401) {
      return true;
    }

    // Check response data
    if (response?.data) {
      const error = response.data.error || response.data.message || '';
      if (isTokenError(error)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('❌ [TokenErrorHandler] Error checking API response:', error);
    return false;
  }
};

