

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
import {
  Alert,
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

  // Suppress console errors to prevent red error warnings in UI
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Only log to console, don't show red error warnings in UI
      originalConsoleError(...args);
    };

    // Cleanup function to restore original console.error
    return () => {
      console.error = originalConsoleError;
    };
  }, []);
  
  const mobileNumber = route.params?.mobileNumber || '+91 ******333';
  const fullName = route.params?.fullName || '';
  const email = route.params?.email || '';
  const isEmailVerification = route.params?.isEmailVerification || false;
  const verificationId = route.params?.verificationId || null;
  const isFromLogin = route.params?.isFromLogin || false;
  const isFromRegister = route.params?.isFromRegister || false;
  
  const [currentVerificationId, setCurrentVerificationId] = useState(verificationId);

  // Debug and initialize verification
  useEffect(() => {
    console.log('🔥 VerificationScreen: Component mounted');
    console.log('📱 VerificationScreen: Mobile number:', mobileNumber);
    console.log('👤 VerificationScreen: Full name:', fullName);
    console.log('🆔 VerificationScreen: Verification ID:', verificationId);
    console.log('📝 VerificationScreen: Is from register:', isFromRegister);
    console.log('📝 VerificationScreen: Is from login:', isFromLogin);
    console.log('📧 VerificationScreen: Is email verification:', isEmailVerification);
    
    // Set current verification ID if not already set
    if (verificationId && !currentVerificationId) {
      setCurrentVerificationId(verificationId);
      console.log('🆔 VerificationScreen: Set verification ID from route params');
    }
    
    // Debug: Log which flow we're in
    if (isEmailVerification) {
      console.log('📧 VerificationScreen: Email verification flow');
    } else if (isFromRegister) {
      console.log('📝 VerificationScreen: Registration flow');
    } else if (isFromLogin) {
      console.log('🔐 VerificationScreen: Login flow');
    } else {
      console.log('❓ VerificationScreen: Unknown flow');
    }
  }, [verificationId, currentVerificationId]);

  // Timer effect for resend OTP
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
    
    console.log(`🔢 OTP Input: Index ${index}, Value: "${value}", Current OTP: [${otp.join(', ')}]`);
    
    // If clearing the field (value is empty)
    if (value === '' && newOtp[index] !== '') {
      newOtp[index] = '';
      setOtp(newOtp);
      console.log(`🔢 OTP Cleared: Index ${index}, New OTP: [${newOtp.join(', ')}]`);
      // Move cursor to previous field
      if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
      return;
    }
    
    // If entering a digit
    if (value && /^\d$/.test(value)) {
      newOtp[index] = value;
      setOtp(newOtp);
      console.log(`🔢 OTP Entered: Index ${index}, Value: ${value}, New OTP: [${newOtp.join(', ')}]`);
      
      // Move to next field if not the last one
      if (index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    } else if (value && !/^\d$/.test(value)) {
      console.log(`❌ Invalid OTP Input: "${value}" is not a digit`);
    }
  };

  const handleKeyPress = (index, e) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '') {
      if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleResendOTP = async () => {
    if (isResending || resendTimer > 0) {
      console.log('⚠️ handleResendOTP: Resend blocked - timer active or already resending');
      return;
    }

    console.log('🔥 handleResendOTP: Starting OTP resend process...');
    console.log('📱 handleResendOTP: Mobile number:', mobileNumber);
    console.log('📧 handleResendOTP: Is email verification:', isEmailVerification);
    
    // For email verification, we need to resend email OTP, not mobile OTP
    if (isEmailVerification) {
      
      if (!route.params?.token) {
        Alert.alert('Error', 'Authentication token not found. Please try again.');
        return;
      }
      
      setIsResending(true);
      
      try {
        // Call send-emailotp API again with correct endpoint and headers
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

        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            Alert.alert('Success', 'OTP resent successfully!');
            // Reset timer to 45 seconds
            setResendTimer(45);
            // Clear OTP fields
            setOtp(['', '', '', '', '', '']);
            // Focus on first OTP field
            otpRefs.current[0]?.focus();
          } else {
            Alert.alert('Error', result.message || 'Failed to resend OTP');
          }
        } else {
          const errorText = await response.text();
          Alert.alert('Error', `Failed to resend OTP. Status: ${response.status}`);
        }
      } catch (error) {
        console.error('💥 VerificationScreen: Email OTP resend error:', error);
        Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      } finally {
        setIsResending(false);
      }
    } else {
      // Mobile OTP resend using Firebase client-side (real OTP sending)
      console.log('📱 handleResendOTP: Mobile OTP resend flow using Firebase client-side');
      
      setIsResending(true);
      
      try {
        console.log('📡 handleResendOTP: Calling authAPI.resendOTP (Firebase client-side)...');
        const result = await authAPI.resendOTP(mobileNumber);
        console.log('📡 handleResendOTP: Firebase resend result:', result);
        
        if (result.success) {
          console.log('✅ handleResendOTP: OTP resent successfully via Firebase!');
          console.log('🆔 handleResendOTP: New verification ID:', result.data?.verificationId);
          
          // Update the verification ID for the new OTP
          if (result.data?.verificationId) {
            setCurrentVerificationId(result.data.verificationId);
            console.log('🆔 handleResendOTP: Updated verification ID stored');
          }
          
          Alert.alert('Success', 'OTP resent successfully! Check your phone for the new OTP.');
          // Reset timer to 45 seconds
          setResendTimer(45);
          // Clear OTP fields
          setOtp(['', '', '', '', '', '']);
          // Focus on first OTP field
          otpRefs.current[0]?.focus();
        } else {
          console.log('❌ handleResendOTP: Firebase OTP resend failed:', result.data?.message);
          Alert.alert('Error', result.data?.message || 'Failed to resend OTP');
        }
      } catch (error) {
        console.error('💥 VerificationScreen: Firebase resend OTP error:', error);
        Alert.alert('Error', 'Failed to resend OTP. Please try again.');
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
      Alert.alert('Error', 'Authentication token not found. Please try again.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Call verify-emailOtp API with correct endpoint and headers
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

      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('💥 VerificationScreen: JSON parse error:', parseError);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      if (result.success) {
        
        // Update Redux store with verified email
        dispatch(setProfileData({
          email: email
        }));
        
        Alert.alert(
          'Success', 
          'Email verified successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to PersonalInfoScreen
                navigation.navigate('PersonalInfo');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to verify email OTP');
      }
    } catch (error) {
      console.error('💥 VerificationScreen: Email OTP verification error:', error);
      Alert.alert('Error', 'Failed to verify email OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      console.log('❌ handleVerifyOTP: OTP length invalid:', otpString.length);
      Alert.alert('Error', 'Please enter complete 6-digit OTP');
      return;
    }

    if (!currentVerificationId) {
      console.log('❌ handleVerifyOTP: No verification ID available');
      Alert.alert('Error', 'Verification session expired. Please request OTP again.');
      return;
    }

    console.log('🔥 handleVerifyOTP: Starting OTP verification...');
    console.log('📱 handleVerifyOTP: Mobile number:', mobileNumber);
    console.log('🔢 handleVerifyOTP: OTP:', otpString);
    console.log('🆔 handleVerifyOTP: Verification ID:', currentVerificationId);
    console.log('📝 handleVerifyOTP: Is from register:', isFromRegister);
    console.log('📝 handleVerifyOTP: Is from login:', isFromLogin);

    setIsLoading(true);
    
    try {
      console.log('📡 handleVerifyOTP: Calling authAPI.verifyOTP...');
      const result = await authAPI.verifyOTP(mobileNumber, otpString, currentVerificationId);
      
      console.log('📡 handleVerifyOTP: Verification result:', result);
      
      if (result.success) {
        
        // Store token in Redux if available
        // Note: API response structure is result.data.data.token (nested)
        const token = result.data?.data?.token || result.data?.token;
        
        if (token) {
          
          // After storing token, fetch user profile
          try {
            
            const profileResult = await profileAPI.getUserProfile(token);
            
            if (profileResult.success && profileResult.data.success) {
              const userData = profileResult.data.data;
              
              // Store complete user data in Redux and save to storage
              
              // Check if this is a new user (first-time login after registration)
              const isNewUser = isFromRegister || !userData.address || !userData.email;
              
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
              
              // Save to storage
              dispatch(saveUserToStorage(completeUserData));
              
              // Send FCM token to backend after successful verification
              console.log('🔔 VerificationScreen: Sending FCM token to backend after verification...');
              try {
                const fcmService = getFCMTokenService(store);
                const fcmSent = await fcmService.sendStoredTokenToBackend();
                if (fcmSent) {
                  console.log('✅ VerificationScreen: FCM token sent to backend successfully');
                } else {
                  console.log('⚠️ VerificationScreen: Failed to send FCM token to backend');
                }
              } catch (fcmError) {
                console.error('💥 VerificationScreen: Error sending FCM token:', fcmError);
              }
              
            } else {
              
              // Fallback to route params if profile fetch fails
              const fallbackUserData = {
                mobileNumber: mobileNumber,
                token: token,
                isNewUser: isFromRegister // New users from registration flow
              };
              
              if (fullName) {
                fallbackUserData.fullName = fullName;
              }
              
              dispatch(setUserData(fallbackUserData));
              dispatch(saveUserToStorage(fallbackUserData));
              
              // Send FCM token to backend after successful verification (fallback case)
              console.log('🔔 VerificationScreen: Sending FCM token to backend after verification (fallback)...');
              try {
                const fcmService = getFCMTokenService(store);
                const fcmSent = await fcmService.sendStoredTokenToBackend();
                if (fcmSent) {
                  console.log('✅ VerificationScreen: FCM token sent to backend successfully (fallback)');
                } else {
                  console.log('⚠️ VerificationScreen: Failed to send FCM token to backend (fallback)');
                }
              } catch (fcmError) {
                console.error('💥 VerificationScreen: Error sending FCM token (fallback):', fcmError);
              }
            }
          } catch (profileError) {
            console.error('💥 VerificationScreen: Error fetching user profile:', profileError);
            
            // Fallback to route params if profile fetch fails
            const fallbackUserData = {
              mobileNumber: mobileNumber,
              token: token,
              isNewUser: isFromRegister // New users from registration flow
            };
            
            if (fullName) {
              fallbackUserData.fullName = fullName;
            }
            
            dispatch(setUserData(fallbackUserData));
            dispatch(saveUserToStorage(fallbackUserData));
            
            // Send FCM token to backend after successful verification (error fallback case)
            console.log('🔔 VerificationScreen: Sending FCM token to backend after verification (error fallback)...');
            try {
              const fcmService = getFCMTokenService(store);
              const fcmSent = await fcmService.sendStoredTokenToBackend();
              if (fcmSent) {
                console.log('✅ VerificationScreen: FCM token sent to backend successfully (error fallback)');
              } else {
                console.log('⚠️ VerificationScreen: Failed to send FCM token to backend (error fallback)');
              }
            } catch (fcmError) {
              console.error('💥 VerificationScreen: Error sending FCM token (error fallback):', fcmError);
            }
          }
        } else {
          
          // No token, use route params only
          const fallbackUserData = {
            isNewUser: isFromRegister // New users from registration flow
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
        
        // OTP verified successfully, navigate based on user status
        const userState = store.getState().user;
        const isNewUser = userState.isNewUser;
        
        
        if (isNewUser) {
          navigation.navigate('Category');
        } else {
          navigation.navigate('Home');
        }
      } else {
        console.log('❌ handleVerifyOTP: Verification failed:', result);
        
        // Check for specific error types
        const errorMessage = result.message || result.data?.message || 'Verification failed';
        
        if (errorMessage.includes('not registered') || 
            errorMessage.includes('Mobile number not registered') ||
            errorMessage.includes('not verified') ||
            errorMessage.includes('User not found')) {
        
          // Direct navigation to Register screen without alert
          navigation.navigate('Register', { mobileNumber: mobileNumber });
         
        } else if (errorMessage.includes('invalid-verification-code') || 
                   errorMessage.includes('Wrong OTP') ||
                   errorMessage.includes('Invalid OTP')) {
          // Show specific OTP error
          Alert.alert('Error', 'Invalid OTP. Please check and try again.');
        } else {
          // Show generic error message
          Alert.alert('Error', errorMessage);
        }
      }
    } catch (error) {
      console.error('💥 VerificationScreen: OTP verification error:', error);
      
      // Check if it's a Firebase error
      if (error.code === 'auth/invalid-verification-code') {
        Alert.alert('Error', 'Invalid OTP. Please check the code and try again.');
      } else if (error.code === 'auth/code-expired') {
        Alert.alert('Error', 'OTP has expired. Please request a new one.');
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert('Error', 'Too many attempts. Please try again later.');
      } else {
        Alert.alert('Error', 'Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Back Button */}
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
            {/* Verification Icon */}
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

            {/* OTP Input Fields */}
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

            {/* Resend OTP Section */}
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

      {/* Fixed Button Container */}
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
    justifyContent:'center',
    gap:10,
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