import { getFCMToken, getStoredFCMToken, sendFCMTokenToBackend } from './firebaseConfig';
import { getApiUrl } from '../API/config';
import notificationService from './notificationService';

// FCM Token Service for managing tokens with Redux
export class FCMTokenService {
  constructor(store) {
    this.store = store;
    this.lastSentToken = null; // Track last sent token to prevent duplicates
    this.isTokenSent = false; // Flag to prevent multiple sends
  }

  // Get current user token from Redux store
  getCurrentUserToken() {
    const state = this.store.getState();
    return state.user?.token;
  }

  // Initialize FCM token and send to backend
  async initializeAndSendToken() {
    try {
      console.log('🔔 FCM Service: Initializing and sending FCM token...');
      
      // Get FCM token
      const fcmToken = await getFCMToken();
      if (!fcmToken) {
        console.log('❌ FCM Service: No FCM token available');
        return false;
      }

      // Get user token
      const userToken = this.getCurrentUserToken();
      if (!userToken) {
        console.log('ℹ️ FCM Service: User not logged in, token will be sent after login');
        return false;
      }

      // Use notification service to send token
      const success = await notificationService.sendFCMTokenToBackend(fcmToken, userToken);
      if (success) {
        console.log('✅ FCM Service: FCM token sent to backend successfully');
        return true;
      } else {
        console.log('❌ FCM Service: Failed to send FCM token to backend');
        return false;
      }
    } catch (error) {
      console.error('💥 FCM Service: Error in initializeAndSendToken:', error);
      return false;
    }
  }

  // Send stored FCM token to backend (for when user logs in)
  async sendStoredTokenToBackend() {
    try {
      console.log('🔔 FCM Service: Sending stored FCM token to backend...');
      
      // Get stored FCM token
      const fcmToken = await getStoredFCMToken();
      if (!fcmToken) {
        console.log('ℹ️ FCM Service: No stored FCM token found');
        return false;
      }

      // Check if this token was already sent
      if (this.lastSentToken === fcmToken && this.isTokenSent) {
        console.log('ℹ️ FCM Service: Token already sent, skipping duplicate send');
        return true;
      }

      // Get user token
      const userToken = this.getCurrentUserToken();
      if (!userToken) {
        console.log('❌ FCM Service: User not logged in');
        return false;
      }

      // Use notification service to send token
      const success = await notificationService.sendFCMTokenToBackend(fcmToken, userToken);
      if (success) {
        console.log('✅ FCM Service: Stored FCM token sent to backend successfully');
        this.lastSentToken = fcmToken;
        this.isTokenSent = true;
        return true;
      } else {
        console.log('❌ FCM Service: Failed to send stored FCM token to backend');
        return false;
      }
    } catch (error) {
      console.error('💥 FCM Service: Error in sendStoredTokenToBackend:', error);
      return false;
    }
  }

  // Refresh FCM token and send to backend
  async refreshAndSendToken() {
    try {
      console.log('🔄 FCM Service: Refreshing and sending FCM token...');
      
      // Import refresh function
      const { refreshFCMToken } = require('./firebaseConfig');
      
      // Refresh token
      const newToken = await refreshFCMToken();
      if (!newToken) {
        console.log('❌ FCM Service: Failed to refresh FCM token');
        return false;
      }

      // Check if this is a new token
      if (this.lastSentToken === newToken) {
        console.log('ℹ️ FCM Service: Token unchanged, skipping send');
        return true;
      }

      // Get user token
      const userToken = this.getCurrentUserToken();
      if (!userToken) {
        console.log('ℹ️ FCM Service: User not logged in, token will be sent after login');
        return false;
      }

      // Send to backend
      const success = await sendFCMTokenToBackend(newToken, userToken);
      if (success) {
        console.log('✅ FCM Service: Refreshed FCM token sent to backend successfully');
        this.lastSentToken = newToken;
        this.isTokenSent = true;
        return true;
      } else {
        console.log('❌ FCM Service: Failed to send refreshed FCM token to backend');
        return false;
      }
    } catch (error) {
      console.error('💥 FCM Service: Error in refreshAndSendToken:', error);
      return false;
    }
  }

  // Get current FCM token (from storage)
  async getCurrentFCMToken() {
    try {
      const token = await getStoredFCMToken();
      console.log('🔍 FCM Service: Current FCM token:', token ? token.substring(0, 20) + '...' : 'No token');
      return token;
    } catch (error) {
      console.error('💥 FCM Service: Error getting current FCM token:', error);
      return null;
    }
  }

  // Check if FCM token is valid and send to backend if needed
  async validateAndSendToken() {
    try {
      console.log('🔍 FCM Service: Validating FCM token...');
      
      const fcmToken = await getStoredFCMToken();
      const userToken = this.getCurrentUserToken();
      
      if (!fcmToken) {
        console.log('ℹ️ FCM Service: No FCM token found, initializing...');
        return await this.initializeAndSendToken();
      }
      
      if (!userToken) {
        console.log('ℹ️ FCM Service: User not logged in, token will be sent after login');
        return false;
      }
      
      // Check if this token was already sent
      if (this.lastSentToken === fcmToken && this.isTokenSent) {
        console.log('ℹ️ FCM Service: Token already sent, skipping duplicate send');
        return true;
      }
      
      // Send existing token to backend
      const success = await sendFCMTokenToBackend(fcmToken, userToken);
      if (success) {
        console.log('✅ FCM Service: Existing FCM token validated and sent to backend');
        this.lastSentToken = fcmToken;
        this.isTokenSent = true;
        return true;
      } else {
        console.log('❌ FCM Service: Failed to send existing FCM token to backend');
        return false;
      }
    } catch (error) {
      console.error('💥 FCM Service: Error in validateAndSendToken:', error);
      return false;
    }
  }

  // Reset token tracking (for logout)
  resetTokenTracking() {
    console.log('🔄 FCM Service: Resetting token tracking');
    this.lastSentToken = null;
    this.isTokenSent = false;
  }
}

// Create a singleton instance
let fcmTokenServiceInstance = null;

// Get FCM token service instance
export const getFCMTokenService = (store) => {
  if (!fcmTokenServiceInstance) {
    fcmTokenServiceInstance = new FCMTokenService(store);
  }
  return fcmTokenServiceInstance;
};

// Utility functions for direct use
export const initializeFCMToken = async (store) => {
  const service = getFCMTokenService(store);
  return await service.initializeAndSendToken();
};

export const sendStoredFCMToken = async (store) => {
  const service = getFCMTokenService(store);
  return await service.sendStoredTokenToBackend();
};

export const refreshFCMToken = async (store) => {
  const service = getFCMTokenService(store);
  return await service.refreshAndSendToken();
};

export const validateFCMToken = async (store) => {
  const service = getFCMTokenService(store);
  return await service.validateAndSendToken();
};

export default FCMTokenService;
