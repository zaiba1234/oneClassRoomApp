import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { authAPI } from '../API/authAPI';
import { useAppDispatch } from '../Redux/hooks';
import { setProfileData } from '../Redux/userSlice';
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

const logo = require('../assests/images/Learningsaintlogo.png');
const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(() => {
    // Remove +91 prefix if it exists in route params
    const mobileFromRoute = route.params?.mobileNumber || '';
    return mobileFromRoute.replace(/^\+91/, '');
  });
  const [isLoading, setIsLoading] = useState(false);

  // Debug: Log received mobile number
  React.useEffect(() => {
  }, [route.params?.mobileNumber, phoneNumber]);

  const handleRegister = async () => {
    if (!fullName.trim() || !phoneNumber) {
      console.log('❌ RegisterScreen: Missing full name or phone number');
      return;
    }

    // Extract only digits and ensure it's exactly 10 digits
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      console.log('❌ RegisterScreen: Please enter exactly 10 digits for mobile number');
      return;
    }

    // Format with +91 for API calls but store without +91 in Redux
    const mobileNumberFormatted = `+91${digitsOnly}`;
    const mobileNumberForStorage = digitsOnly; // Store without +91

    setIsLoading(true);
    
    try {
      console.log('🔥 RegisterScreen: Starting registration process...');
      console.log('📱 RegisterScreen: Phone number for API:', mobileNumberFormatted);
      console.log('📱 RegisterScreen: Phone number for storage:', mobileNumberForStorage);
      console.log('👤 RegisterScreen: Full name:', fullName.trim());
      
      // First, register the user in the backend
      const registerResult = await authAPI.register(fullName.trim(), mobileNumberFormatted);
      console.log('📡 RegisterScreen: Backend registration result:', registerResult);
      
      if (registerResult.success) {
        console.log('✅ RegisterScreen: Backend registration successful, sending OTP...');
        
        // After successful registration, send OTP using Firebase
        const otpResult = await authAPI.sendOTP(mobileNumberFormatted);
        console.log('📡 RegisterScreen: Firebase OTP result:', otpResult);
        
        if (otpResult.success) {
          console.log('✅ RegisterScreen: OTP sent successfully!');
          
          // Store user data in Redux (without +91 prefix)
          dispatch(setProfileData({ fullName: fullName.trim(), mobileNumber: mobileNumberForStorage }));
          
          // Registration successful, navigate to verification with verificationId
          console.log('🚀 RegisterScreen: Navigating to Verify screen...');
          navigation.navigate('Verify', { 
            mobileNumber: mobileNumberFormatted, // Send with +91 for verification
            fullName: fullName.trim(),
            verificationId: otpResult.data.verificationId,
            isFromRegister: true  // Flag to indicate this is from register flow
          });
        } else {
          console.log('❌ RegisterScreen: OTP sending failed:', otpResult.data?.message);
          // You can show an alert here for OTP sending failure
        }                                   
      } else {
        console.log('❌ RegisterScreen: Backend registration failed:', registerResult.data?.message);
        // You can show an alert here for registration failure
      }
    } catch (error) {
      console.error('💥 RegisterScreen: Registration error:', error);
      // You can show an alert here for general errors
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

              {/* Input Section */}
              <View style={styles.inputSection}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="John Smith"
                      placeholderTextColor="#FF8A65"
                      value={fullName}
                      onChangeText={setFullName}
                    />
                  </View>
                </View>

                <View style={styles.mobileInputContainer}>
                  <Text style={styles.label}>Mobile No.</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.countryCodeBox}>
                      <Text style={styles.countryCode}>+91</Text>
                    </View>
                    <View style={styles.divider} />
                    <TextInput
                      style={styles.input}
                      placeholder="123 432 1234"
                      placeholderTextColor="#FF8A65"
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      maxLength={14}
                    />
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Register Button */}
            <View style={styles.buttonContainer}>
              <LinearGradient
                colors={['#FFB800', '#FF8800']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.button}
              >
                <TouchableOpacity 
                  onPress={handleRegister} 
                  style={styles.buttonTouchable}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.buttonText}>Sending OTP...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Register</Text>
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

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
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
  inputSection: {
    position: 'absolute',
    bottom: 0,
    left: 5,
    right: 5,
    borderRadius: 25,
    padding: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  mobileInputContainer: {
    marginBottom: 10,
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
    color: '#000',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
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
    elevation: 4,
    shadowColor: '#FF8800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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