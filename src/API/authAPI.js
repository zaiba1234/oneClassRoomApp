import { apiService } from './apiService';
import { ENDPOINTS, getApiUrl } from './config';
// FIREBASE AUTH - COMMENTED OUT FOR 2FACTOR INTEGRATION
// import { 
//   sendOTP, 
//   verifyOTP, 
//   registerUser, 
//   loginUser, 
//   resendOTP, 
//   getCurrentUser, 
//   signOut 
// } from '../services/firebaseAuthService';

// 2FACTOR AUTH - NEW INTEGRATION
import twofactorAuthService from '../services/twofactorAuthService';

// Authentication API functions (2Factor Authentication)
export const authAPI = {
  // FIREBASE AUTH METHODS - COMMENTED OUT FOR 2FACTOR INTEGRATION
  // async backendLogin(mobileNumber) {
  //   try {
  //     const response = await fetch(getApiUrl(ENDPOINTS.LOGIN), {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         mobileNumber: mobileNumber
  //       }),
  //     });
  //     const result = await response.json();
  //     return result;
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: 'Backend login check failed: ' + error.message
  //     };
  //   }
  // },

  // async sendOTP(mobileNumber) {
  //   const result = await sendOTP(mobileNumber);
  //   return result;
  // },

  // async login(mobileNumber) {
  //   const backendResult = await this.backendLogin(mobileNumber);
  //   if (!backendResult.success) {
  //     console.log('❌ authAPI.login: Backend login check failed', backendResult);
  //     return backendResult;
  //   }
  //   return await this.sendOTP(mobileNumber);
  // },

  // async register(fullName, mobileNumber) {
  //   const result = await registerUser(mobileNumber, { fullName });
  //   return result;
  // },

  // async verifyOTP(mobileNumber, otp, verificationId = null) {
  //   try {
  //     const firebaseResult = await verifyOTP(verificationId, otp, mobileNumber);
  //     if (firebaseResult.success) {
  //       const currentUser = getCurrentUser();
  //       if (currentUser) {
  //         const idToken = await currentUser.getIdToken();
  //         const response = await fetch(getApiUrl(ENDPOINTS.VERIFY_OTP), {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({
  //             mobileNumber: mobileNumber,
  //             idToken: idToken
  //           }),
  //         });
  //         const result = await response.json();
  //         return result;
  //       } else {
  //         return {
  //           success: false,
  //           message: 'Firebase user not found after verification'
  //         };
  //       }
  //     } else {
  //       return firebaseResult;
  //     }
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: 'Verification failed: ' + error.message
  //     };
  //   }
  // },

  // async resendOTP(mobileNumber) {
  //   const result = await resendOTP(mobileNumber);
  //   return result;
  // },

  // async backendResendOTP(mobileNumber) {
  //   try {
  //     const response = await fetch(getApiUrl(ENDPOINTS.RESEND_OTP), {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         mobileNumber: mobileNumber
  //       }),
  //     });
  //     const result = await response.json();
  //     return result;
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: 'Backend resend OTP failed: ' + error.message
  //     };
  //   }
  // },

  // getCurrentUser() {
  //   return getCurrentUser();
  // },

  // async signOut() {
  //   const result = await signOut();
  //   return result;
  // },

  // 2FACTOR AUTH METHODS - NEW IMPLEMENTATION
  // Register user with 2Factor
  async register(fullName, mobileNumber) {
    return await twofactorAuthService.register(fullName, mobileNumber);
  },

  // Login user with 2Factor
  async login(mobileNumber) {
    return await twofactorAuthService.login(mobileNumber);
  },

  // Verify OTP with 2Factor
  async verifyOTP(mobileNumber, otp, sessionId) {
    return await twofactorAuthService.verifyOTP(mobileNumber, otp, sessionId);
  },

  // Resend OTP with 2Factor
  async resendOTP(mobileNumber) {
    return await twofactorAuthService.resendOTP(mobileNumber);
  },

  // Check 2Factor service status
  async checkStatus() {
    return await twofactorAuthService.checkStatus();
  },

  // Get current user (placeholder - implement based on your needs)
  getCurrentUser() {
    // TODO: Implement user session management
    return null;
  },

  // Sign out (placeholder - implement based on your needs)
  async signOut() {
    // TODO: Implement sign out logic
    return {
      success: true,
      message: 'Signed out successfully'
    };
  },
};