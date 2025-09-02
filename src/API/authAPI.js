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
    console.log('🔥 authAPI.sendOTP called with:', mobileNumber);
    const result = await sendOTP(mobileNumber);
    console.log('🔥 authAPI.sendOTP result:', result);
    return result;
  },

  // Login user (send OTP first)
  async login(mobileNumber) {
    console.log('🔥 authAPI.login called with:', mobileNumber);
    return await this.sendOTP(mobileNumber);
  },

  // Register user
  async register(fullName, mobileNumber) {
    console.log('🔥 authAPI.register called with:', { fullName, mobileNumber });
    const result = await registerUser(mobileNumber, { fullName });
    console.log('🔥 authAPI.register result:', result);
    return result;
  },

  // Verify OTP (Firebase)
  async verifyOTP(mobileNumber, otp, verificationId = null) {
    console.log('🔥 authAPI.verifyOTP called with:', { mobileNumber, otp, verificationId });
    
    try {
      // First verify OTP with Firebase
      const firebaseResult = await verifyOTP(verificationId, otp, mobileNumber);
      console.log('🔥 authAPI.verifyOTP: Firebase verification result:', firebaseResult);
      
      if (firebaseResult.success) {
        console.log('🔥 authAPI.verifyOTP: Firebase OTP verified successfully');
        console.log('🔥 authAPI.verifyOTP: User data:', firebaseResult.data.user);
        
        // Get the Firebase ID token
        const currentUser = getCurrentUser();
        if (currentUser) {
          const idToken = await currentUser.getIdToken();
          console.log('🔥 authAPI.verifyOTP: Got Firebase ID token:', idToken.substring(0, 20) + '...');
          
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
          console.log('🔥 authAPI.verifyOTP: Backend verification result:', result);
          
          return result;
        } else {
          console.log('❌ authAPI.verifyOTP: No current user found after Firebase verification');
          return {
            success: false,
            message: 'Firebase user not found after verification'
          };
        }
      } else {
        console.log('❌ authAPI.verifyOTP: Firebase verification failed:', firebaseResult);
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
    console.log('🔥 authAPI.resendOTP called with:', mobileNumber);
    const result = await resendOTP(mobileNumber);
    console.log('🔥 authAPI.resendOTP result:', result);
    return result;
  },

  // Get current user (Firebase)
  getCurrentUser() {
    return getCurrentUser();
  },

  // Sign out (Firebase)
  async signOut() {
    console.log('🔥 authAPI.signOut called');
    const result = await signOut();
    console.log('🔥 authAPI.signOut result:', result);
    return result;
  },
};
