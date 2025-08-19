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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const logo = require('../assests/images/Learningsaintlogo.png');
const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(route.params?.mobileNumber || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !phoneNumber) {
      console.log('Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authAPI.register(fullName.trim(), phoneNumber);
      
      if (result.success) {
        // Store user data in Redux
        dispatch(setProfileData({ fullName: fullName.trim(), mobileNumber: phoneNumber }));
        
        // Registration successful, navigate to verification
        console.log('Registration successful, navigating to verification');
        console.log('Full API response:', result.data);
        
        // Check if OTP is in the response
        if (result.data.otp) {
          console.log('OTP received:', result.data.otp);
        } else {
          console.log('No OTP in response, but registration successful');
        }
        
        navigation.navigate('Verify', { mobileNumber: phoneNumber, fullName: fullName.trim() });
      } else {
        console.log(result.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.log('Network error. Please try again.');
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