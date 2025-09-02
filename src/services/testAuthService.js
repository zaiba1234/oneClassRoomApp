import { getApiUrl, ENDPOINTS } from '../API/config';

// Test Authentication Service (No Firebase required)
// This will work immediately without any Firebase setup

// Send OTP (Test mode)
export const sendOTP = async (phoneNumber) => {
  try {
    console.log('🧪 Test Auth: Sending OTP to:', phoneNumber);
    
    // Simulate OTP sending
    return {
      success: true,
      data: {
        message: 'OTP sent successfully (Test mode)',
        verificationId: 'test-verification-id',
        phoneNumber: phoneNumber
      }
    };
  } catch (error) {
    console.error('🧪 Test Auth Error (sendOTP):', error);
    return {
      success: false,
      data: {
        message: 'Failed to send OTP'
      }
    };
  }
};

// Verify OTP (Test mode)
export const verifyOTP = async (verificationId, otp, phoneNumber) => {
  try {
    console.log('🧪 Test Auth: Verifying OTP:', otp, 'for:', phoneNumber);
    
    // Accept any OTP in test mode
    // For testing, we'll assume all users are new users (for registration flow)
    return {
      success: true,
      data: {
        message: 'OTP verified successfully (Test mode)',
        user: {
          uid: 'test-user-id',
          phoneNumber: phoneNumber,
          isNewUser: true  // Always true for test mode to trigger registration
        }
      }
    };
  } catch (error) {
    console.error('🧪 Test Auth Error (verifyOTP):', error);
    return {
      success: false,
      data: {
        message: 'Invalid OTP'
      }
    };
  }
};

// Register user with backend
export const registerUser = async (phoneNumber, userData = {}) => {
  try {
    console.log('🧪 Test Auth: Registering user:', phoneNumber);
    
    const response = await fetch(getApiUrl(ENDPOINTS.REGISTER), {
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
    console.log('🧪 Test Auth: Register response:', result);
    
    return result;
  } catch (error) {
    console.error('🧪 Test Auth Error (registerUser):', error);
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
    console.log('🧪 Test Auth: Logging in user:', phoneNumber);
    
    const response = await fetch(getApiUrl(ENDPOINTS.LOGIN), {
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
    console.log('🧪 Test Auth: Login response:', result);
    
    return result;
  } catch (error) {
    console.error('🧪 Test Auth Error (loginUser):', error);
    return {
      success: false,
      data: {
        message: 'Network error occurred'
      }
    };
  }
};

// Resend OTP (Test mode)
export const resendOTP = async (phoneNumber) => {
  try {
    console.log('🧪 Test Auth: Resending OTP to:', phoneNumber);
    
    return {
      success: true,
      data: {
        message: 'OTP resent successfully (Test mode)',
        verificationId: 'test-verification-id',
        phoneNumber: phoneNumber
      }
    };
  } catch (error) {
    console.error('🧪 Test Auth Error (resendOTP):', error);
    return {
      success: false,
      data: {
        message: 'Failed to resend OTP'
      }
    };
  }
};

// Get current user (Test mode)
export const getCurrentUser = () => {
  return {
    uid: 'test-user-id',
    phoneNumber: '+911234567890'
  };
};

// Sign out (Test mode)
export const signOut = async () => {
  try {
    console.log('🧪 Test Auth: Signing out');
    return { success: true };
  } catch (error) {
    console.error('🧪 Test Auth Error (signOut):', error);
    return { success: false, message: error.message };
  }
};
