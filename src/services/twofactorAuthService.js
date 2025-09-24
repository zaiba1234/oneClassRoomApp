import { getApiUrl } from '../API/config';

// 2Factor Authentication Service
class TwoFactorAuthService {
  constructor() {
    this.baseUrl = '/api/2factor';
  }

  // Show custom alert for 2Factor errors
  showCustomAlert = (title, message, type = 'error') => {
    if (global.customAlertRef && global.customAlertRef.current) {
      global.customAlertRef.current.show({
        title,
        message,
        type,
        showCancel: false,
        confirmText: 'OK'
      });
    } else {
      console.error('Custom alert not available:', { title, message, type });
    }
  };

  // Set custom alert reference (similar to Firebase auth service)
  setCustomAlertRef = (ref) => {
    global.customAlertRef = ref;
  };

  // Register user with 2Factor
  async register(fullName, mobileNumber) {
    try {
      console.log('📝 [2FACTOR AUTH] Registering user:', { fullName, mobileNumber });
      
      const response = await fetch(getApiUrl(`${this.baseUrl}/register`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          mobileNumber
        }),
      });

      const result = await response.json();
      console.log('📝 [2FACTOR AUTH] Register response:', result);

      if (result.success) {
        return {
          success: true,
          data: {
            message: result.message,
            sessionId: result.data.sessionId,
            phoneNumber: result.data.phoneNumber,
            userId: result.data.userId
          }
        };
      } else {
        this.showCustomAlert('Registration Failed', result.message);
        return {
          success: false,
          data: {
            message: result.message,
            error: result.data?.error
          }
        };
      }
    } catch (error) {
      console.error('❌ [2FACTOR AUTH] Register error:', error);
      this.showCustomAlert('Network Error', 'Failed to register. Please check your internet connection.');
      return {
        success: false,
        data: {
          message: 'Network error occurred',
          error: error.message
        }
      };
    }
  }

  // Login user with 2Factor
  async login(mobileNumber) {
    try {
      console.log('🔐 [2FACTOR AUTH] Logging in user:', mobileNumber);
      
      const url = getApiUrl(`${this.baseUrl}/login`);
      console.log('🌐 [2FACTOR AUTH] Request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber
        }),
      });

      console.log('📡 [2FACTOR AUTH] Response status:', response.status);
      console.log('📡 [2FACTOR AUTH] Response headers:', response.headers);
      
      const responseText = await response.text();
      console.log('📡 [2FACTOR AUTH] Raw response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ [2FACTOR AUTH] JSON Parse Error:', parseError);
        console.error('❌ [2FACTOR AUTH] Response was not JSON:', responseText);
        throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 100)}...`);
      }
      
      console.log('🔐 [2FACTOR AUTH] Login response:', result);

      if (result.success) {
        return {
          success: true,
          data: {
            message: result.message,
            sessionId: result.data.sessionId,
            phoneNumber: result.data.phoneNumber
          }
        };
      } else {
        this.showCustomAlert('Login Failed', result.message);
        return {
          success: false,
          data: {
            message: result.message,
            error: result.data?.error
          }
        };
      }
    } catch (error) {
      console.error('❌ [2FACTOR AUTH] Login error:', error);
      this.showCustomAlert('Network Error', 'Failed to login. Please check your internet connection.');
      return {
        success: false,
        data: {
          message: 'Network error occurred',
          error: error.message
        }
      };
    }
  }

  // Verify OTP with 2Factor
  async verifyOTP(mobileNumber, otp, sessionId) {
    try {
      console.log('✅ [2FACTOR AUTH] Verifying OTP:', { mobileNumber, otp, sessionId });
      
      const response = await fetch(getApiUrl(`${this.baseUrl}/verify-otp`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber,
          otp,
          sessionId
        }),
      });

      const result = await response.json();
      console.log('✅ [2FACTOR AUTH] Verify OTP response:', result);

      if (result.success) {
        return {
          success: true,
          data: {
            message: result.message,
            token: result.data.token,
            user: result.data.user
          }
        };
      } else {
        this.showCustomAlert('Verification Failed', result.message);
        return {
          success: false,
          data: {
            message: result.message,
            error: result.data?.error
          }
        };
      }
    } catch (error) {
      console.error('❌ [2FACTOR AUTH] Verify OTP error:', error);
      this.showCustomAlert('Network Error', 'Failed to verify OTP. Please check your internet connection.');
      return {
        success: false,
        data: {
          message: 'Network error occurred',
          error: error.message
        }
      };
    }
  }

  // Resend OTP with 2Factor
  async resendOTP(mobileNumber) {
    try {
      console.log('🔄 [2FACTOR AUTH] Resending OTP:', mobileNumber);
      
      const response = await fetch(getApiUrl(`${this.baseUrl}/resend-otp`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber
        }),
      });

      const result = await response.json();
      console.log('🔄 [2FACTOR AUTH] Resend OTP response:', result);

      if (result.success) {
        return {
          success: true,
          data: {
            message: result.message,
            sessionId: result.data.sessionId,
            phoneNumber: result.data.phoneNumber
          }
        };
      } else {
        this.showCustomAlert('Resend Failed', result.message);
        return {
          success: false,
          data: {
            message: result.message,
            error: result.data?.error
          }
        };
      }
    } catch (error) {
      console.error('❌ [2FACTOR AUTH] Resend OTP error:', error);
      this.showCustomAlert('Network Error', 'Failed to resend OTP. Please check your internet connection.');
      return {
        success: false,
        data: {
          message: 'Network error occurred',
          error: error.message
        }
      };
    }
  }

  // Check 2Factor service status
  async checkStatus() {
    try {
      console.log('🔍 [2FACTOR AUTH] Checking service status...');
      
      const response = await fetch(getApiUrl(`${this.baseUrl}/status`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('🔍 [2FACTOR AUTH] Status response:', result);

      return result;
    } catch (error) {
      console.error('❌ [2FACTOR AUTH] Status check error:', error);
      return {
        success: false,
        data: {
          message: 'Service status check failed',
          error: error.message
        }
      };
    }
  }
}

// Export singleton instance
export default new TwoFactorAuthService();
