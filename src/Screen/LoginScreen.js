import { useNavigation } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
import { authAPI } from '../API/authAPI';
import { useAppDispatch } from '../Redux/hooks';
import { setMobileNumber } from '../Redux/userSlice';
// FIREBASE AUTH - COMMENTED OUT FOR 2FACTOR INTEGRATION
// import { setCustomAlertRef } from '../services/firebaseAuthService';

// 2FACTOR AUTH - NEW INTEGRATION
import twofactorAuthService from '../services/twofactorAuthService';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomAlertManager from '../Component/CustomAlertManager';

const logo = require('../assests/images/Learningsaintlogo.png');
const graduationCap = require('../assests/images/Degree.png');
                                                                       
const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const customAlertRef = useRef(null);

  // Set custom alert reference for 2Factor Auth service
  useEffect(() => {
    twofactorAuthService.setCustomAlertRef(customAlertRef);
  }, []);

  // Handle phone number input changes
  const handlePhoneNumberChange = (text) => {
    // Remove any non-digit characters
    const digitsOnly = text.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (digitsOnly.length <= 10) {
      setDisplayPhoneNumber(digitsOnly);
      // Automatically prepend +91 for the actual phone number
      setPhoneNumber(digitsOnly ? `+91${digitsOnly}` : '');
    }
  };

  const handleLogin = async () => {
    if (!displayPhoneNumber || displayPhoneNumber.length !== 10) {
      customAlertRef.current?.show({
        title: 'Error',
        message: 'Please enter exactly 10 digits for mobile number',
        type: 'error',
        showCancel: false,
        confirmText: 'OK'
      });
      return;
    }

    setIsLoading(true);
    try {
      const mobileNumberFormatted = phoneNumber; // Already has +91 prepended
      console.log('🔐 [LoginScreen] Attempting 2Factor login for:', mobileNumberFormatted);
     
      // Call 2Factor login API
      const result = await authAPI.login(mobileNumberFormatted);
      console.log('🔐 [LoginScreen] 2Factor Login API Response:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('✅ [LoginScreen] Login successful, navigating to verification');
        // Store mobile number in Redux
        dispatch(setMobileNumber(mobileNumberFormatted));
        
        // Store session ID for OTP verification
        const sessionId = result.data.sessionId;
        
        navigation.navigate('Verify', { 
          mobileNumber: mobileNumberFormatted,
          sessionId: sessionId, // 2Factor session ID
          verificationId: null, // Not used in 2Factor
          isFromLogin: true  // Flag to indicate this is from login flow
        });
      } else {
        console.log('❌ [LoginScreen] Login failed:', result);
        // Handle specific errors - check both result.message and result.data.message
        const errorMessage = result.data?.message || result.message || '';
        
        if (errorMessage.includes('not registered') || 
            errorMessage.includes('not verified') ||
            errorMessage.includes('Mobile number not registered') ||
            errorMessage.includes('User not found') ||
            errorMessage.includes('Please register first')) {
          
          console.log('🔄 [LoginScreen] User not registered, showing confirmation alert');
          console.log('📱 [LoginScreen] Error message:', errorMessage);
          
          // Show confirmation alert before navigating to register
          customAlertRef.current?.show({
            title: 'User Not Registered',
            message: `You are not registered with ${mobileNumberFormatted}. Would you like to register now?`,
            type: 'info',
            showCancel: true,
            confirmText: 'Register',
            cancelText: 'Cancel',
            onConfirm: () => {
              console.log('✅ [LoginScreen] User confirmed registration, navigating to Register screen');
              console.log('📱 [LoginScreen] Mobile number:', mobileNumberFormatted);
              navigation.navigate('Register', { mobileNumber: mobileNumberFormatted });
            },
            onCancel: () => {
              console.log('❌ [LoginScreen] User cancelled registration');
            }
          });
        } else if (errorMessage.includes('missing-client-identifier')) {
          customAlertRef.current?.show({
            title: 'Configuration Error',
            message: 'Firebase configuration error. Please add SHA-1 fingerprint to Firebase Console.',
            type: 'error',
            showCancel: false,
            confirmText: 'OK'
          });
        } else {
          const errorMessage = result.data?.message || result.message || 'Failed to login. Please try again.';
          
          customAlertRef.current?.show({
            title: 'Login Failed',
            message: errorMessage,
            type: 'error',
            showCancel: false,
            confirmText: 'OK'
          });
        }
      }
    } catch (error) {
      console.error('💥 [LoginScreen] Login error:', error);
      
      customAlertRef.current?.show({
        title: 'Network Error',
        message: 'Unable to connect to server. Please check your internet connection and try again.',
        type: 'error',
        showCancel: false,
        confirmText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />

          {/* Main Container with Gradient Background */}
          <View style={styles.mainContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0)', '#FF8A00']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <Image source={logo} style={styles.logo} resizeMode="contain" />
              </View>

              {/* Graduation Cap Image - Positioned absolutely */}
              <View style={styles.graduationCapContainer}>
                <Image
                  source={graduationCap}
                  style={styles.graduationCap}
                  resizeMode="contain"
                />
              </View>

              {/* Input Section */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Mobile No.</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.countryCodeBox}>
                    <Text style={styles.countryCode}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="1234567890"
                    placeholderTextColor="#FF8A65"
                    keyboardType="phone-pad"
                    value={displayPhoneNumber}
                    onChangeText={handlePhoneNumberChange}
                    maxLength={10}
                  />
                </View>
              </View>
            </LinearGradient>

            {/* Login Button */}
            <View style={styles.buttonContainer}>
              <LinearGradient
                colors={['#FF9800', '#FFB300']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <TouchableOpacity
                  onPress={handleLogin}
                  style={{ width: '100%', alignItems: 'center' }}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>{isLoading ? 'Checking...' : 'Log In'}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      
      {/* Custom Alert Manager */}
      <CustomAlertManager ref={customAlertRef} />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    height: height * 0.7,
    paddingHorizontal: 20,
    position: 'relative',
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  logo: {
    width: width * 0.5,
    height: height * 0.12,
  },
  graduationCapContainer: {
    position: 'absolute',
    left: -41,
    bottom: 120,
    zIndex: 1,
  },
  graduationCap: {
    width: 250,
    height: 250,
    transform: [{ rotate: '0deg' }],
  },
  inputSection: {
    position: 'absolute',
    bottom: 0,
    left: 5,
    right: 5,
    borderRadius: 25,
    padding: 30,
  },
  label: {
    marginBottom: 15,
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9800',
    overflow: 'hidden',
  },
  countryCodeBox: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  countryCode: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 30,
    paddingBottom: 50,
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