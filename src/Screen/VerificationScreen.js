// import { useNavigation } from '@react-navigation/native';
// import React, { useRef, useState, useEffect } from 'react';
// import { authAPI } from '../API/authAPI';
// import { profileAPI } from '../API/profileAPI';
// import { useAppDispatch } from '../Redux/hooks';
// import { setUserData, saveUserToStorage } from '../Redux/userSlice';
// import { getApiUrl } from '../API/config';
// import {
//   Alert,
//   TextInput,
//   View,                                                                           
//   Text,
//   TouchableOpacity,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
//   StyleSheet,
//   Dimensions,                                      
//   Platform,
//   KeyboardAvoidingView,
//   ScrollView,
//   TouchableWithoutFeedback,
//   Keyboard,
//   StatusBar,
//   Image,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import Icon from 'react-native-vector-icons/Ionicons';

// const tickmarkIcon = require('../assests/images/accountsecurity.png');
// const clockIcon = require('../assests/images/Clock.png');
// const { width, height } = Dimensions.get('window');

// const VerificationScreen = ({ route }) => {
//   const navigation = useNavigation();
//   const dispatch = useAppDispatch();
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isResending, setIsResending] = useState(false);
//   const [resendTimer, setResendTimer] = useState(45);
//   const otpRefs = useRef([]);
  
//   const mobileNumber = route.params?.mobileNumber || '+91 ******333';
//   const fullName = route.params?.fullName || '';
//   const email = route.params?.email || '';
//   const isEmailVerification = route.params?.isEmailVerification || false;
//   const verificationId = route.params?.verificationId || null;
//   const isFromLogin = route.params?.isFromLogin || false;
//   const isFromRegister = route.params?.isFromRegister || false;

//   // Test Redux dispatch to verify it's working
//   useEffect(() => {
    
//     // Debug: Log which flow we're in
    
//     // Test dispatch - only run once
//   }, []);

//   // Timer effect for resend OTP
//   useEffect(() => {
//     let interval;
//     if (resendTimer > 0) {
//       interval = setInterval(() => {
//         setResendTimer(prev => prev - 1);
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [resendTimer]);

//   const handleOtpChange = (index, value) => {
//     const newOtp = [...otp];
    
//     // If clearing the field (value is empty)
//     if (value === '' && newOtp[index] !== '') {
//       newOtp[index] = '';
//       setOtp(newOtp);
//       // Move cursor to previous field
//       if (index > 0) {
//         otpRefs.current[index - 1]?.focus();
//       }
//       return;
//     }
    
//     // If entering a digit
//     if (value && /^\d$/.test(value)) {
//       newOtp[index] = value;
//       setOtp(newOtp);
      
//       // Move to next field if not the last one
//       if (index < 5) {
//         otpRefs.current[index + 1]?.focus();
//       }
//     }
//   };

//   const handleKeyPress = (index, e) => {
//     // Handle backspace
//     if (e.nativeEvent.key === 'Backspace' && otp[index] === '') {
//       if (index > 0) {
//         otpRefs.current[index - 1]?.focus();
//       }
//     }
//   };

//   const handleResendOTP = async () => {
//     if (isResending || resendTimer > 0) {
//       return;
//     }

    
//     // For email verification, we need to resend email OTP, not mobile OTP
//     if (isEmailVerification) {
      
//       setIsResending(true);
      
//       try {
//         // Call send-emailotp API again
//         const response = await fetch(getApiUrl('/api/auth/send-emailotp'), {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${route.params?.token || ''}`,
//           },
//           body: JSON.stringify({
//             email: email
//           })
//         });

//         if (response.ok) {
//           const result = await response.json();
//           if (result.success) {
//             // Reset timer to 45 seconds
//             setResendTimer(45);
//             // Clear OTP fields
//             setOtp(['', '', '', '', '', '']);
//             // Focus on first OTP field
//             otpRefs.current[0]?.focus();
//           } else {
//           }
//         } else {
//         }
//       } catch (error) {
//         console.error('💥 VerificationScreen: Email OTP resend error:', error);
//       } finally {
//         setIsResending(false);
//       }
//     } else {
//       // Mobile OTP resend (existing logic)
      
//       setIsResending(true);
      
//       try {
//         const result = await authAPI.resendOTP(mobileNumber);
        
//         if (result.success) {
//           // Reset timer to 45 seconds
//           setResendTimer(45);
//           // Clear OTP fields
//           setOtp(['', '', '', '', '', '']);
//           // Focus on first OTP field
//           otpRefs.current[0]?.focus();
//         } else {
//         }
//       } catch (error) {
//         console.error('💥 Firebase VerificationScreen: Resend OTP error:', error);
//       } finally {
//         setIsResending(false);
//       }
//     }
//   };

