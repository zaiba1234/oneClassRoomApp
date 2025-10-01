import { useNavigation } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
import { authAPI } from '../API/authAPI';
import { useAppDispatch } from '../Redux/hooks';
import { setProfileData } from '../Redux/userSlice';
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
import CustomAlertManager from '../Component/CustomAlertManager';

const logo = require('../assests/images/Learningsaintlogo.png');
const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(route.params?.mobileNumber || '');
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState((route.params?.mobileNumber || '').replace('+91', '') || '');
  const [isLoading, setIsLoading] = useState(false);
  const customAlertRef = useRef(null);

  // Set custom alert reference for 2Factor Auth service
  useEffect(() => {
    twofactorAuthService.setCustomAlertRef(customAlertRef);
  }, []);

  // Debug: Log received mobile number
  React.useEffect(() => {
  }, [route.params?.mobileNumber, phoneNumber]);

  // Handle phone number input changes
  const handlePhoneNumberChange = (text) => {
    // Remove any non-digit characters
    const digitsOnly = (text || '').replace(/\D/g, '');
    
    // Limit to 10 digits
    if (digitsOnly.length <= 10) {
      setDisplayPhoneNumber(digitsOnly);
      // Automatically prepend +91 for the actual phone number
      setPhoneNumber(digitsOnly ? `+91${digitsOnly}` : '');
    }
  };

  const handleRegister = async () => {
    if (!(fullName || '').trim() || !displayPhoneNumber) {
      customAlertRef.current?.show({
        title: 'Error',
        message: 'Please enter both full name and phone number',
        type: 'error',
        showCancel: false,
        confirmText: 'OK'
      });
      return;
    }

    if (displayPhoneNumber.length !== 10) {
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
      console.log('📝 [RegisterScreen] Starting 2Factor registration for:', { fullName: (fullName || '').trim(), phoneNumber });
      
      // Register user with 2Factor (includes OTP sending)
      const registerResult = await authAPI.register((fullName || '').trim(), phoneNumber);
      console.log('📝 [RegisterScreen] 2Factor Register API Response:', JSON.stringify(registerResult, null, 2));
      
      if (registerResult.success) {
        console.log('✅ [RegisterScreen] 2Factor registration successful, OTP sent');
        // Store user data in Redux
        dispatch(setProfileData({ fullName: (fullName || '').trim(), mobileNumber: phoneNumber }));
        
        // Registration successful, navigate to verification with sessionId
        navigation.navigate('Verify', { 
          mobileNumber: phoneNumber, 
          fullName: (fullName || '').trim(),
          sessionId: registerResult.data.sessionId, // 2Factor session ID
          verificationId: null, // Not used in 2Factor
          isFromRegister: true  // Flag to indicate this is from register flow
        });
      } else {
        const errorMessage = registerResult.data?.message || registerResult.message || 'Failed to register. Please try again.';
        
        customAlertRef.current?.show({
          title: 'Registration Failed',
          message: errorMessage,
          type: 'error',
          showCancel: false,
          confirmText: 'OK'
        });
      }
    } catch (error) {
      console.error('💥 [RegisterScreen] Registration error:', error);
      
      customAlertRef.current?.show({
        title: 'Registration Error',
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
                       <Image
               source={logo}
               style={styles.logo}
               resizeMode="contain"
             />
           <LinearGradient
             colors={['#FF8800', 'rgba(255, 255, 255, 0)']}
             start={{ x: 0, y: 1 }}
             end={{ x: 0, y: 0 }}
             style={styles.gradient}
           >
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

          <View style={styles.buttonContainer}>
            <LinearGradient
              colors={['#FFB800', '#FF8800']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.button}
            >
              <TouchableOpacity 
                onPress={handleRegister} 
                style={{ width: '100%', alignItems: 'center' }}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>{isLoading ? 'Registering...' : 'Register'}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      
      {/* Custom Alert Manager */}
      <CustomAlertManager ref={customAlertRef} />
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  gradient: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    minHeight: height * 0.7,
  },

  logo: {
  
    width: width * 0.48,
    height: height * 0.15,
    marginTop: 50,
    position:'absolute',
  },
     inputContainer: {
     position: 'absolute',
     bottom: 100,
     left: 5,
     right: 5,
     borderRadius: 25,
     padding: 30,
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
    marginBottom: 10,
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
    marginTop: 30,
    paddingHorizontal: 40,
    width: '100%',
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
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});