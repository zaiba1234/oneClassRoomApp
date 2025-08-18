import { getApiUrl, getApiHeaders } from './config';

// Common API service functions
export const apiService = {
  // POST request
  async post(endpoint, data) {
    try {
      const url = getApiUrl(endpoint);
      const headers = getApiHeaders();
      const body = JSON.stringify(data);
      
      console.log('apiService.post - URL:', url);
      console.log('apiService.post - Headers:', headers);
      console.log('apiService.post - Body:', body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
      });
      
      const responseData = await response.json();
      console.log('apiService.post - Response Status:', response.status);
      console.log('apiService.post - Response Data:', responseData);
      
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

  // GET request
  async get(endpoint) {
    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'GET',
        headers: getApiHeaders(),
      });
      
      const responseData = await response.json();
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
};
