import { getFCMToken, getStoredFCMToken, sendFCMTokenToBackend } from './firebaseConfig';
import { getApiUrl } from '../API/config';
import notificationService from './notificationService';

// FCM Token Service for managing tokens with Redux
export class FCMTokenService {
  constructor(store) {
    this.store = store;
  }

  // Get current user token from Redux store
  getCurrentUserToken() {
    const state = this.store.getState();
    return state.user?.token;
  }

  // Initialize FCM token and send to backend
  async initializeAndSendToken() {
    try {
      
      // Get FCM token
      const fcmToken = await getFCMToken();
      if (!fcmToken) {
        return false;
      }

      // Get user token
      const userToken = this.getCurrentUserToken();
      if (!userToken) {
        return false;
      }

      // Use notification service to send token
      const success = await notificationService.sendFCMTokenToBackend(fcmToken, userToken);
      if (success) {
        return true;
      } else {
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
      
      // Get stored FCM token
      const fcmToken = await getStoredFCMToken();
      if (!fcmToken) {
        return false;
      }

      // Get user token
      const userToken = this.getCurrentUserToken();
      if (!userToken) {
        return false;
      }

      // Use notification service to send token
      const success = await notificationService.sendFCMTokenToBackend(fcmToken, userToken);
      if (success) {
        return true;
      } else {
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
      console.log('🔄 [FCM Service] Refreshing FCM token...');
      
      // Get new FCM token
      const newToken = await getFCMToken();
      if (!newToken) {
        console.error('🔄 [FCM Service] Failed to get new FCM token');
        return false;
      }

      // Get user token
      const userToken = this.getCurrentUserToken();
      if (!userToken) {
        console.error('🔄 [FCM Service] No user token available');
        return false;
      }

      // Send to backend
      const success = await sendFCMTokenToBackend(newToken, userToken);
      if (success) {
        console.log('✅ [FCM Service] Token refreshed and sent successfully');
        return true;
      } else {
        console.error('🔄 [FCM Service] Failed to send refreshed token to backend');
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
      return token;
    } catch (error) {
      console.error('💥 FCM Service: Error getting current FCM token:', error);
      return null;
    }
  }

  // Check if FCM token is valid and send to backend if needed
  async validateAndSendToken() {
    try {
      
      const fcmToken = await getStoredFCMToken();
      const userToken = this.getCurrentUserToken();
      
      if (!fcmToken) {
        return await this.initializeAndSendToken();
      }
      
      if (!userToken) {
        return false;
      }
      
      // Send existing token to backend
      const success = await sendFCMTokenToBackend(fcmToken, userToken);
      if (success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('💥 FCM Service: Error in validateAndSendToken:', error);
      return false;
    }
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
