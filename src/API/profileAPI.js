import { apiService } from './apiService';
import { getApiUrl, getApiHeaders } from './config';

export const profileAPI = {
  // Get user profile with authentication token
  async getUserProfile(token) {
    try {
      const url = getApiUrl('/api/user/profile/get-profile');
      const headers = {
        ...getApiHeaders(),
        'Authorization': `Bearer ${token}`,
      };
      
      console.log('profileAPI.getUserProfile - URL:', url);
      console.log('profileAPI.getUserProfile - Headers:', headers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      
      const responseData = await response.json();
      console.log('profileAPI.getUserProfile - Response Status:', response.status);
      console.log('profileAPI.getUserProfile - Response Data:', responseData);
      
      return {
        success: response.ok,
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      console.error('profileAPI.getUserProfile - Error:', error);
      return {
        success: false,
        data: { message: 'Network error occurred' },
        status: 0,
      };
    }
  },
};
