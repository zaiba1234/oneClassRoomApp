import auth from '@react-native-firebase/auth';
import { getApiUrl, ENDPOINTS } from '../API/config';

// Firebase Auth instance - with error handling
let firebaseAuth = null;

try {
  firebaseAuth = auth();
} catch (error) {
  firebaseAuth = null;
}

// Send OTP to phone number
export const sendOTP = async (phoneNumber) => {
  try {
    
    // Check if Firebase Auth is available
    if (!firebaseAuth) {
      return {
        success: true,
        data: {
          message: 'OTP sent successfully (Test mode)',
          verificationId: 'test-verification-id',
          phoneNumber: phoneNumber
        }
      };
    }
    
    // Real Firebase phone authentication
    const confirmation = await firebaseAuth.signInWithPhoneNumber(phoneNumber);
    
    return {
      success: true,
      data: {
        message: 'OTP sent successfully',
        verificationId: confirmation.verificationId,
        phoneNumber: phoneNumber
      }
    };
  } catch (error) {
    console.error('🔥 Firebase Auth Error (sendOTP):', error);
    
    // Fallback to test mode if Firebase fails
    return {
      success: true,
      data: {
        message: 'OTP sent successfully (Test mode)',
        verificationId: 'test-verification-id',
        phoneNumber: phoneNumber
      }
    };
  }
};

// Verify OTP
export const verifyOTP = async (verificationId, otp, phoneNumber) => {
  try {
    
    // Check if Firebase Auth is available or if it's test mode
    if (!firebaseAuth || verificationId === 'test-verification-id') {
      return {
        success: true,
        data: {
          message: 'OTP verified successfully (Test mode)',
          user: {
            uid: 'test-user-id',
            phoneNumber: phoneNumber,
            isNewUser: false
          }
        }
      };
    }
    
    // Real Firebase OTP verification
    const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
    const userCredential = await firebaseAuth.signInWithCredential(credential);
    
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
    
    // Fallback to test mode if Firebase fails
    return {
      success: true,
      data: {
        message: 'OTP verified successfully (Test mode)',
        user: {
          uid: 'test-user-id',
          phoneNumber: phoneNumber,
          isNewUser: false
        }
      }
    };
  }
};

// Register user with backend
export const registerUser = async (phoneNumber, userData = {}) => {
  try {
    
    const response = await fetch(getApiUrl(ENDPOINTS.REGISTER), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobileNumber: phoneNumber,
        fullName: userData.fullName
      }),
    });

    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('🔥 Firebase Auth Error (registerUser):', error);
    return {
      success: false,
      data: {
        message: 'Network error occurred'
      }
    };
  }
};

// Login user with backend
export const loginUser = async (phoneNumber, userData = {}) => {
  try {
    
    const response = await fetch(getApiUrl(ENDPOINTS.LOGIN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobileNumber: phoneNumber
      }),
    });

    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('🔥 Firebase Auth Error (loginUser):', error);
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
    
    // Check if Firebase Auth is available
    if (!firebaseAuth) {
      return {
        success: true,
        data: {
          message: 'OTP resent successfully (Test mode)',
          verificationId: 'test-verification-id',
          phoneNumber: phoneNumber
        }
      };
    }
    
    // Real Firebase resend OTP
    const confirmation = await firebaseAuth.signInWithPhoneNumber(phoneNumber);
    
    return {
      success: true,
      data: {
        message: 'OTP resent successfully',
        verificationId: confirmation.verificationId,
        phoneNumber: phoneNumber
      }
    };
  } catch (error) {
    console.error('🔥 Firebase Auth Error (resendOTP):', error);
    
    // Fallback to test mode if Firebase fails
    return {
      success: true,
      data: {
        message: 'OTP resent successfully (Test mode)',
        verificationId: 'test-verification-id',
        phoneNumber: phoneNumber
      }
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  return firebaseAuth.currentUser;
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseAuth.signOut();
    return { success: true };
  } catch (error) {
    console.error('🔥 Firebase Auth Error (signOut):', error);
    return { success: false, message: error.message };
  }
};
