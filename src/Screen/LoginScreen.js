import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { authAPI } from '../API/authAPI';
import { useAppDispatch } from '../Redux/hooks';
import { setMobileNumber } from '../Redux/userSlice';
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
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const logo = require('../assests/images/Learningsaintlogo.png');
const graduationCap = require('../assests/images/Degree.png');
                                                                       
const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      console.log('Please enter a valid mobile number');
      return;
    }

    setIsLoading(true);
    try {
      // Extract only digits and ensure it's exactly 10 digits
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        console.log('Please enter exactly 10 digits for mobile number');
        setIsLoading(false);
        return;
      }
      
      const mobileNumberFormatted = `+91${digitsOnly}`;
      console.log('🔥 Login: Starting login process for:', mobileNumberFormatted);
     
      // Call login API (backend check + Firebase OTP)
      const result = await authAPI.login(mobileNumberFormatted);
      
      console.log('🔥 Login response:', result);
      
      if (result.success) {
        // Store mobile number in Redux
        dispatch(setMobileNumber(mobileNumberFormatted));
        
        // Store verification ID for OTP verification
        const verificationId = result.data.verificationId;
        
        console.log('🔥 Login: OTP sent successfully, navigating to verification');
        navigation.navigate('Verify', { 
          mobileNumber: mobileNumberFormatted,
          verificationId: verificationId,
          isFromLogin: true  // Flag to indicate this is from login flow
        });
      } else {
        console.log('🔥 Login failed:', result.message || 'Failed to send OTP');
        
        // Handle specific errors
        if (result.message?.includes('not registered') || 
            result.message?.includes('not verified') ||
            result.message?.includes('Mobile number not registered') ||
            result.message?.includes('User not found')) {
          console.log('❌ User not registered or not verified. Navigating to Register screen.');
          
          // Navigate directly to Register screen with mobile number
          navigation.navigate('Register', { mobileNumber: mobileNumberFormatted });
        } else if (result.message?.includes('missing-client-identifier')) {
          console.log('❌ Firebase configuration error. Please add SHA-1 fingerprint to Firebase Console.');
        } else {
          console.log('❌ Login failed:', result.message);
        }
      }
    } catch (error) {
      console.error('🔥 Login error:', error);
      console.log('Network error. Please try again.');
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
                    placeholder="123-432-1234"
                    placeholderTextColor="#FF8A65"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    maxLength={14}
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
                  style={styles.buttonTouchable}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.buttonText}>Sending OTP...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Log In</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
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
  buttonTouchable: {
    width: '100%',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});
