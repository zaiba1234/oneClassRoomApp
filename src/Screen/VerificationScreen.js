import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState, useEffect } from 'react';
import { authAPI } from '../API/authAPI';
import { profileAPI } from '../API/profileAPI';
import { useAppDispatch } from '../Redux/hooks';
import { setToken, setProfileData } from '../Redux/userSlice';
import {
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
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = useRef([]);
  
  const mobileNumber = route.params?.mobileNumber || '+91 ******333';
  const fullName = route.params?.fullName || '';

  // Test Redux dispatch to verify it's working
  useEffect(() => {
    console.log('🧪 VerificationScreen: Testing Redux dispatch...');
    console.log('🧪 VerificationScreen: setToken action available:', !!setToken);
    console.log('🧪 VerificationScreen: setProfileData action available:', !!setProfileData);
    
    // Test dispatch - only run once
    console.log('✅ VerificationScreen: Redux actions are available and ready');
  }, []);

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
      if (index < 3) {
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

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    console.log('🔐 VerificationScreen: Starting OTP verification...');
    console.log('🔐 VerificationScreen: OTP entered:', otpString);
    console.log('🔐 VerificationScreen: Mobile number from route:', mobileNumber);
    console.log('🔐 VerificationScreen: Full name from route:', fullName);
    
    if (otpString.length !== 4) {
      console.log('❌ VerificationScreen: OTP incomplete, length:', otpString.length);
      return;
    }

    setIsLoading(true);
    console.log('🔄 VerificationScreen: Loading started, calling verifyOTP API...');
    
    try {
      const result = await authAPI.verifyOTP(mobileNumber, otpString);
      console.log('📡 VerificationScreen: verifyOTP API response:', result);
      console.log('📡 VerificationScreen: API success status:', result.success);
      console.log('📡 VerificationScreen: API message:', result.data?.message);
      console.log('📡 VerificationScreen: result.data:', result.data);
      console.log('📡 VerificationScreen: result.data.data:', result.data?.data);
      console.log('📡 VerificationScreen: result.data.data.token:', result.data?.data?.token);
      console.log('📡 VerificationScreen: result.data.token:', result.data?.token);
      
      
      if (result.success) {
        console.log('✅ VerificationScreen: OTP verification successful!');
        console.log('📋 VerificationScreen: Full API response data:', result.data);
        
        // Store token in Redux if available
        // Note: API response structure is result.data.data.token (nested)
        const token = result.data?.data?.token || result.data?.token;
        
        if (token) {
          console.log('🔑 VerificationScreen: Token received from API!');
          console.log('🔑 VerificationScreen: Token value:', token);
          
          // Store token in Redux
          console.log('🔄 VerificationScreen: About to dispatch setToken...');
          dispatch(setToken(token));
          console.log('✅ VerificationScreen: Token stored in Redux successfully');
          
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
              
              // Store all user profile data in Redux
              console.log('🔄 VerificationScreen: About to dispatch setProfileData...');
              const profileAction = setProfileData({
                _id: userData._id,
                userId: userData.userId,
                fullName: userData.fullName,
                mobileNumber: userData.mobileNumber,
                profileImageUrl: userData.profileImageUrl,
                address: userData.address,
                email: userData.email
              });
              console.log('🔄 VerificationScreen: Profile action created:', profileAction);
              
              dispatch(profileAction);
              console.log('✅ VerificationScreen: All user profile data stored in Redux successfully!');
              
            } else {
              console.log('❌ VerificationScreen: Profile API failed:', profileResult.data?.message);
              console.log('🔄 VerificationScreen: Falling back to route params...');
              
              // Fallback to route params if profile fetch fails
              if (fullName) {
                console.log('📝 VerificationScreen: Fallback - storing fullName from route params:', fullName);
                dispatch(setProfileData({ fullName }));
              }
              if (mobileNumber) {
                console.log('📱 VerificationScreen: Fallback - storing mobileNumber from route params:', mobileNumber);
                dispatch(setProfileData({ mobileNumber }));
              }
            }
          } catch (profileError) {
            console.error('💥 VerificationScreen: Error fetching user profile:', profileError);
            console.log('🔄 VerificationScreen: Falling back to route params due to profile error...');
            
            // Fallback to route params if profile fetch fails
            if (fullName) {
              console.log('📝 VerificationScreen: Fallback - storing fullName from route params:', fullName);
              dispatch(setProfileData({ fullName }));
            }
            if (mobileNumber) {
              console.log('📱 VerificationScreen: Fallback - storing mobileNumber from route params:', mobileNumber);
              dispatch(setProfileData({ mobileNumber }));
            }
          }
        } else {
          console.log('⚠️ VerificationScreen: No token received from API, using route params only');
          console.log('⚠️ VerificationScreen: API response data:', result.data);
          
          // No token, use route params
          if (fullName) {
            console.log('📝 VerificationScreen: Storing fullName from route params:', fullName);
            dispatch(setProfileData({ fullName }));
          }
          if (mobileNumber) {
            console.log('📱 VerificationScreen: Storing mobileNumber from route params:', mobileNumber);
            dispatch(setProfileData({ mobileNumber }));
          }
        }
        
        // OTP verified successfully, navigate to Home
        console.log('🏠 VerificationScreen: Navigating to Home screen...');
        navigation.navigate('Home');
      } else {
        console.log('❌ VerificationScreen: OTP verification failed:', result.data?.message);
        console.log('❌ VerificationScreen: Full error response:', result);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={20} color="#FF8800" />
          </TouchableOpacity>

          {/* Main Content */}
          <View style={styles.content}>
            {/* Verification Icon */}
            <View style={styles.iconContainer}>
              <Image
                source={tickmarkIcon}
                style={styles.tickmarkImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the OTP sent to {mobileNumber}
            </Text>

            {/* OTP Input Fields */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                    index === 3 && digit && styles.otpInputActive
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
                Didn't you receive the OTP?{' '}
                <Text style={styles.resendLink}>Resend OTP</Text>
              </Text>
              <View style={styles.timerContainer}>
                <Icon name="time-outline" size={14} color="#FF8800" />
                <Text style={styles.timerText}>00:45</Text>
              </View>
            </View>
          </View>

        


<View style={styles.buttonContainer}>
              <LinearGradient
                colors={['#FF9800', '#FFB300']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <TouchableOpacity
                  onPress={handleVerifyOTP}
                  style={{ width: '100%', alignItems: 'center' }}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>{isLoading ? 'Verifying...' : 'Verify OTP'}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    top: 30,
    left: 20,
    zIndex: 10,
    padding: 10,
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
  },
  resendText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  resendLink: {
    color: '#FF8800',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockImage: {
    width: 14,
    height: 14,
    tintColor: '#FF8800',
  },
  timerText: {
    fontSize: 12,
    color: '#FF8800',
    fontWeight: '600',
    marginLeft: 4,
  },

 buttonContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  marginBottom:140,  
  
  },
  button: {
    width: '100%',
    borderRadius: 15,
    paddingVertical: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },



});