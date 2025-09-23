import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState, useEffect } from 'react';
import { authAPI } from '../API/authAPI';
import { profileAPI } from '../API/profileAPI';
import { useAppDispatch } from '../Redux/hooks';
import { setUserData, saveUserToStorage, setProfileData } from '../Redux/userSlice';
import store from '../Redux/store';
import { getApiUrl } from '../API/config';
import { getFCMTokenService } from '../services/fcmTokenService';
import notificationService from '../services/notificationService';
import { setCustomAlertRef } from '../services/firebaseAuthService';
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomAlertManager from '../Component/CustomAlertManager';

const tickmarkIcon = require('../assests/images/accountsecurity.png');
const clockIcon = require('../assests/images/Clock.png');
const { width, height } = Dimensions.get('window');

const VerificationScreen = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(45);
  const otpRefs = useRef([]);
  const customAlertRef = useRef(null);

  const mobileNumber = route.params?.mobileNumber || '+91 ******333';
  const fullName = route.params?.fullName || '';
  const email = route.params?.email || '';
  const isEmailVerification = route.params?.isEmailVerification || false;
  const verificationId = route.params?.verificationId || null;
  const isFromLogin = route.params?.isFromLogin || false;
  const isFromRegister = route.params?.isFromRegister || false;

  // Set custom alert reference for Firebase Auth service
  useEffect(() => {
    setCustomAlertRef(customAlertRef);
  }, []);

  useEffect(() => {
    // Component mounted
  }, []);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];

    if (value === '' && newOtp[index] !== '') {
      newOtp[index] = '';
      setOtp(newOtp);
      if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (value && /^\d$/.test(value)) {
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (index, e) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '') {
      if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleResendOTP = async () => {
    if (isResending || resendTimer > 0) {
      return;
    }

    if (isEmailVerification) {
      if (!route.params?.token) {
        customAlertRef.current?.show({
          title: 'Error',
          message: 'Authentication token not found. Please try again.',
          type: 'error',
          showCancel: false,
          confirmText: 'OK'
        });
        return;
      }

      setIsResending(true);

      try {
        const response = await fetch(getApiUrl('/api/auth/send-emailotp'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${route.params.token}`,
          },
          body: JSON.stringify({
            email: email
          })
        });
console.log('🔔 [handleResendOTP] Response:', response);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            customAlertRef.current?.show({
              title: 'Success',
              message: 'OTP resent successfully!',
              type: 'success',
              showCancel: false,
              confirmText: 'OK'
            });
            setResendTimer(45);
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
          } else {
            const errorMessage = result.message || 'Failed to resend OTP';
            customAlertRef.current?.show({
              title: 'Error',
              message: errorMessage,
              type: 'error',
              showCancel: false,
              confirmText: 'OK'
            });
          }
        } else {
          customAlertRef.current?.show({
            title: 'Error',
            message: `Failed to resend OTP. Status: ${response.status}`,
            type: 'error',
            showCancel: false,
            confirmText: 'OK'
          });
        }
      } catch (error) {
        customAlertRef.current?.show({
          title: 'Error',
          message: 'Failed to resend OTP. Please try again.',
          type: 'error',
          showCancel: false,
          confirmText: 'OK'
        });
      } finally {
        setIsResending(false);
      }
    } else {
      setIsResending(true);

      try {
        console.log('🔄 [VerificationScreen] Resending OTP for:', mobileNumber);
        const result = await authAPI.resendOTP(mobileNumber);
        console.log('🔄 [VerificationScreen] Resend OTP Response:', JSON.stringify(result, null, 2));

        if (result.success) {
          console.log('✅ [VerificationScreen] OTP resent successfully');
          customAlertRef.current?.show({
            title: 'Success',
            message: 'OTP resent successfully!',
            type: 'success',
            showCancel: false,
            confirmText: 'OK'
          });
          setResendTimer(45);
          setOtp(['', '', '', '', '', '']);
          otpRefs.current[0]?.focus();
        } else {
          const errorMessage = result.data?.message || result.message || 'Failed to resend OTP';
          const fullErrorDetails = `Resend OTP Error: ${errorMessage}\n\nFull Response: ${JSON.stringify(result, null, 2)}`;
          
          customAlertRef.current?.show({
            title: 'Resend OTP Failed - Debug Info',
            message: fullErrorDetails,
            type: 'error',
            showCancel: false,
            confirmText: 'OK'
          });
        }
      } catch (error) {
        console.error('💥 [VerificationScreen] Resend OTP error:', error);
        const errorDetails = `Network/API Error: ${error.message}\n\nStack: ${error.stack}\n\nFull Error: ${JSON.stringify(error, null, 2)}`;
        
        customAlertRef.current?.show({
          title: 'Resend OTP Error - Debug Info',
          message: errorDetails,
          type: 'error',
          showCancel: false,
          confirmText: 'OK'
        });
      } finally {
        setIsResending(false);
      }
    }
  };

  const handleVerifyEmailOTP = async () => {
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      return;
    }

    if (!route.params?.token) {
      customAlertRef.current?.show({
        title: 'Error',
        message: 'Authentication token not found. Please try again.',
        type: 'error',
        showCancel: false,
        confirmText: 'OK'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/auth/verify-emailOtp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${route.params.token}`,
        },
        body: JSON.stringify({
          email: email,
          otp: otpString
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response from server. Please try again.');
      }

      if (result.success) {
        dispatch(setProfileData({
          email: email
        }));

        customAlertRef.current?.show({
          title: 'Success',
          message: 'Email verified successfully!',
          type: 'success',
          showCancel: false,
          confirmText: 'OK',
          onConfirm: () => {
            navigation.navigate('PersonalInfo');
          }
        });
      } else {
        const errorMessage = result.message || 'Failed to verify email OTP';
        customAlertRef.current?.show({
          title: 'Error',
          message: errorMessage,
          type: 'error',
          showCancel: false,
          confirmText: 'OK'
        });
      }
    } catch (error) {
      customAlertRef.current?.show({
        title: 'Error',
        message: 'Failed to verify email OTP. Please try again.',
        type: 'error',
        showCancel: false,
        confirmText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      customAlertRef.current?.show({
        title: 'Error',
        message: 'Please enter a valid 6-digit OTP',
        type: 'error',
        showCancel: false,
        confirmText: 'OK'
      });
      return;
    }

    setIsLoading(true);
    console.log('🔐 [VerificationScreen] Starting OTP verification:', { 
      mobileNumber, 
      otpString, 
      verificationId, 
      isFromRegister, 
      isFromLogin 
    });

    try {
      let result;
      if (isFromRegister) {
        console.log('📝 [VerificationScreen] Verifying OTP for registration flow');
        result = await authAPI.verifyOTP(mobileNumber, otpString, verificationId);
      } else if (isFromLogin) {
        console.log('🔑 [VerificationScreen] Verifying OTP for login flow');
        result = await authAPI.verifyOTP(mobileNumber, otpString, verificationId);
      } else {
        console.log('🔄 [VerificationScreen] Verifying OTP for general flow');
        result = await authAPI.verifyOTP(mobileNumber, otpString, verificationId);
      }

      console.log('🔐 [VerificationScreen] OTP Verification Response:', JSON.stringify(result, null, 2));

      if (result.success) {
        console.log('✅ [VerificationScreen] OTP verification successful');
        const token = result.data?.data?.token || result.data?.token;
        console.log('🔑 [VerificationScreen] Token received:', token ? 'Yes' : 'No');

        if (token) {
          try {
            console.log('👤 [VerificationScreen] Fetching user profile...');
            const profileResult = await profileAPI.getUserProfile(token);
            console.log('👤 [VerificationScreen] Profile API Response:', JSON.stringify(profileResult, null, 2));

            if (profileResult.success && profileResult.data.success) {
              const userData = profileResult.data.data;
              const isNewUser = isFromRegister || !userData.address || !userData.email;
              console.log('👤 [VerificationScreen] User data loaded, isNewUser:', isNewUser);

              const completeUserData = {
                _id: userData._id,
                userId: userData.userId,
                fullName: userData.fullName,
                mobileNumber: userData.mobileNumber,
                profileImageUrl: userData.profileImageUrl,
                address: userData.address,
                email: userData.email,
                token: token,
                isNewUser: isNewUser
              };

              dispatch(setUserData(completeUserData));
              dispatch(saveUserToStorage(completeUserData));

              try {
                console.log('🔔 [VerificationScreen] Sending FCM token to backend...');
                const fcmService = getFCMTokenService(store);
                const fcmSent = await fcmService.sendStoredTokenToBackend();
                console.log('🔔 [VerificationScreen] FCM token sent:', fcmSent);
                if (!fcmSent) {
                  customAlertRef.current?.show({
                  title: 'Warning',
                  message: 'Failed to register for notifications',
                  type: 'warning',
                  showCancel: false,
                  confirmText: 'OK'
                });
                }
              } catch (fcmError) {
                console.error('🔔 [VerificationScreen] FCM error:', fcmError);
                customAlertRef.current?.show({
                  title: 'Warning',
                  message: 'Failed to register for notifications',
                  type: 'warning',
                  showCancel: false,
                  confirmText: 'OK'
                });
              }
            } else {
              console.log('⚠️ [VerificationScreen] Profile fetch failed, using fallback data');
              const fallbackUserData = {
                mobileNumber: mobileNumber,
                token: token,
                isNewUser: isFromRegister
              };

              if (fullName) {
                fallbackUserData.fullName = fullName;
              }

              dispatch(setUserData(fallbackUserData));
              dispatch(saveUserToStorage(fallbackUserData));

              try {
                console.log('🔔 [VerificationScreen] Sending FCM token to backend (fallback)...');
                const fcmService = getFCMTokenService(store);
                const fcmSent = await fcmService.sendStoredTokenToBackend();
                console.log('🔔 [VerificationScreen] FCM token sent (fallback):', fcmSent);
                if (!fcmSent) {
                  customAlertRef.current?.show({
                  title: 'Warning',
                  message: 'Failed to register for notifications',
                  type: 'warning',
                  showCancel: false,
                  confirmText: 'OK'
                });
                }
              } catch (fcmError) {
                console.error('🔔 [VerificationScreen] FCM error (fallback):', fcmError);
                customAlertRef.current?.show({
                  title: 'Warning',
                  message: 'Failed to register for notifications',
                  type: 'warning',
                  showCancel: false,
                  confirmText: 'OK'
                });
              }
            }
          } catch (profileError) {
            console.error('💥 [VerificationScreen] Profile fetch error:', profileError);
            const fallbackUserData = {
              mobileNumber: mobileNumber,
              token: token,
              isNewUser: isFromRegister
            };

            if (fullName) {
              fallbackUserData.fullName = fullName;
            }

            dispatch(setUserData(fallbackUserData));
            dispatch(saveUserToStorage(fallbackUserData));

            try {
              console.log('🔔 [VerificationScreen] Sending FCM token to backend (error fallback)...');
              const fcmService = getFCMTokenService(store);
              const fcmSent = await fcmService.sendStoredTokenToBackend();
              console.log('🔔 [VerificationScreen] FCM token sent (error fallback):', fcmSent);
              if (!fcmSent) {
                customAlertRef.current?.show({
                  title: 'Warning',
                  message: 'Failed to register for notifications',
                  type: 'warning',
                  showCancel: false,
                  confirmText: 'OK'
                });
              }
            } catch (fcmError) {
              console.error('🔔 [VerificationScreen] FCM error (error fallback):', fcmError);
              customAlertRef.current?.show({
                  title: 'Warning',
                  message: 'Failed to register for notifications',
                  type: 'warning',
                  showCancel: false,
                  confirmText: 'OK'
                });
            }
          }
        } else {
          console.log('❌ [VerificationScreen] No token received in response');
          const fallbackUserData = {
            isNewUser: isFromRegister
          };

          if (fullName) {
            fallbackUserData.fullName = fullName;
          }
          if (mobileNumber) {
            fallbackUserData.mobileNumber = mobileNumber;
          }

          if (Object.keys(fallbackUserData).length > 0) {
            dispatch(setUserData(fallbackUserData));
            dispatch(saveUserToStorage(fallbackUserData));
          }
        }

        const userState = store.getState().user;
        const isNewUser = userState.isNewUser;
        console.log('🏠 [VerificationScreen] Navigation decision - isNewUser:', isNewUser);

        if (isNewUser) {
          console.log('🏠 [VerificationScreen] Navigating to Category screen');
          navigation.navigate('Category');
        } else {
          console.log('🏠 [VerificationScreen] Navigating to Home screen');
          navigation.navigate('Home');
        }
      } else {
        console.log('❌ [VerificationScreen] OTP verification failed:', result);
        if (result.message?.includes('not registered') ||
            result.message?.includes('Mobile number not registered') ||
            result.message?.includes('not verified') ||
            result.message?.includes('User not found')) {
          console.log('🔄 [VerificationScreen] User not found, navigating to register');
          navigation.navigate('Register', { mobileNumber: mobileNumber });
        } else {
          const errorMessage = result.message || 'OTP verification failed. Please try again.';
          const fullErrorDetails = `OTP Verification Error: ${errorMessage}\n\nFull Response: ${JSON.stringify(result, null, 2)}`;
          
          customAlertRef.current?.show({
            title: 'OTP Verification Failed - Debug Info',
            message: fullErrorDetails,
            type: 'error',
            showCancel: false,
            confirmText: 'OK'
          });
        }
      }
    } catch (error) {
      console.error('💥 [VerificationScreen] OTP verification error:', error);
      const errorDetails = `Network/API Error: ${error.message}\n\nStack: ${error.stack}\n\nFull Error: ${JSON.stringify(error, null, 2)}`;
      
      customAlertRef.current?.show({
        title: 'OTP Verification Error - Debug Info',
        message: errorDetails,
        type: 'error',
        showCancel: false,
        confirmText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevron-back" size={24} color="#FF8800" />
      </TouchableOpacity>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Image
                source={tickmarkIcon}
                style={styles.tickmarkImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>
              {isEmailVerification ? 'Verify Email OTP' : 'Verify OTP'}
            </Text>
            <Text style={styles.subtitle}>
              Enter the OTP sent to {isEmailVerification ? email : mobileNumber}
            </Text>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                    index === 5 && digit && styles.otpInputActive
                  ]}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  onKeyPress={(e) => handleKeyPress(index, e)}
                  ref={(ref) => (otpRefs.current[index] = ref)}
                />
              ))}
            </View>
            <View style={styles.resendContainer}>
              <View style={styles.resendTextContainer}>
                <Text style={styles.resendText}>
                  Didn't you receive the OTP?
                </Text>
                {resendTimer > 0 ? (
                  <Text style={styles.resendLinkDisabled}>Resend OTP</Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOTP} disabled={isResending}>
                    <Text style={styles.resendLink}>
                      {isResending ? 'Resending...' : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {resendTimer > 0 && (
                <View style={styles.timerContainer}>
                  <Icon name="time-outline" size={14} color="#FF8800" />
                  <Text style={styles.timerText}>
                    {Math.floor(resendTimer / 60).toString().padStart(2, '0')}:{(resendTimer % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <LinearGradient
          colors={['#FFB300','#FF9800']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <TouchableOpacity
            onPress={isEmailVerification ? handleVerifyEmailOTP : handleVerifyOTP}
            style={styles.buttonTouchable}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Verifying...' : (isEmailVerification ? 'Verify Email OTP' : 'Verify OTP')}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
      
      {/* Custom Alert Manager */}
      <CustomAlertManager ref={customAlertRef} />
    </View>
  );
};

export default VerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 100,
    paddingBottom: 20,
  },
  iconContainer: {
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickmarkImage: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 25,
  },
  otpInput: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    textAlignVertical: 'center',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8800',
    backgroundColor: '#F8F8F8',
    paddingVertical: 0,
    paddingHorizontal: 0,
    includeFontPadding: false,
  },
  otpInputFilled: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFB800',
  },
  otpInputActive: {
    backgroundColor: '#fff',
    borderColor: '#FF8800',
    borderWidth: 2,
  },
  resendContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resendLink: {
    color: '#FF8800',
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  resendLinkDisabled: {
    color: '#999',
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 12,
    color: '#FF8800',
    fontWeight: '600',
    marginLeft: 4,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 80 : 60,
    left: 40,
    right: 40,
    zIndex: 10,
  },
  button: {
    width: '100%',
    borderRadius: 15,
    paddingVertical: 16,
  },
  buttonTouchable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});