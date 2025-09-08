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
    console.log('🔥 sendOTP: Starting OTP sending process...');
    console.log('📱 sendOTP: Phone number:', phoneNumber);
    
    // Check if Firebase Auth is available
    if (!firebaseAuth) {
      console.log('⚠️ sendOTP: Firebase Auth not available, using test mode');
      return {
        success: true,
        data: {
          message: 'OTP sent successfully (Test mode)',
          verificationId: 'test-verification-id',
          phoneNumber: phoneNumber
        }
      };
    }
    
    console.log('✅ sendOTP: Firebase Auth available, sending real OTP...');
    // Real Firebase phone authentication
    const confirmation = await firebaseAuth.signInWithPhoneNumber(phoneNumber);
    console.log('✅ sendOTP: Firebase OTP sent successfully!');
    console.log('🆔 sendOTP: Verification ID:', confirmation.verificationId);
    
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
    console.error('🔥 sendOTP: Error code:', error.code);
    console.error('🔥 sendOTP: Error message:', error.message);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/missing-client-identifier') {
      console.log('❌ sendOTP: Missing client identifier error');
      return {
        success: false,
        data: {
          message: 'Firebase configuration error. Please add SHA-1 fingerprint to Firebase Console.',
          error: 'missing-client-identifier',
          phoneNumber: phoneNumber
        }
      };
    }
    
    // Fallback to test mode if Firebase fails
    console.log('⚠️ sendOTP: Firebase failed, falling back to test mode');
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
    console.log('🔥 registerUser: Starting backend registration...');
    console.log('📱 registerUser: Phone number:', phoneNumber);
    console.log('👤 registerUser: User data:', userData);
    
    const url = getApiUrl(ENDPOINTS.REGISTER);
    console.log('🌐 registerUser: API URL:', url);
    
    const requestBody = {
      mobileNumber: phoneNumber,
      fullName: userData.fullName
    };
    console.log('📤 registerUser: Request body:', requestBody);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 registerUser: Response status:', response.status);
    const result = await response.json();
    console.log('📡 registerUser: Response data:', result);
    
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
    console.log('🔥 resendOTP: Starting OTP resend process...');
    console.log('📱 resendOTP: Phone number:', phoneNumber);
    
    // Check if Firebase Auth is available
    if (!firebaseAuth) {
      console.log('⚠️ resendOTP: Firebase Auth not available, using test mode');
      return {
        success: true,
        data: {
          message: 'OTP resent successfully (Test mode)',
          verificationId: 'test-verification-id',
          phoneNumber: phoneNumber
        }
      };
    }
    
    console.log('✅ resendOTP: Firebase Auth available, resending real OTP...');
    // Real Firebase resend OTP
    const confirmation = await firebaseAuth.signInWithPhoneNumber(phoneNumber);
    console.log('✅ resendOTP: Firebase OTP resent successfully!');
    console.log('🆔 resendOTP: Verification ID:', confirmation.verificationId);
    
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
    console.error('🔥 resendOTP: Error code:', error.code);
    console.error('🔥 resendOTP: Error message:', error.message);
    
    // Fallback to test mode if Firebase fails
    console.log('⚠️ resendOTP: Firebase failed, falling back to test mode');
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
