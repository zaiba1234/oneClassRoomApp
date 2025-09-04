import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState, useEffect } from 'react';
import { authAPI } from '../API/authAPI';
import { profileAPI } from '../API/profileAPI';
import { useAppDispatch } from '../Redux/hooks';
import { setUserData, saveUserToStorage } from '../Redux/userSlice';
import { getApiUrl } from '../API/config';
import {
  Alert,
  TextInput,
  View,                                                                           
  Text,
  TouchableOpacity,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
  StyleSheet,
  Dimensions,                                      
  Platform,
  KeyboardAvoidingView,
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
  
  const mobileNumber = route.params?.mobileNumber || '+91 ******333';
  const fullName = route.params?.fullName || '';
  const email = route.params?.email || '';
  const isEmailVerification = route.params?.isEmailVerification || false;
  const verificationId = route.params?.verificationId || null;
  const isFromLogin = route.params?.isFromLogin || false;
  const isFromRegister = route.params?.isFromRegister || false;

  // Test Redux dispatch to verify it's working
  useEffect(() => {
    console.log('🧪 VerificationScreen: Testing Redux dispatch...');
    console.log('🧪 VerificationScreen: setUserData action available:', !!setUserData);
    console.log('🧪 VerificationScreen: saveUserToStorage action available:', !!saveUserToStorage);
    
    // Debug: Log which flow we're in
    console.log('🔄 VerificationScreen: Flow detection:');
    console.log('🔄 VerificationScreen: isFromLogin:', isFromLogin);
    console.log('🔄 VerificationScreen: isFromRegister:', isFromRegister);
    console.log('🔄 VerificationScreen: isEmailVerification:', isEmailVerification);
    console.log('🔄 VerificationScreen: mobileNumber:', mobileNumber);
    console.log('🔄 VerificationScreen: fullName:', fullName);
    
    // Test dispatch - only run once
    console.log('✅ VerificationScreen: Redux actions are available and ready');
  }, []);

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
    
    // If clearing the field (value is empty)
    if (value === '' && newOtp[index] !== '') {
      newOtp[index] = '';
      setOtp(newOtp);
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
      
      // Move to next field if not the last one
      if (index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
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
      console.log('⚠️ VerificationScreen: Resend OTP blocked - timer active or already resending');
      return;
    }

    console.log('🔄 VerificationScreen: Starting resend OTP...');
    
    // For email verification, we need to resend email OTP, not mobile OTP
    if (isEmailVerification) {
      console.log('📧 VerificationScreen: Resending email OTP...');
      console.log('📧 VerificationScreen: Email for resend:', email);
      
      setIsResending(true);
      
      try {
        // Call send-emailotp API again
        const response = await fetch(getApiUrl('/api/auth/send-emailotp'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${route.params?.token || ''}`,
          },
          body: JSON.stringify({
            email: email
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('✅ VerificationScreen: Email OTP resent successfully!');
            // Reset timer to 45 seconds
            setResendTimer(45);
            // Clear OTP fields
            setOtp(['', '', '', '', '', '']);
            // Focus on first OTP field
            otpRefs.current[0]?.focus();
          } else {
            console.log('❌ VerificationScreen: Email OTP resend failed:', result.message);
          }
        } else {
          console.log('❌ VerificationScreen: Email OTP resend failed:', response.status);
        }
      } catch (error) {
        console.error('💥 VerificationScreen: Email OTP resend error:', error);
      } finally {
        setIsResending(false);
      }
    } else {
      // Mobile OTP resend (existing logic)
      console.log('📱 VerificationScreen: Mobile number for resend:', mobileNumber);
      
      setIsResending(true);
      
      try {
        const result = await authAPI.resendOTP(mobileNumber);
        console.log('🔥 Firebase VerificationScreen: Resend OTP API response:', result);
        
        if (result.success) {
          console.log('✅ Firebase VerificationScreen: OTP resent successfully!');
          // Reset timer to 45 seconds
          setResendTimer(45);
          // Clear OTP fields
          setOtp(['', '', '', '', '', '']);
          // Focus on first OTP field
          otpRefs.current[0]?.focus();
        } else {
          console.log('❌ Firebase VerificationScreen: Resend OTP failed:', result.data?.message);
        }
      } catch (error) {
        console.error('💥 Firebase VerificationScreen: Resend OTP error:', error);
      } finally {
        setIsResending(false);
      }
    }
  };

  const handleVerifyEmailOTP = async () => {
    const otpString = otp.join('');
    console.log('📧 VerificationScreen: Starting email OTP verification...');
    console.log('📧 VerificationScreen: OTP entered:', otpString);
    console.log('📧 VerificationScreen: Email from route:', email);
    
    if (otpString.length !== 6) {
      console.log('❌ VerificationScreen: OTP incomplete, length:', otpString.length);
      return;
    }

    setIsLoading(true);
    console.log('🔄 VerificationScreen: Loading started, calling verify-emailOtp API...');
    
    try {
      // Call verify-emailOtp API
      const response = await fetch(getApiUrl('/api/auth/verify-emailOtp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${route.params?.token || ''}`,
        },
        body: JSON.stringify({
          email: email,
          otp: otpString
        })
      });

      console.log('📡 VerificationScreen: Response status:', response.status);
      console.log('📡 VerificationScreen: Response headers:', response.headers);
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ VerificationScreen: API error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let result;
      try {
        result = await response.json();
        console.log('📡 VerificationScreen: Email OTP verification response:', result);
      } catch (parseError) {
        console.error('💥 VerificationScreen: JSON parse error:', parseError);
        console.log('📡 VerificationScreen: Raw response text:', await response.text());
        throw new Error('Invalid response from server. Please try again.');
      }
      
      if (result.success) {
        console.log('✅ VerificationScreen: Email OTP verification successful!');
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
        console.log('❌ VerificationScreen: Email OTP verification failed:', result.message);
        Alert.alert('Error', result.message || 'Failed to verify email OTP');
      }
    } catch (error) {
      console.error('💥 VerificationScreen: Email OTP verification error:', error);
      Alert.alert('Error', 'Failed to verify email OTP. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('🔄 VerificationScreen: Loading finished');
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    console.log('🔥 Firebase VerificationScreen: Starting OTP verification...');
    console.log('🔥 Firebase VerificationScreen: OTP entered:', otpString);
    console.log('🔥 Firebase VerificationScreen: Mobile number from route:', mobileNumber);
    console.log('🔥 Firebase VerificationScreen: Verification ID:', verificationId);
    console.log('🔥 Firebase VerificationScreen: Flow - isFromLogin:', isFromLogin, 'isFromRegister:', isFromRegister);
    
    if (otpString.length !== 6) {
      console.log('❌ Firebase VerificationScreen: OTP incomplete, length:', otpString.length);
      return;
    }

    setIsLoading(true);
    console.log('🔄 Firebase VerificationScreen: Loading started, calling Firebase verifyOTP...');
    
    try {
      // Use the appropriate API based on the flow
      let result;
      if (isFromRegister) {
        console.log('🔄 Firebase VerificationScreen: Using register flow verification...');
        result = await authAPI.verifyOTP(mobileNumber, otpString, verificationId);
      } else if (isFromLogin) {
        console.log('🔄 Firebase VerificationScreen: Using login flow verification...');
        result = await authAPI.verifyOTP(mobileNumber, otpString, verificationId);
      } else {
        console.log('🔄 Firebase VerificationScreen: Using default verification...');
        result = await authAPI.verifyOTP(mobileNumber, otpString, verificationId);
      }
      
      console.log('📡 Firebase VerificationScreen: verifyOTP API response:', result);
     
      
      
      if (result.success) {
        console.log('✅ VerificationScreen: OTP verification successful!');
        console.log('📋 VerificationScreen: Full API response data:', result.data);
        
        // Store token in Redux if available
        // Note: API response structure is result.data.data.token (nested)
        const token = result.data?.data?.token || result.data?.token;
        
        if (token) {
          console.log('🔑 VerificationScreen: Token received from API!');
          console.log('🔑 VerificationScreen: Token value:', token);
          
          // After storing token, fetch user profile
          try {
            console.log('👤 VerificationScreen: Starting to fetch user profile with token...');
            console.log('🔑 VerificationScreen: Using token for profile API call...');
            
            const profileResult = await profileAPI.getUserProfile(token);
            console.log('📡 VerificationScreen: Profile API response:', profileResult);
            
            if (profileResult.success && profileResult.data.success) {
              const userData = profileResult.data.data;
              console.log('🎉 VerificationScreen: User profile data received successfully!');
              console.log('👤 VerificationScreen: Full user data:', userData);
              
              // Store complete user data in Redux and save to storage
              console.log('🔄 VerificationScreen: About to dispatch setUserData with complete profile...');
              const completeUserData = {
                _id: userData._id,
                userId: userData.userId,
                fullName: userData.fullName,
                mobileNumber: userData.mobileNumber,
                profileImageUrl: userData.profileImageUrl,
                address: userData.address,
                email: userData.email,
                token: token
              };
              
              dispatch(setUserData(completeUserData));
              console.log('✅ VerificationScreen: Complete user data stored in Redux successfully!');
              
              // Save to storage
              dispatch(saveUserToStorage(completeUserData));
              console.log('💾 VerificationScreen: User data saved to storage successfully!');
              
            } else {
              console.log('❌ VerificationScreen: Profile API failed:', profileResult.data?.message);
              console.log('🔄 VerificationScreen: Falling back to route params...');
              
              // Fallback to route params if profile fetch fails
              const fallbackUserData = {
                mobileNumber: mobileNumber,
                token: token
              };
              
              if (fullName) {
                console.log('📝 VerificationScreen: Fallback - storing fullName from route params:', fullName);
                fallbackUserData.fullName = fullName;
              }
              
              dispatch(setUserData(fallbackUserData));
              dispatch(saveUserToStorage(fallbackUserData));
              console.log('💾 VerificationScreen: Fallback user data saved to storage!');
            }
          } catch (profileError) {
            console.error('💥 VerificationScreen: Error fetching user profile:', profileError);
            console.log('🔄 VerificationScreen: Falling back to route params due to profile error...');
            
            // Fallback to route params if profile fetch fails
            const fallbackUserData = {
              mobileNumber: mobileNumber,
              token: token
            };
            
            if (fullName) {
              console.log('📝 VerificationScreen: Fallback - storing fullName from route params:', fullName);
              fallbackUserData.fullName = fullName;
            }
            
            dispatch(setUserData(fallbackUserData));
            dispatch(saveUserToStorage(fallbackUserData));
            console.log('💾 VerificationScreen: Fallback user data saved to storage!');
          }
        } else {
          console.log('⚠️ VerificationScreen: No token received from API, using route params only');
          console.log('⚠️ VerificationScreen: API response data:', result.data);
          
          // No token, use route params only
          const fallbackUserData = {};
          
          if (fullName) {
            console.log('📝 VerificationScreen: Storing fullName from route params:', fullName);
            fallbackUserData.fullName = fullName;
          }
          if (mobileNumber) {
            console.log('📱 VerificationScreen: Storing mobileNumber from route params:', mobileNumber);
            fallbackUserData.mobileNumber = mobileNumber;
          }
          
          if (Object.keys(fallbackUserData).length > 0) {
            dispatch(setUserData(fallbackUserData));
            dispatch(saveUserToStorage(fallbackUserData));
            console.log('💾 VerificationScreen: Route params user data saved to storage!');
          }
        }
        
        // OTP verified successfully, navigate to Home
        console.log('🏠 VerificationScreen: Navigating to Home screen...');
        navigation.navigate('Home');
      } else {
        console.log('❌ VerificationScreen: OTP verification failed:', result.message);
        console.log('❌ VerificationScreen: Full error response:', result);
        
        // Check if user needs to register
        console.log('🔍 VerificationScreen: Checking error message:', result.message);
        console.log('🔍 VerificationScreen: Message includes "not registered":', result.message?.includes('not registered'));
        console.log('🔍 VerificationScreen: Message includes "Mobile number not registered":', result.message?.includes('Mobile number not registered'));
        console.log('🔍 VerificationScreen: Message includes "not verified":', result.message?.includes('not verified'));
        
        if (result.message?.includes('not registered') || 
            result.message?.includes('Mobile number not registered') ||
            result.message?.includes('not verified') ||
            result.message?.includes('User not found')) {
          console.log('🔄 VerificationScreen: User not registered, showing alert...');
          console.log('🔄 VerificationScreen: Mobile number for navigation:', mobileNumber);
          
          Alert.alert(
            'Mobile Number Not Registered',
            'This mobile number is not registered. Please complete your registration.',
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('🔄 VerificationScreen: OK button pressed!');
                  console.log('🔄 VerificationScreen: About to navigate to Register screen...');
                  console.log('🔄 VerificationScreen: Mobile number being passed:', mobileNumber);
                  
                  // Navigate to Register screen with mobile number
                  navigation.navigate('Register', { mobileNumber: mobileNumber });
                  console.log('✅ VerificationScreen: Navigation to Register screen initiated!');
                }
              }
            ]
          );
          console.log('🔄 VerificationScreen: Alert.alert called successfully!');
        } else {
          console.log('❌ VerificationScreen: Error message does not match registration check');
          // Show error message for other failures
          Alert.alert('Error', result.message || 'OTP verification failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('💥 VerificationScreen: OTP verification error:', error);
      console.log('❌ VerificationScreen: Network error occurred');
    } finally {
      setIsLoading(false);
      console.log('🔄 VerificationScreen: Loading finished');
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
        <Icon name="chevron-back" size={20} color="#FF8800" />
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
              <Text style={styles.resendText}>
                Didn't you receive the OTP?
              </Text>
              <View style={styles.resendActionContainer}>
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
    top: Platform.OS === 'ios' ? 50 : 30,
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
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  resendActionContainer: {
    marginBottom: 12,
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
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE0B2',
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