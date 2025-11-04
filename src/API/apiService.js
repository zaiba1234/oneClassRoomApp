import { getApiUrl, getApiHeaders } from './config';
import { checkApiResponseForTokenError, handleTokenError } from '../utils/tokenErrorHandler';

// Endpoints that should not trigger session expired popup (logout/delete flows)
const EXCLUDED_ENDPOINTS = [
  '/api/notification/remove-fcm-token',
  '/api/user/profile/delete-profile',
];

// Check if endpoint should skip session expired alert
const shouldSkipSessionExpiredAlert = (endpoint) => {
  return EXCLUDED_ENDPOINTS.some(excluded => endpoint.includes(excluded));
};

// Common API service functions
export const apiService = {
  // POST request
  async post(endpoint, data) {
    try {
      const url = getApiUrl(endpoint);
      const headers = getApiHeaders();
      const body = JSON.stringify(data);
      
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });
      
      const responseData = await response.json();
      
      // Check for token errors
      if (checkApiResponseForTokenError({ status: response.status, data: responseData })) {
        console.log('🔐 [apiService] Token error detected in POST request');
        const skipAlert = shouldSkipSessionExpiredAlert(endpoint);
        await handleTokenError(responseData, !skipAlert); // Don't show alert if endpoint is excluded
        return {
          success: false,
          data: responseData,
          status: response.status,
          isTokenError: true,
        };
      }
      
      return {
        success: response.ok,
        data: responseData,
        status: response.status,
      };
    } catch (error) {
     
      return {
        success: false,
        data: { message: 'Network error occurred' },
        status: 0,
      };
    }
  },

  // GET request
  async get(endpoint) {
    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'GET',
        headers: getApiHeaders(),
      });
      
      const responseData = await response.json();
      
      // Check for token errors
      if (checkApiResponseForTokenError({ status: response.status, data: responseData })) {
        console.log('🔐 [apiService] Token error detected in GET request');
        const skipAlert = shouldSkipSessionExpiredAlert(endpoint);
        await handleTokenError(responseData, !skipAlert); // Don't show alert if endpoint is excluded
        return {
          success: false,
          data: responseData,
          status: response.status,
          isTokenError: true,
        };
      }
      
      return {
        success: response.ok,
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        data: { message: 'Network error occurred' },
        status: 0,
      };
    }
  },

  // PUT request
  async put(endpoint, data) {
    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      // Check for token errors
      if (checkApiResponseForTokenError({ status: response.status, data: responseData })) {
        console.log('🔐 [apiService] Token error detected in PUT request');
        const skipAlert = shouldSkipSessionExpiredAlert(endpoint);
        await handleTokenError(responseData, !skipAlert); // Don't show alert if endpoint is excluded
        return {
          success: false,
          data: responseData,
          status: response.status,
          isTokenError: true,
        };
      }
      
      return {
        success: response.ok,
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        data: { message: 'Network error occurred' },
        status: 0,
      };
    }
  },

  // DELETE request
  async delete(endpoint) {
    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'DELETE',
        headers: getApiHeaders(),
      });
      
      const responseData = await response.json();
      
      // Check for token errors
      if (checkApiResponseForTokenError({ status: response.status, data: responseData })) {
        console.log('🔐 [apiService] Token error detected in DELETE request');
        const skipAlert = shouldSkipSessionExpiredAlert(endpoint);
        await handleTokenError(responseData, !skipAlert); // Don't show alert if endpoint is excluded
        return {
          success: false,
          data: responseData,
          status: response.status,
          isTokenError: true,
        };
      }
      
      return {
        success: response.ok,
        data: responseData,
        status: response.status,
      };
    } catch (error) {
     
      return {
        success: false,
        data: { message: 'Network error occurred' },
        status: 0,
      };
    }
  },
};