//   const handleVerifyEmailOTP = async () => {
//     const otpString = otp.join('');
    
//     if (otpString.length !== 6) {
//       return;
//     }

//     setIsLoading(true);
    
//     try {
//       // Call verify-emailOtp API
//       const response = await fetch(getApiUrl('/api/auth/verify-emailOtp'), {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${route.params?.token || ''}`,
//         },
//         body: JSON.stringify({
//           email: email,
//           otp: otpString
//         })
//       });

      
//       // Check if response is ok before parsing JSON
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       let result;
//       try {
//         result = await response.json();
//       } catch (parseError) {
//         console.error('💥 VerificationScreen: JSON parse error:', parseError);
//         throw new Error('Invalid response from server. Please try again.');
//       }
      
//       if (result.success) {
//         Alert.alert(
//           'Success', 
//           'Email verified successfully!',
//           [
//             {
//               text: 'OK',
//               onPress: () => {
//                 // Navigate back to PersonalInfoScreen
//                 navigation.navigate('PersonalInfo');
//               }
//             }
//           ]
//         );
//       } else {
//         Alert.alert('Error', result.message || 'Failed to verify email OTP');
//       }
//     } catch (error) {
//       console.error('💥 VerificationScreen: Email OTP verification error:', error);
//       Alert.alert('Error', 'Failed to verify email OTP. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleVerifyOTP = async () => {
//     const otpString = otp.join('');
    
//     if (otpString.length !== 6) {
//       return;
//     }

//     setIsLoading(true);
    
//     try {
//       // Use the appropriate API based on the flow
//       let result;
//       if (isFromRegister) {
//         result = await authAPI.verifyOTP(mobileNumber, otpString, verificationId);
//       } else if (isFromLogin) {
//         result = await authAPI.verifyOTP(mobileNumber, otpString, verificationId);
//       } else {
//         result = await authAPI.verifyOTP(mobileNumber, otpString, verificationId);
//       }
      
     
      
      
//       if (result.success) {
        
//         // Store token in Redux if available
//         // Note: API response structure is result.data.data.token (nested)
//         const token = result.data?.data?.token || result.data?.token;
        
//         if (token) {
          
//           // After storing token, fetch user profile
//           try {
            
//             const profileResult = await profileAPI.getUserProfile(token);
            
//             if (profileResult.success && profileResult.data.success) {
//               const userData = profileResult.data.data;
              
//               // Store complete user data in Redux and save to storage
//               const completeUserData = {
//                 _id: userData._id,
//                 userId: userData.userId,
//                 fullName: userData.fullName,
//                 mobileNumber: userData.mobileNumber,
//                 profileImageUrl: userData.profileImageUrl,
//                 address: userData.address,
//                 email: userData.email,
//                 token: token
//               };
              
//               dispatch(setUserData(completeUserData));
              
//               // Save to storage
//               dispatch(saveUserToStorage(completeUserData));
              
//             } else {
              
//               // Fallback to route params if profile fetch fails
//               const fallbackUserData = {
//                 mobileNumber: mobileNumber,
//                 token: token
//               };
              
//               if (fullName) {
//                 fallbackUserData.fullName = fullName;
//               }
              
//               dispatch(setUserData(fallbackUserData));
//               dispatch(saveUserToStorage(fallbackUserData));
//             }
//           } catch (profileError) {
//             console.error('💥 VerificationScreen: Error fetching user profile:', profileError);
            
//             // Fallback to route params if profile fetch fails
//             const fallbackUserData = {
//               mobileNumber: mobileNumber,
//               token: token
//             };
            
//             if (fullName) {
//               fallbackUserData.fullName = fullName;
//             }
            
//             dispatch(setUserData(fallbackUserData));
//             dispatch(saveUserToStorage(fallbackUserData));
//           }
//         } else {
          
//           // No token, use route params only
//           const fallbackUserData = {};
          
//           if (fullName) {
//             fallbackUserData.fullName = fullName;
//           }
//           if (mobileNumber) {
//             fallbackUserData.mobileNumber = mobileNumber;
//           }
          
//           if (Object.keys(fallbackUserData).length > 0) {
//             dispatch(setUserData(fallbackUserData));
//             dispatch(saveUserToStorage(fallbackUserData));
//           }
//         }
        
//         // OTP verified successfully, navigate to Home
//         navigation.navigate('Home');
//       } else {
        
//         // Check if user needs to register
        
//         if (result.message?.includes('not registered') || 
//             result.message?.includes('Mobile number not registered') ||
//             result.message?.includes('not verified') ||
//             result.message?.includes('User not found')) {
          
