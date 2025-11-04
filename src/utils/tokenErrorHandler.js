/**
 * Token Error Handler Utility
 * Handles token expiration and invalid token errors across the app
 */

import store from '../Redux/store';
import { logout, clearUserFromStorage } from '../Redux/userSlice';

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

