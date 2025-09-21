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
  // Backend login check (check if user exists)
  async backendLogin(mobileNumber) {
    try {
      
      
      const response = await fetch(getApiUrl(ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber: mobileNumber
        }),
      });

      const result = await response.json();
    
      
      return result;
    } catch (error) {
      
      return {
        success: false,
        message: 'Backend login check failed: ' + error.message
      };
    }
  },

  // Send OTP (Firebase)
  async sendOTP(mobileNumber) {
    const result = await sendOTP(mobileNumber);
    return result;
  },

  // Login user (check backend first, then send OTP)
  async login(mobileNumber) {
    // First check if user exists in backend
    const backendResult = await this.backendLogin(mobileNumber);
    
    if (!backendResult.success) {
      console.log('❌ authAPI.login: Backend login check failed', backendResult);
      return backendResult;
    }
    
    // If backend check passes, send Firebase OTP
   
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

  // Backend Firebase Resend OTP
  async backendResendOTP(mobileNumber) {
    try {
      
      const response = await fetch(getApiUrl(ENDPOINTS.RESEND_OTP), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber: mobileNumber
        }),
      });

      const result = await response.json();
     
      
      return result;
    } catch (error) {
      
      return {
        success: false,
        message: 'Backend resend OTP failed: ' + error.message
      };
    }
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