//           Alert.alert(
//             'Mobile Number Not Registered',
//             'This mobile number is not registered. Please complete your registration.',
//             [
//               {
//                 text: 'OK',
//                 onPress: () => {
                  
//                   // Navigate to Register screen with mobile number
//                   navigation.navigate('Register', { mobileNumber: mobileNumber });
//                 }
//               }
//             ]
//           );
//         } else {
//           // Show error message for other failures
//           Alert.alert('Error', result.message || 'OTP verification failed. Please try again.');
//         }
//       }
//     } catch (error) {
//       console.error('💥 VerificationScreen: OTP verification error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
//       {/* Back Button */}
//       <TouchableOpacity 
//         style={styles.backButton}
//         onPress={() => navigation.goBack()}
//       >
//         <Icon name="chevron-back" size={20} color="#FF8800" />
//       </TouchableOpacity>

//       <ScrollView 
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollContent}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//           <View style={styles.content}>
//             {/* Verification Icon */}
//             <View style={styles.iconContainer}>
//               <Image
//                 source={tickmarkIcon}
//                 style={styles.tickmarkImage}
//                 resizeMode="contain"
//               />
//             </View>

//             <Text style={styles.title}>
//               {isEmailVerification ? 'Verify Email OTP' : 'Verify OTP'}
//             </Text>
//             <Text style={styles.subtitle}>
//               Enter the OTP sent to {isEmailVerification ? email : mobileNumber} 
//             </Text>

//             {/* OTP Input Fields */}
//             <View style={styles.otpContainer}>
//               {otp.map((digit, index) => (
//                 <TextInput
//                   key={index}
//                   style={[
//                     styles.otpInput,
//                     digit && styles.otpInputFilled,
//                     index === 5 && digit && styles.otpInputActive
//                   ]}
//                   keyboardType="numeric"
//                   maxLength={1}
//                   value={digit}
//                   onChangeText={(value) => handleOtpChange(index, value)}
//                   onKeyPress={(e) => handleKeyPress(index, e)}
//                   ref={(ref) => (otpRefs.current[index] = ref)}
//                 />
//               ))}
//             </View>

//             {/* Resend OTP Section */}
//             <View style={styles.resendContainer}>
//               <Text style={styles.resendText}>
//                 Didn't you receive the OTP?
//               </Text>
//               <View style={styles.resendActionContainer}>
//                 {resendTimer > 0 ? (
//                   <Text style={styles.resendLinkDisabled}>Resend OTP</Text>
//                 ) : (
//                   <TouchableOpacity onPress={handleResendOTP} disabled={isResending}>
//                     <Text style={styles.resendLink}>
//                       {isResending ? 'Resending...' : 'Resend OTP'}
//                     </Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//               {resendTimer > 0 && (
//                 <View style={styles.timerContainer}>
//                   <Icon name="time-outline" size={14} color="#FF8800" />
//                   <Text style={styles.timerText}>
//                     {Math.floor(resendTimer / 60).toString().padStart(2, '0')}:{(resendTimer % 60).toString().padStart(2, '0')}
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </View>
//         </TouchableWithoutFeedback>
//       </ScrollView>

//       {/* Fixed Button Container */}
//       <View style={styles.buttonContainer}>
//         <LinearGradient
//           colors={['#FF9800', '#FFB300']}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//           style={styles.button}
//         >
//           <TouchableOpacity
//             onPress={isEmailVerification ? handleVerifyEmailOTP : handleVerifyOTP}
//             style={styles.buttonTouchable}
//             disabled={isLoading}
//           >
//             <Text style={styles.buttonText}>
//               {isLoading ? 'Verifying...' : (isEmailVerification ? 'Verify Email OTP' : 'Verify OTP')}
//             </Text>
//           </TouchableOpacity>
//         </LinearGradient>
//       </View>
//     </View>
//   );
// };

