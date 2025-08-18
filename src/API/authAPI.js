import { apiService } from './apiService';
import { ENDPOINTS } from './config';

// Authentication API functions
export const authAPI = {
  // Login user
  async login(mobileNumber) {
    return await apiService.post(ENDPOINTS.LOGIN, { mobileNumber });
  },

  // Register user
  async register(fullName, mobileNumber) {
    return await apiService.post(ENDPOINTS.REGISTER, { 
      fullName, 
      mobileNumber 
    });
  },

  // Verify OTP
  async verifyOTP(mobileNumber, otp) {
    return await apiService.post(ENDPOINTS.VERIFY_OTP, { 
      mobileNumber, 
      otp: parseInt(otp) 
    });
  },
};
