import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
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

const VerificationScreen = () => {
  const navigation = useNavigation();
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = useRef([]);

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
              Enter the OTP sent to +91 ******333
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

          {/* Verify Button - Fixed at Bottom */}
          {/* <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.buttonWrapper}
              onPress={() => navigation.navigate('Register')}
            >
              <LinearGradient
                colors={['#FFB800', '#FF8800']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Verify OTP</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View> */}



<View style={styles.buttonContainer}>
              <LinearGradient
                colors={['#FF9800', '#FFB300']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                  style={{ width: '100%', alignItems: 'center' }}
                >
                  <Text style={styles.buttonText}>Verify OTP</Text>
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
  // buttonContainer: {
  //   position: 'absolute',
  //   bottom: 0,
  //   left: 0,
  //   right: 0,
  //   paddingHorizontal: 30,
  //   paddingBottom: 30,
  //   backgroundColor: '#fff',
  // },
  // buttonWrapper: {
  //   borderRadius: 12,
  //   overflow: 'hidden',
  //   shadowColor: '#FF8800',
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowOpacity: 0.3,
  //   shadowRadius: 8,
  //   elevation: 8,
  // },
  // button: {
  //   paddingVertical: 14,
  //   borderRadius: 12,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  // buttonText: {
  //   color: '#fff',
  //   fontSize: 16,
  //   fontWeight: '600',
  // },


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