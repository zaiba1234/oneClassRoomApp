import { apiService } from './apiService';
import { ENDPOINTS, getApiUrl } from './config';
import { 
  sendOTP, 
  verifyOTP, 
  registerUser, 
  loginUser, 
  resendOTP, 
  getCurrentUser, 
  signOut 
} from '../services/firebaseAuthService';

// Authentication API functions (Real Firebase Authentication)
export const authAPI = {
  // Send OTP (Firebase)
  async sendOTP(mobileNumber) {
    const result = await sendOTP(mobileNumber);
    return result;
  },

  // Login user (send OTP first)
  async login(mobileNumber) {
    return await this.sendOTP(mobileNumber);
  },

  // Register user
  async register(fullName, mobileNumber) {
    const result = await registerUser(mobileNumber, { fullName });
    return result;
  },

  // Verify OTP (Firebase)
  async verifyOTP(mobileNumber, otp, verificationId = null) {
    
    try {
      // First verify OTP with Firebase
      const firebaseResult = await verifyOTP(verificationId, otp, mobileNumber);
      
      if (firebaseResult.success) {
        
        // Get the Firebase ID token
        const currentUser = getCurrentUser();
        if (currentUser) {
          const idToken = await currentUser.getIdToken();
          
          // Send idToken to backend for verification
          const response = await fetch(getApiUrl(ENDPOINTS.VERIFY_OTP), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mobileNumber: mobileNumber,
              idToken: idToken
            }),
          });

          const result = await response.json();
          
          return result;
        } else {
          return {
            success: false,
            message: 'Firebase user not found after verification'
          };
        }
      } else {
        return firebaseResult;
      }
    } catch (error) {
      console.error('💥 authAPI.verifyOTP: Error during verification:', error);
      return {
        success: false,
        message: 'Verification failed: ' + error.message
      };
    }
  },

  // Resend OTP (Firebase)
  async resendOTP(mobileNumber) {
    const result = await resendOTP(mobileNumber);
    return result;
  },

  // Get current user (Firebase)
  getCurrentUser() {
    return getCurrentUser();
  },

  // Sign out (Firebase)
  async signOut() {
    const result = await signOut();
    return result;
  },
};