// export default VerificationScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   backButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     left: 20,
//     zIndex: 10,
//     padding: 10,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingBottom: 20,
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//     paddingHorizontal: 30,
//     paddingTop: 100,
//     paddingBottom: 20,
//   },
//   iconContainer: {
//     marginBottom: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   tickmarkImage: {
//     width: 60,
//     height: 60,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 30,
//   },
//   otpContainer: {
//     flexDirection: 'row',
//     justifyContent:'center',
//     gap:10,
//     width: '100%',
//     marginBottom: 25,
//   },
//   otpInput: {
//     width: 40,
//     height: 40,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     borderRadius: 10,
//     textAlignVertical: 'center',
//     textAlign: 'center',
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#FF8800',
//     backgroundColor: '#F8F8F8',
//     paddingVertical: 0,
//     paddingHorizontal: 0,
//     includeFontPadding: false,
//   },
//   otpInputFilled: {
//     backgroundColor: '#FFF3E0',
//     borderColor: '#FFB800',
//   },
//   otpInputActive: {
//     backgroundColor: '#fff',
//     borderColor: '#FF8800',
//     borderWidth: 2,
//   },
//   resendContainer: {
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   resendText: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   resendActionContainer: {
//     marginBottom: 12,
//   },
//   resendLink: {
//     color: '#FF8800',
//     fontWeight: '600',
//     fontSize: 14,
//     textDecorationLine: 'underline',
//   },
//   resendLinkDisabled: {
//     color: '#999',
//     fontWeight: '600',
//     fontSize: 14,
//     textDecorationLine: 'underline',
//   },
//   timerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF3E0',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#FFE0B2',
//   },
//   clockImage: {
//     width: 14,
//     height: 14,
//     tintColor: '#FF8800',
//   },
//   timerText: {
//     fontSize: 12,
//     color: '#FF8800',
//     fontWeight: '600',
//     marginLeft: 4,
//   },

//   buttonContainer: {
//     position: 'absolute',
//     bottom: Platform.OS === 'ios' ? 40 : 20,
//     left: 40,
//     right: 40,
//     zIndex: 10,
//   },
//   button: {
//     width: '100%',
//     borderRadius: 15,
//     paddingVertical: 16,
//   },
//   buttonTouchable: {
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });




//  code by sonu


import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState, useEffect } from 'react';
import { authAPI } from '../API/authAPI';
import { profileAPI } from '../API/profileAPI';
import { useAppDispatch } from '../Redux/hooks';
import { setUserData, saveUserToStorage, setProfileData } from '../Redux/userSlice';
import store from '../Redux/store';
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
    console.log('🔥 VerificationScreen: Component mounted');
    console.log('📱 VerificationScreen: Mobile number:', mobileNumber);
    console.log('👤 VerificationScreen: Full name:', fullName);
    console.log('🆔 VerificationScreen: Verification ID:', verificationId);
    console.log('📝 VerificationScreen: Is from register:', isFromRegister);
    console.log('📝 VerificationScreen: Is from login:', isFromLogin);
    console.log('📧 VerificationScreen: Is email verification:', isEmailVerification);
    
    // Debug: Log which flow we're in
    
    // Test dispatch - only run once
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
      // Mobile OTP resend (existing logic)
      console.log('📱 handleResendOTP: Mobile OTP resend flow');
      
      setIsResending(true);
      
      try {
        console.log('📡 handleResendOTP: Calling authAPI.resendOTP...');
        const result = await authAPI.resendOTP(mobileNumber);
        console.log('📡 handleResendOTP: Resend result:', result);
        
        if (result.success) {
          console.log('✅ handleResendOTP: OTP resent successfully!');
          // Reset timer to 45 seconds
          setResendTimer(45);
          // Clear OTP fields
          setOtp(['', '', '', '', '', '']);
          // Focus on first OTP field
          otpRefs.current[0]?.focus();
        } else {
          console.log('❌ handleResendOTP: OTP resend failed:', result.data?.message);
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
      return;
    }

    console.log('🔥 handleVerifyOTP: Starting OTP verification...');
    console.log('📱 handleVerifyOTP: Mobile number:', mobileNumber);
    console.log('🔢 handleVerifyOTP: OTP:', otpString);
    console.log('🆔 handleVerifyOTP: Verification ID:', verificationId);
    console.log('📝 handleVerifyOTP: Is from register:', isFromRegister);
    console.log('📝 handleVerifyOTP: Is from login:', isFromLogin);

    setIsLoading(true);
    
    try {
      // Use the appropriate API based on the flow
      let result;
      if (isFromRegister) {
        console.log('📡 handleVerifyOTP: Using register flow verification...');
        result = await authAPI.verifyOTP(mobileNumber, otpString, verificationId);
      } else if (isFromLogin) {
        console.log('📡 handleVerifyOTP: Using login flow verification...');
        result = await authAPI.verifyOTP(mobileNumber, otpString, verificationId);
      } else {
        console.log('📡 handleVerifyOTP: Using default flow verification...');
        result = await authAPI.verifyOTP(mobileNumber, otpString, verificationId);
      }
      
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
       
        
        if (result.message?.includes('not registered') || 
            result.message?.includes('Mobile number not registered') ||
            result.message?.includes('not verified') ||
            result.message?.includes('User not found')) {
        
          // Direct navigation to Register screen without alert
          navigation.navigate('Register', { mobileNumber: mobileNumber });
         
        } else {
          // Show error message for other failures
          Alert.alert('Error', result.message || 'OTP verification failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('💥 VerificationScreen: OTP verification error:', error);
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