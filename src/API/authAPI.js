import { apiService } from './apiService';
import { ENDPOINTS } from './config';

// Authentication API functions
export const authAPI = {
  // Login user
  async login(mobileNumber) {
    console.log('authAPI.login called with:', mobileNumber);
    console.log('Using endpoint:', ENDPOINTS.LOGIN);
    const result = await apiService.post(ENDPOINTS.LOGIN, { mobileNumber });
    console.log('authAPI.login result:', result);
    return result;
  },

  // Register user
  async register(fullName, mobileNumber) {
    console.log('authAPI.register called with:', { fullName, mobileNumber });
    console.log('Using endpoint:', ENDPOINTS.REGISTER);
    const result = await apiService.post(ENDPOINTS.REGISTER, { 
      fullName, 
      mobileNumber 
    });
    console.log('authAPI.register result:', result);
    return result;
  },

  // Verify OTP
  async verifyOTP(mobileNumber, otp) {
    console.log('authAPI.verifyOTP called with:', { mobileNumber, otp });
    console.log('Using endpoint:', ENDPOINTS.VERIFY_OTP);
    const result = await apiService.post(ENDPOINTS.VERIFY_OTP, { 
      mobileNumber, 
      otp: parseInt(otp) 
    });
    console.log('authAPI.verifyOTP result:', result);
    return result;
  },
};
