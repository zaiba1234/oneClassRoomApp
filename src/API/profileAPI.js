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
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const responseData = await response.json();
      
      return {
        success: response.ok,
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      console.error('profileAPI.getUserProfile - Error:', error);
      
      // Check if it's a timeout error
      if (error.name === 'AbortError') {
        return {
          success: false,
          data: { message: 'Request timeout - server took too long to respond' },
          status: 0,
        };
      }
      
      return {
        success: false,
        data: { message: 'Network error occurred' },
        status: 0,
      };
    }
  },

  // Update user profile with authentication token
  async updateUserProfile(token, profileData) {
    try {
      const url = getApiUrl('/api/user/profile/update-profile');
      
      
      // Check if FormData is available
      if (typeof FormData === 'undefined') {
        console.error('profileAPI.updateUserProfile - FormData is not available, trying JSON fallback');
        return await this.updateUserProfileJSON(token, profileData);
      }
      
      // Create FormData for the request
      const formData = new FormData();
      
      // Add profile image if it's a file URI
      if (profileData.profileImageUrl && profileData.profileImageUrl.uri) {
        // Check if it's a local file or network image
        if (profileData.profileImageUrl.uri.startsWith('file://') || profileData.profileImageUrl.uri.startsWith('content://')) {
          const imageFile = {
            uri: profileData.profileImageUrl.uri,
            type: 'image/jpeg',
            name: 'profile-image.jpg',
          };
          formData.append('profileImageUrl', imageFile);
        } else {
          // If it's a network image, just send the URL as string
          formData.append('profileImageUrl', profileData.profileImageUrl.uri);
        }
      }
      
      // Add other fields
      if (profileData.address) {
        formData.append('address', profileData.address);
      }
      if (profileData.email) {
        formData.append('email', profileData.email);
      }
      
      // Safely log FormData contents
      try {
        if (formData.entries && typeof formData.entries === 'function') {
          for (let [key, value] of formData.entries()) {
          }
        } else {
        }
      } catch (logError) {
      }
      
      // For FormData, don't set Content-Type header - let the browser set it with boundary
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      
      const responseData = await response.json();
      
      return {
        success: response.ok,
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      console.error('profileAPI.updateUserProfile - Error:', error);
      console.error('profileAPI.updateUserProfile - Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Check if it's a timeout error
      if (error.name === 'AbortError') {
        return {
          success: false,
          data: { message: 'Request timeout - server took too long to respond' },
          status: 0,
        };
      }
      
      // If FormData fails, try JSON fallback
      try {
        return await this.updateUserProfileJSON(token, profileData);
      } catch (fallbackError) {
        console.error('profileAPI.updateUserProfile - JSON fallback also failed:', fallbackError);
        return {
          success: false,
          data: { message: `Network error occurred: ${error.message}` },
          status: 0,
        };
      }
    }
  },

  // Fallback method using JSON instead of FormData
  async updateUserProfileJSON(token, profileData) {
    try {
      const url = getApiUrl('/api/user/profile/update-profile');
      
      
      // Prepare JSON data (without image file)
      const jsonData = {};
      
      if (profileData.address) {
        jsonData.address = profileData.address;
      }
      if (profileData.email) {
        jsonData.email = profileData.email;
      }
      // Note: We can't send image files via JSON, so we'll skip the image
      if (profileData.profileImageUrl && profileData.profileImageUrl.uri) {
      }
      
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(jsonData),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      
      const responseData = await response.json();
      
      return {
        success: response.ok,
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      console.error('profileAPI.updateUserProfileJSON - Error:', error);
      return {
        success: false,
        data: { message: `JSON fallback failed: ${error.message}` },
        status: 0,
      };
    }
  },
};
