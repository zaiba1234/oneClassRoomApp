import auth from '@react-native-firebase/auth';
import { getApiUrl, ENDPOINTS } from '../API/config';

// Simple Firebase Auth instance
const firebaseAuth = auth();

// Send OTP to phone number
export const sendOTP = async (phoneNumber) => {
  try {
    console.log('🔥 sendOTP: Starting OTP sending process...');
    console.log('📱 sendOTP: Phone number:', phoneNumber);
    
    // Format phone number properly
    const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    console.log('📱 sendOTP: Formatted phone number:', formattedPhoneNumber);
    
    // Check if Firebase Console has this number in test mode
    console.log('🔥 sendOTP: Calling Firebase signInWithPhoneNumber...');
    console.log('⚠️ sendOTP: If OTP not received, check Firebase Console - remove this number from Test Phone Numbers');
    
    const confirmation = await firebaseAuth.signInWithPhoneNumber(formattedPhoneNumber);
    console.log('✅ sendOTP: Firebase OTP sent successfully!');
    console.log('🆔 sendOTP: Verification ID:', confirmation.verificationId);
    console.log('📱 sendOTP: Check your phone for SMS message');
    
    return {
      success: true,
      data: {
        message: 'OTP sent successfully',
        verificationId: confirmation.verificationId,
        phoneNumber: formattedPhoneNumber
      }
    };
  } catch (error) {
    console.error('🔥 Firebase Auth Error (sendOTP):', error);
    console.error('🔥 sendOTP: Error code:', error.code);
    console.error('🔥 sendOTP: Error message:', error.message);
    
    return {
      success: false,
      data: {
        message: 'OTP failed: ' + error.message,
        error: error.code || 'unknown-error',
        phoneNumber: phoneNumber
      }
    };
  }
};

// Verify OTP
export const verifyOTP = async (verificationId, otp, phoneNumber) => {
  try {
    console.log('🔥 verifyOTP: Starting OTP verification...');
    console.log('🆔 verifyOTP: Verification ID:', verificationId);
    console.log('🔢 verifyOTP: OTP:', otp);
    
    // Real Firebase OTP verification
    const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
    const userCredential = await firebaseAuth.signInWithCredential(credential);
    
    console.log('✅ verifyOTP: OTP verified successfully!');
    console.log('👤 verifyOTP: User UID:', userCredential.user.uid);
    
    return {
      success: true,
      data: {
        message: 'OTP verified successfully',
        user: {
          uid: userCredential.user.uid,
          phoneNumber: userCredential.user.phoneNumber,
          isNewUser: userCredential.additionalUserInfo?.isNewUser || false
        }
      }
    };
  } catch (error) {
    console.error('🔥 Firebase Auth Error (verifyOTP):', error);
    console.error('🔥 verifyOTP: Error code:', error.code);
    console.error('🔥 verifyOTP: Error message:', error.message);
    
    // Handle specific Firebase error codes
    let errorMessage = 'OTP verification failed';
    
    switch (error.code) {
      case 'auth/invalid-verification-code':
        errorMessage = 'Invalid OTP. Please check the code and try again.';
        break;
      case 'auth/code-expired':
        errorMessage = 'OTP has expired. Please request a new one.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many attempts. Please try again later.';
        break;
      case 'auth/invalid-verification-id':
        errorMessage = 'Invalid verification session. Please request OTP again.';
        break;
      default:
        errorMessage = 'OTP verification failed: ' + error.message;
    }
    
    return {
      success: false,
      data: {
        message: errorMessage,
        error: error.code || 'unknown-error',
        phoneNumber: phoneNumber
      }
    };
  }
};

// Register user with backend
export const registerUser = async (phoneNumber, userData = {}) => {
  try {
    const { getApiUrl } = require('../API/config');
    const apiUrl = getApiUrl('/api/auth/firebase/register');
    
    console.log('🔥 registerUser: Calling API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobileNumber: phoneNumber,
        fullName: userData.fullName || 'User',
        ...userData
      }),
    });
    
    console.log('🔥 registerUser: Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ registerUser: Backend response:', result);
    return result;
  } catch (error) {
    console.error('🔥 Backend Registration Error:', error);
    return {
      success: false,
      data: {
        message: 'Network error occurred'
      }
    };
  }
};

// Login user
export const loginUser = async (phoneNumber, userData = {}) => {
  try {
    const { getApiUrl } = require('../API/config');
    const apiUrl = getApiUrl('/api/auth/firebase/login');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobileNumber: phoneNumber,
        ...userData
      }),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('🔥 Backend Login Error:', error);
    return {
      success: false,
      data: {
        message: 'Network error occurred'
      }
    };
  }
};

// Resend OTP
export const resendOTP = async (phoneNumber) => {
  try {
    console.log('🔥 resendOTP: Starting OTP resend process...');
    console.log('📱 resendOTP: Phone number:', phoneNumber);
    
    // Format phone number properly
    const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    console.log('📱 resendOTP: Formatted phone number:', formattedPhoneNumber);
    
    // Simple Firebase resend OTP
    console.log('🔥 resendOTP: Calling Firebase signInWithPhoneNumber...');
    const confirmation = await firebaseAuth.signInWithPhoneNumber(formattedPhoneNumber);
    console.log('✅ resendOTP: Firebase OTP resent successfully!');
    console.log('🆔 resendOTP: Verification ID:', confirmation.verificationId);
    
    return {
      success: true,
      data: {
        message: 'OTP resent successfully',
        verificationId: confirmation.verificationId,
        phoneNumber: formattedPhoneNumber
      }
    };
  } catch (error) {
    console.error('🔥 Firebase Auth Error (resendOTP):', error);
    console.error('🔥 resendOTP: Error code:', error.code);
    console.error('🔥 resendOTP: Error message:', error.message);
    
    return {
      success: false,
      data: {
        message: 'OTP resend failed: ' + error.message,
        error: error.code || 'unknown-error',
        phoneNumber: phoneNumber
      }
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  return firebaseAuth.currentUser;
};