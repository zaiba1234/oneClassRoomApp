// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   Dimensions,
//   TouchableOpacity,
//   StatusBar,
//   SafeAreaView,
//   ScrollView,
//   Alert,
//   RefreshControl,
//   ActivityIndicator,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import LinearGradient from 'react-native-linear-gradient';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { useAppSelector } from '../Redux/hooks';
// import { getApiUrl, API_CONFIG } from '../API/config';
// import { courseAPI } from '../API/courseAPI';
// import { RAZORPAY_KEY_ID } from '../config/env';

// // Custom Razorpay implementation using WebView - EXACT SAME AS ENROLLSCREEN
// let RazorpayCheckout = null;
// let RazorpayImportError = null;

// // Create a custom RazorpayCheckout class that uses WebView - EXACT SAME AS ENROLLSCREEN
// class CustomRazorpayCheckout {
//   constructor(navigation) {
//     console.log('🔧 CustomRazorpayCheckout: Constructor called with navigation:', !!navigation);
//     this.navigation = navigation;
//   }
  
//   open(options) {
//     console.log('🔧 CustomRazorpayCheckout.open: Called with options:', JSON.stringify(options, null, 2));
//     return new Promise((resolve, reject) => {
//       console.log('🔧 CustomRazorpayCheckout.open: Promise created, storing callbacks globally');
//       // Store the options and callbacks globally so WebView can access them
//       global.razorpayOptions = options;
//       global.razorpayResolve = resolve;
//       global.razorpayReject = reject;
      
//       console.log('🔧 CustomRazorpayCheckout.open: Navigating to RazorpayPayment screen');
//       // Navigate to Razorpay payment screen
//       this.navigation.navigate('RazorpayPayment', { options });
//     });
//   }
// }

// console.log('✅ InternshipLetterScreen: Custom RazorpayCheckout class created successfully');

// const { width, height } = Dimensions.get('window');

// // Responsive dimensions
// const getResponsiveSize = (size) => {
//   const scale = Math.min(width, height) / 375; // Base width
//   return Math.round(size * scale);
// };

// const InternshipLetterScreen = () => {
//   console.log('🚀 InternshipLetterScreen: Component initialized');
  
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { token } = useAppSelector((state) => state.user);
//   const [isRequesting, setIsRequesting] = useState(false);
//   const [requestData, setRequestData] = useState(null);
//   const [courseData, setCourseData] = useState(null);
//   const [isLoadingCourse, setIsLoadingCourse] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [isPageRefreshing, setIsPageRefreshing] = useState(false);
  
//   console.log('🔍 InternshipLetterScreen: Initial state values:', {
//     hasNavigation: !!navigation,
//     hasRoute: !!route,
//     hasToken: !!token,
//     courseId: route.params?.courseId
//   });
  
//   // Create RazorpayCheckout instance with navigation - EXACT SAME AS ENROLLSCREEN
//   const [razorpayCheckout] = useState(() => {
//     console.log('🔧 InternshipLetterScreen: Creating RazorpayCheckout instance');
//     const instance = new CustomRazorpayCheckout(navigation);
//     console.log('🔧 InternshipLetterScreen: RazorpayCheckout instance created:', !!instance);
//     return instance;
//   });

//   // Get courseId from route params
//   const courseId = route.params?.courseId;
//   console.log('🔍 InternshipLetterScreen: courseId from route params:', courseId);

//   // Function to get user profile data (same as EnrollScreen)
//   const getUserProfileData = () => {
//     console.log('👤 InternshipLetterScreen: getUserProfileData called');
//     return {
//       email: 'student@learningsaint.com',
//       contact: '9876543210',
//       name: 'Student Name'
//     };
//   };

//   // Fetch course details when component mounts
//   useEffect(() => {
//     console.log('🔄 InternshipLetterScreen: useEffect triggered for fetchCourseDetails');
//     console.log('🔄 InternshipLetterScreen: courseId:', courseId, 'token:', !!token);
//     console.log('🔄 InternshipLetterScreen: Navigation params:', route.params);
    
//     if (courseId && token) {
//       console.log('✅ InternshipLetterScreen: Conditions met, calling fetchCourseDetails');
//       fetchCourseDetails();
      
//       // Check if we have uploadStatus from navigation params
//       if (route.params?.uploadStatus) {
//         console.log('🔄 InternshipLetterScreen: Found uploadStatus from navigation:', route.params.uploadStatus);
//         // Create a mock requestData structure with the uploadStatus
//         const mockData = {
//           internshipLetter: {
//             uploadStatus: route.params.uploadStatus,
//             paymentStatus: true,
//             _id: 'temp-id'
//           }
//         };
//         console.log('🔄 InternshipLetterScreen: Setting requestData from navigation:', JSON.stringify(mockData, null, 2));
//         setRequestData(mockData);
//       }
//     } else {
//       console.log('❌ InternshipLetterScreen: Conditions not met - courseId:', !!courseId, 'token:', !!token);
//     }
//   }, [courseId, token, route.params]);

//   // Separate useEffect to handle navigation params changes
//   useEffect(() => {
//     console.log('🔄 InternshipLetterScreen: Navigation params changed:', route.params);
//     if (route.params?.uploadStatus) {
//       console.log('🔄 InternshipLetterScreen: Updating requestData with new uploadStatus:', route.params.uploadStatus);
//       const mockData = {
//         internshipLetter: {
//           uploadStatus: route.params.uploadStatus,
//           paymentStatus: true,
//           _id: 'temp-id'
//         }
//       };
//       console.log('🔄 InternshipLetterScreen: Setting mockData:', JSON.stringify(mockData, null, 2));
//       setRequestData(mockData);
//     }
//   }, [route.params?.uploadStatus]);

//   // Function to fetch course details
//   const fetchCourseDetails = async () => {
//     console.log('📚 InternshipLetterScreen: fetchCourseDetails called');
//     try {
//       console.log('📚 InternshipLetterScreen: Setting isLoadingCourse to true');
//       setIsLoadingCourse(true);
      
//       console.log('📚 InternshipLetterScreen: Calling courseAPI.getAllCourses with token:', !!token);
//       const result = await courseAPI.getAllCourses(token);
//       console.log('📚 InternshipLetterScreen: API response received:', JSON.stringify(result, null, 2));
      
//       if (result.success && result.data.success) {
//         console.log('✅ InternshipLetterScreen: API call successful');
//         const apiCourses = result.data.data;
//         console.log('📚 InternshipLetterScreen: Total courses received:', apiCourses.length);
        
//         const currentCourse = apiCourses.find(course => course._id === courseId);
//         console.log('🔍 InternshipLetterScreen: Current course found:', !!currentCourse);
        
//         if (currentCourse) {
//           console.log('✅ InternshipLetterScreen: Setting courseData:', JSON.stringify(currentCourse, null, 2));
//           setCourseData(currentCourse);
//         } else {
//           console.log('❌ InternshipLetterScreen: Course not found in API response');
//         }
//       } else {
//         console.log('❌ InternshipLetterScreen: API call failed:', result.message);
//       }
//     } catch (error) {
//       console.error('💥 InternshipLetterScreen: Error in fetchCourseDetails:', error);
//     } finally {
//       console.log('📚 InternshipLetterScreen: Setting isLoadingCourse to false');
//       setIsLoadingCourse(false);
//     }
//   };

//   // Function to handle refresh
//   const handleRefresh = async () => {
//     console.log('🔄 InternshipLetterScreen: handleRefresh called');
//     setIsRefreshing(true);
//     try {
//       await fetchCourseDetails();
//     } catch (error) {
//       console.error('💥 InternshipLetterScreen: Error during refresh:', error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   // Function to handle page refresh (full page reload)
//   const handlePageRefresh = async () => {
//     console.log('🔄 InternshipLetterScreen: handlePageRefresh called');
//     setIsPageRefreshing(true);
//     try {
//       await fetchCourseDetails();
//       setTimeout(() => setIsPageRefreshing(false), 1000);
//     } catch (error) {
//       console.error('💥 InternshipLetterScreen: Error during page refresh:', error);
//       setIsPageRefreshing(false);
//     }
//   };



//   // Function to check internship status before proceeding with payment
//   const checkInternshipStatus = async () => {
//     console.log('🔍 InternshipLetterScreen: checkInternshipStatus called');
//     console.log('🔍 InternshipLetterScreen: courseId:', courseId);
//     console.log('🔑 InternshipLetterScreen: token:', token ? token.substring(0, 30) + '...' : 'No token');
    
//     try {
//       // Build the check status API URL with courseId as query parameter
//       const checkStatusUrl = getApiUrl(`/api/user/internshipLetter/check-internshipStatus/${courseId}`);
//       console.log('🌐 InternshipLetterScreen: Check status API URL:', checkStatusUrl);
      
//       console.log('🔍 InternshipLetterScreen: Making GET request to check internship status...');
//       const response = await fetch(checkStatusUrl, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
      
//       console.log('📡 InternshipLetterScreen: Check status response received - status:', response.status, response.statusText);
      
//       const result = await response.json();
//       console.log('📄 InternshipLetterScreen: Check status response parsed:', JSON.stringify(result, null, 2));
      
//       if (response.ok && result.success) {
//         console.log('✅ InternshipLetterScreen: Check status API call successful');
//         console.log('🔍 InternshipLetterScreen: isEnrolled flag:', result.data?.isEnrolled);
        
//         if (result.data?.isEnrolled === true) {
//           console.log('✅ InternshipLetterScreen: User is already enrolled, skipping Razorpay payment');
//           Alert.alert(
//             'Already Enrolled',
//             'You are already enrolled for this internship letter!',
//             [{ text: 'OK' }]
//           );
//           return { isEnrolled: true };
//         } else {
//           console.log('❌ InternshipLetterScreen: User is not enrolled, proceeding with Razorpay payment');
//           return { isEnrolled: false };
//         }
//       } else {
//         console.log('❌ InternshipLetterScreen: Check status API call failed - response.ok:', response.ok, 'result.success:', result.success);
//         console.log('❌ InternshipLetterScreen: Error message:', result.message);
//         Alert.alert(
//           'Status Check Failed',
//           result.message || 'Failed to check internship status',
//           [{ text: 'OK' }]
//         );
//         return { isEnrolled: false, error: true };
//       }
//     } catch (error) {
//       console.error('💥 InternshipLetterScreen: Error in checkInternshipStatus:', error);
//       Alert.alert(
//         'Error',
//         'Network error occurred while checking internship status',
//         [{ text: 'OK' }]
//       );
//       return { isEnrolled: false, error: true };
//     }
//   };

//   // Function to request internship letter from API
//   const requestInternshipLetter = async () => {
//     console.log('🎯 InternshipLetterScreen: requestInternshipLetter called');
//     try {
//       console.log('🎯 InternshipLetterScreen: Setting isRequesting to true');
//       setIsRequesting(true);
      
//       // First, check internship status
//       console.log('🔍 InternshipLetterScreen: Step 1 - Checking internship status...');
//       const statusCheck = await checkInternshipStatus();
//       console.log('🔍 InternshipLetterScreen: Status check result:', JSON.stringify(statusCheck, null, 2));
      
//       if (statusCheck.error) {
//         console.log('❌ InternshipLetterScreen: Status check failed, stopping process');
//         return;
//       }
      
//       if (statusCheck.isEnrolled) {
//         console.log('✅ InternshipLetterScreen: User already enrolled, stopping process');
//         return;
//       }
      
//       // If not enrolled, proceed with Razorpay payment
//       console.log('🎯 InternshipLetterScreen: Step 2 - User not enrolled, proceeding with Razorpay payment...');
      
//       console.log('🎯 InternshipLetterScreen: Building API URL');
//       const apiUrl = getApiUrl('/api/user/internshipLetter/request-InternshipLetter');
//       console.log('🌐 InternshipLetterScreen: API URL:', apiUrl);
      
//       console.log('🎯 InternshipLetterScreen: Preparing request body with courseId:', courseId);
//       const requestBody = {
//         courseId: courseId
//       };
//       console.log('📦 InternshipLetterScreen: Request body:', JSON.stringify(requestBody, null, 2));
      
//       console.log('🎯 InternshipLetterScreen: Making API call...');
//       const response = await fetch(apiUrl, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody)
//       });
      
//       console.log('📡 InternshipLetterScreen: API response received - status:', response.status, response.statusText);
      
//       const result = await response.json();
//       console.log('📄 InternshipLetterScreen: API response parsed:', JSON.stringify(result, null, 2));
      
//       if (response.ok && result.success && result.data) {
//         console.log('✅ InternshipLetterScreen: API call successful, setting requestData');
//         console.log('🔍 InternshipLetterScreen: Setting requestData with:', JSON.stringify(result.data, null, 2));
//         setRequestData(result.data);
        
//         console.log('🎯 InternshipLetterScreen: Calling openRazorpayPayment with result.data');
//         console.log('🔍 InternshipLetterScreen: Passing data to openRazorpayPayment:', JSON.stringify(result.data, null, 2));
//         // After successful request, open Razorpay payment
//         openRazorpayPayment(result.data);
//       } else {
//         console.log('❌ InternshipLetterScreen: API call failed - response.ok:', response.ok, 'result.success:', result.success);
//         Alert.alert(
//           'Request Failed',
//           result.message || 'Failed to request internship letter',
//           [{ text: 'OK' }]
//         );
//       }
//     } catch (error) {
//       console.error('💥 InternshipLetterScreen: Error in requestInternshipLetter:', error);
//       Alert.alert(
//         'Error',
//         'Network error occurred while requesting internship letter',
//         [{ text: 'OK' }]
//       );
//     } finally {
//       console.log('🎯 InternshipLetterScreen: Setting isRequesting to false');
//       setIsRequesting(false);
//     }
//   };

//   // Function to open Razorpay payment interface - EXACT SAME AS ENROLLSCREEN
//   const openRazorpayPayment = async (requestData) => {
//     console.log('🔍 InternshipLetterScreen: openRazorpayPayment called');
//     try {
//       console.log('🔍 InternshipLetterScreen: Opening Razorpay Payment with data:', JSON.stringify(requestData, null, 2));
//       console.log('🔍 InternshipLetterScreen: Internship Letter Data:', JSON.stringify(requestData.internshipLetter, null, 2));
//       console.log('🔍 InternshipLetterScreen: Razorpay Order Data:', JSON.stringify(requestData.razorpayOrder, null, 2));
      
//       if (requestData.internshipLetter && requestData.internshipLetter.razorpayOrderId) {
//         console.log('✅ InternshipLetterScreen: Found internship letter data with order ID');
        
//         // Use the EXACT SAME logic as EnrollScreen.js
//         // The API should return the same structure as courseAPI.createCourseOrder
//         const orderData = {
//           key: RAZORPAY_KEY_ID, // Use the live Razorpay key from env config
//           amount: requestData.internshipLetter.paymentAmount * 100, // Convert to paise
//           currency: requestData.internshipLetter.paymentCurrency || 'INR',
//           orderId: requestData.internshipLetter.razorpayOrderId,
//         };
        
//         console.log('🔑 InternshipLetterScreen: Using Razorpay key from env config:', RAZORPAY_KEY_ID);
//         console.log('🔍 InternshipLetterScreen: Order Data prepared (same as EnrollScreen):', JSON.stringify(orderData, null, 2));
        
//         // Validate order data (key will come from frontend config)
//         if (!orderData.amount || !orderData.orderId) {
//           console.log('❌ InternshipLetterScreen: Invalid order data received:', orderData);
//           Alert.alert('Error', 'Invalid payment data received. Please try again.');
//           return;
//         }
        
//         // Open Razorpay payment interface using the same method as EnrollScreen
//         console.log('🔍 InternshipLetterScreen: Calling handlePaymentWithRazorpay');
//         const paymentData = await handlePaymentWithRazorpay(orderData);
        
//         if (!paymentData) {
//           return; // Payment was cancelled or failed
//         }
        
//         // Handle successful payment
//         console.log('✅ InternshipLetterScreen: Payment successful, calling handleSuccessfulPayment');
//         await handleSuccessfulPayment(paymentData, requestData.internshipLetter.razorpayOrderId, requestData);
        
//       } else {
        
//         if (requestData.internshipLetter) {
//           console.log('❌ InternshipLetterScreen: Available fields in internshipLetter:', Object.keys(requestData.internshipLetter));
//         }
//         if (requestData.razorpayOrder) {
//           console.log('❌ InternshipLetterScreen: Available fields in razorpayOrder:', Object.keys(requestData.razorpayOrder));
//         }
//         Alert.alert('Error', 'No payment order found. Please try again.');
//       }
//     } catch (error) {
//       console.error('💥 InternshipLetterScreen: Error in openRazorpayPayment:', error);
//       Alert.alert('Error', 'Failed to open payment interface. Please try again.');
//     }
//   };

//   // Function to handle payment with Razorpay - EXACT SAME AS ENROLLSCREEN
//   const handlePaymentWithRazorpay = async (orderData) => {
   
    
//     if (!razorpayCheckout || typeof razorpayCheckout.open !== 'function') {
//       console.log('❌ InternshipLetterScreen: Razorpay not available');
//       Alert.alert('Error', 'Razorpay payment gateway is not available. Please try again later.');
//       return null;
//     }

//     try {
//       console.log('💳 InternshipLetterScreen: Opening Razorpay payment interface...');
//       console.log('🔑 InternshipLetterScreen: Using Razorpay key from frontend config:', RAZORPAY_KEY_ID ? RAZORPAY_KEY_ID.substring(0, 20) + '...' : 'Not found');
      
//       // Validate Razorpay key is available
//       if (!RAZORPAY_KEY_ID) {
//         console.log('❌ InternshipLetterScreen: Razorpay key not found in frontend config');
//         Alert.alert('Error', 'Razorpay configuration not found. Please contact support.');
//         return null;
//       }
      
//       const userProfile = getUserProfileData();
//       console.log('👤 InternshipLetterScreen: User profile data:', JSON.stringify(userProfile, null, 2));
      
//       const razorpayOptions = {
//         key: orderData.key,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         name: 'Learning Saint',
//         description: 'Internship Letter Payment',
//         order_id: orderData.orderId,
//         prefill: {
//           email: userProfile.email,
//           contact: userProfile.contact,
//           name: userProfile.name
//         },
//         theme: {
//           color: '#FF6B35'
//         },
//         modal: {
//           ondismiss: () => {
//             console.log('🔒 InternshipLetterScreen: Razorpay modal dismissed');
//           }
//         }
//       };
      
//       console.log('🎨 InternshipLetterScreen: Razorpay options configured:', JSON.stringify(razorpayOptions, null, 2));
//       console.log('🔍 InternshipLetterScreen: About to call razorpayCheckout.open with options:', JSON.stringify(razorpayOptions, null, 2));
      
//       const paymentData = await razorpayCheckout.open(razorpayOptions);
//       console.log('✅ InternshipLetterScreen: Payment successful:', JSON.stringify(paymentData, null, 2));
//       return paymentData;
//     } catch (razorpayError) {
//       console.log('❌ InternshipLetterScreen: Razorpay error:', razorpayError);
      
//       if (razorpayError.message === 'PAYMENT_CANCELLED') {
//         throw new Error('PAYMENT_CANCELLED');
//       } else if (razorpayError.message === 'PAYMENT_FAILED') {
//         throw new Error('PAYMENT_FAILED');
//       } else {
//         throw new Error('Razorpay payment failed. Please try again.');
//       }
//     }
//   };

//   // Function to handle successful payment
//   const handleSuccessfulPayment = async (paymentData, orderId, internshipLetterData = null) => {
//     console.log('🎉 InternshipLetterScreen: handleSuccessfulPayment called');
//     try {
//       console.log('🎉 InternshipLetterScreen: Payment data received:', JSON.stringify(paymentData, null, 2));
//       console.log('🎉 InternshipLetterScreen: Order ID:', orderId);
//       console.log('🎉 InternshipLetterScreen: Current requestData:', JSON.stringify(requestData, null, 2));
//       console.log('🎉 InternshipLetterScreen: Passed internshipLetterData:', JSON.stringify(internshipLetterData, null, 2));
      
//       // Use passed data or fallback to requestData
//       const dataToUse = internshipLetterData || requestData;
//       console.log('🎉 InternshipLetterScreen: Using data for verification:', JSON.stringify(dataToUse, null, 2));
      
//       // Verify payment with backend using the correct structure
//       const verificationUrl = getApiUrl('/api/user/internshipLetter/verify-payment');
//       console.log('🌐 InternshipLetterScreen: Verification URL:', verificationUrl);
      
//       // Validate required data
//       const internshipLetterId = dataToUse?.internshipLetter?._id;
//       if (!internshipLetterId) {
//         console.log('❌ InternshipLetterScreen: Missing internshipLetterId');
//         console.log('❌ InternshipLetterScreen: Available data structure:', Object.keys(dataToUse || {}));
//         Alert.alert('Error', 'Missing internship letter ID. Please try again.');
//         return;
//       }
      
//       // Use the correct verification body structure as per your API requirements
//       const verificationBody = {
//         internshipLetterId: internshipLetterId, // Get _id from the request response
//         razorpayOrderId: orderId,
//         razorpayPaymentId: paymentData.razorpay_payment_id || paymentData.razorpayPaymentId,
//         razorpaySignature: paymentData.razorpay_signature || paymentData.razorpaySignature,
//         courseId: courseId // Use courseId instead of subcourseId
//       };
      
//       console.log('📦 InternshipLetterScreen: Verification request body (updated structure):', JSON.stringify(verificationBody, null, 2));
//       console.log('🔍 InternshipLetterScreen: Validation - internshipLetterId:', internshipLetterId);
//       console.log('🔍 InternshipLetterScreen: Validation - razorpayOrderId:', orderId);
//       console.log('🔍 InternshipLetterScreen: Validation - courseId:', courseId);
      
//       const verificationResponse = await fetch(verificationUrl, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(verificationBody),
//       });
      
//       console.log('📡 InternshipLetterScreen: Verification response status:', verificationResponse.status, verificationResponse.statusText);
      
//       if (verificationResponse.ok) {
//         const verificationResult = await verificationResponse.json();
//         console.log('📄 InternshipLetterScreen: Verification result:', JSON.stringify(verificationResult, null, 2));
        
//         if (verificationResult.success) {
//           console.log('✅ InternshipLetterScreen: Payment verification successful');
          
//           // Update requestData with the latest information from verification response
//           if (verificationResult.data) {
//             console.log('🔄 InternshipLetterScreen: Updating requestData with verification response');
//             setRequestData(verificationResult.data);
//           }
          
//           Alert.alert(
//             'Success! 🎉',
//             'Payment successful! Your internship letter is being processed and will be available for download shortly.',
//             [{ 
//               text: 'OK',
//               onPress: () => {
//                 // Navigate back to Internship screen with uploadStatus to show updated button state
//                 console.log('✅ InternshipLetterScreen: Navigating back to Internship screen with uploadStatus');
//                 console.log('✅ InternshipLetterScreen: Verification result data:', JSON.stringify(verificationResult.data, null, 2));
                
//                 // Extract uploadStatus from the verification response
//                 const uploadStatus = verificationResult.data?.uploadStatus || 'upload';
//                 console.log('✅ InternshipLetterScreen: Extracted uploadStatus:', uploadStatus);
                
//                 navigation.navigate('Internship', { 
//                   courseId: courseId,
//                   uploadStatus: uploadStatus
//                 });
//               }
//             }]
//           );
//         } else {
//           console.log('❌ InternshipLetterScreen: Payment verification failed:', verificationResult.message);
//           Alert.alert('Error', 'Payment verification failed. Please contact support.');
//         }
//       } else {
//         console.log('❌ InternshipLetterScreen: Payment verification failed - response not ok');
//         const errorText = await verificationResponse.text();
//         console.log('❌ InternshipLetterScreen: Error response:', errorText);
//         Alert.alert('Error', 'Payment verification failed. Please contact support.');
//       }
//     } catch (error) {
//       console.error('💥 InternshipLetterScreen: Error in handleSuccessfulPayment:', error);
//       Alert.alert('Error', 'Failed to verify payment. Please contact support.');
//     }
//   };

//   const handleBackPress = () => {
//     console.log('⬅️ InternshipLetterScreen: handleBackPress called');
//     navigation.goBack();
//   };

//   const handleDownload = () => {
//     console.log('📥 InternshipLetterScreen: Download button pressed');
//     console.log('📜 InternshipLetterScreen: This function is not implemented yet');
//     // Add your download logic here
//   };

//   // Function to handle downloading the internship letter
//   const handleDownloadLetter = async () => {
//     try {
//       console.log('📥 InternshipLetterScreen: handleDownloadLetter called');
//       console.log('📥 InternshipLetterScreen: requestData:', JSON.stringify(requestData, null, 2));
      
//       if (!requestData?.internshipLetter?._id) {
//         console.log('❌ InternshipLetterScreen: No internship letter ID found');
//         Alert.alert('Error', 'Internship letter ID not found. Please try again.');
//         return;
//       }
      
//       // Build download URL (you'll need to update this based on your actual download endpoint)
//       const downloadUrl = getApiUrl(`/api/user/internshipLetter/download/${requestData.internshipLetter._id}`);
//       console.log('🌐 InternshipLetterScreen: Download URL:', downloadUrl);
      
//       // For now, show success message (you can implement actual download logic later)
//       Alert.alert(
//         'Download Started! 📥',
//         'Your internship letter download has started. Please check your downloads folder.',
//         [{ text: 'OK' }]
//       );
      
//       // TODO: Implement actual file download logic here
//       // This could involve using react-native-fs or similar library
      
//     } catch (error) {
//       console.error('💥 InternshipLetterScreen: Error in handleDownloadLetter:', error);
//       Alert.alert('Error', 'Failed to download internship letter. Please try again.');
//     }
//   };

//   console.log('🎨 InternshipLetterScreen: Rendering component');
//   console.log('🎨 InternshipLetterScreen: Current state:', {
//     isRequesting,
//     hasRequestData: !!requestData,
//     hasCourseData: !!courseData,
//     isLoadingCourse,
//     isRefreshing
//   });

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
//       {/* Page Refresh Loader Overlay */}
//       {isPageRefreshing && (
//         <View style={styles.pageRefreshOverlay}>
//           <View style={styles.pageRefreshContainer}>
//             <ActivityIndicator size="large" color="#FF8800" />
//             <Text style={styles.pageRefreshText}>Refreshing...</Text>
//           </View>
//         </View>
//       )}
      
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={handleBackPress}
//         >
//           <Icon name="chevron-back" size={getResponsiveSize(24)} color="#FF8800" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Internship Letter</Text>
//         <TouchableOpacity 
//           style={styles.refreshButton}
//           onPress={handlePageRefresh}
//           disabled={isPageRefreshing}
//         >
//           <Icon 
//             name="refresh" 
//             size={getResponsiveSize(20)} 
//             color={isPageRefreshing ? "#999" : "#FF8800"} 
//           />
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={handleRefresh}
//             colors={['#FF8800']}
//             tintColor="#FF8800"
//             title="Pull to refresh..."
//             titleColor="#666666"
//           />
//         }
//       >
//         {isLoadingCourse ? (
//           <View style={styles.mainLoadingContainer}>
//             <ActivityIndicator size="large" color="#FF8800" />
//             <Text style={styles.mainLoadingText}>Loading course details...</Text>
//           </View>
//         ) : courseData ? (
//           <>
//             {/* Congratulations Section */}
//             <View style={styles.congratulationsContainer}>
//               <Text style={styles.congratulationsText}>Congratulations</Text>
//               <Text style={styles.congratulationsSubtext}>For Completing Course</Text>
              
//               {/* Dynamic Course Name */}
//               <Text style={styles.courseNameText}>{courseData.courseName}</Text>
//             </View>

//             {/* Certificate Image */}
//             <View style={styles.certificateContainer}>
//               <Image 
//                 source={require('../assests/images/DownloadCertificate.png')} 
//                 style={styles.certificateImage}
//                 resizeMode="contain"
//               />
//             </View>

//             {/* Course Description */}
//             <View style={styles.descriptionContainer}>
//               <Text style={styles.descriptionText}>
//                 In this course you will learn how to build a space to a 3-dimensional product. There are 24 premium learning videos for you.
//               </Text>
//             </View>
//           </>
//         ) : (
//           <View style={styles.mainLoadingContainer}>
//             <Text style={styles.mainLoadingText}>Course not found</Text>
//             <TouchableOpacity style={styles.retryButton} onPress={fetchCourseDetails}>
//               <Text style={styles.retryButtonText}>Retry</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>

//       {/* Status Message and Download Button */}
//       <View style={styles.downloadButtonContainer}>
//         {/* Status Message */}
//         {requestData?.internshipLetter?.paymentStatus && requestData?.internshipLetter?.uploadStatus === 'upload' && (
//           <View style={styles.statusMessageContainer}>
//             <Text style={styles.statusMessageText}>
//               Internship Letter Underprocess you will be notified for download
//             </Text>
//           </View>
//         )}
        
//         {(() => {
//           const uploadStatus = requestData?.internshipLetter?.uploadStatus;
//           const paymentStatus = requestData?.internshipLetter?.paymentStatus;
          
//           console.log('🎨 InternshipLetterScreen: Button state - uploadStatus:', uploadStatus, 'paymentStatus:', paymentStatus);
//           console.log('🎨 InternshipLetterScreen: Full requestData:', JSON.stringify(requestData, null, 2));
//           console.log('🎨 InternshipLetterScreen: Navigation params:', JSON.stringify(route.params, null, 2));
          
//           // If payment is successful and letter is uploaded, show enabled download button
//           if (paymentStatus && uploadStatus === 'uploaded') {
//             return (
//               <TouchableOpacity 
//                 style={styles.downloadButton}
//                 onPress={() => {
//                   console.log('📥 InternshipLetterScreen: Download letter button pressed');
//                   handleDownloadLetter();
//                 }}
//               >
//                 <LinearGradient
//                   colors={['#FF8A00', '#FFB300']}
//                   style={styles.gradientButton}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 0 }}
//                 >
//                   <Text style={styles.downloadButtonText}>
//                     Internship
//                   </Text>
//                 </LinearGradient>
//               </TouchableOpacity>
//             );
//           }
          
//           // If payment is successful but letter is still being processed (upload status)
//           if (paymentStatus && uploadStatus === 'upload') {
//             return (
//               <TouchableOpacity 
//                 style={[styles.downloadButton, styles.downloadButtonDisabled]}
//                 disabled={true}
//               >
//                 <LinearGradient
//                   colors={['#FF8A00', '#FFB300']}
//                   style={styles.gradientButton}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 0 }}
//                 >
//                   <Text style={styles.downloadButtonText}>
//                     Internship
//                   </Text>
//                 </LinearGradient>
//               </TouchableOpacity>
//             );
//           }
          
//           // Default: Show payment button
//           return (
//             <TouchableOpacity 
//               style={[styles.downloadButton, (isRequesting || isLoadingCourse || !courseData) && styles.downloadButtonDisabled]}
//               onPress={() => {
//                 console.log('🔘 InternshipLetterScreen: Get Internship Letter button pressed');
//                 requestInternshipLetter();
//               }}
//               disabled={isRequesting || isLoadingCourse || !courseData}
//             >
//               <LinearGradient
//                 colors={['#FF8A00', '#FFB300']}
//                 style={styles.gradientButton}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//               >
//                 <Text style={styles.downloadButtonText}>
//                   Download
//                   {/* {isRequesting ? 'Processing...' : `Download ₹${requestData?.internshipLetter?.paymentAmount || 99}/-`} */}
//                 </Text>
//                 {requestData?.internshipLetter?.paymentAmount && (
//                   <Text style={styles.dynamicPriceText}>
//                     Dynamic Price: ₹{requestData.internshipLetter.paymentAmount} (from API)
//                   </Text>
//                 )}
//               </LinearGradient>
//             </TouchableOpacity>
//           );
//         })()}
//       </View>
//     </SafeAreaView>
//   );
// };

// export default InternshipLetterScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: getResponsiveSize(20),
//     paddingTop: getResponsiveSize(10),
//     paddingBottom: getResponsiveSize(15),
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E0E0E0',
//   },
//   backButton: {
//     padding: getResponsiveSize(8),
//   },
//   headerTitle: {
//     fontSize: getResponsiveSize(18),
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//   },
//   placeholder: {
//     width: getResponsiveSize(40),
//   },
//   scrollView: {
//     // flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     // paddingBottom: getResponsiveSize(20),
//   },
//   congratulationsContainer: {
//     alignItems: 'center',
//     // paddingTop: getResponsiveSize(40),
//     // paddingBottom: getResponsiveSize(10), // Reduced from 30 to 10
//   },
//   congratulationsText: {
//     fontSize: getResponsiveSize(36),
//     fontWeight: 'bold',
//     color: '#2285FA',
//     fontStyle: 'italic',
//     // marginBottom: getResponsiveSize(8),
//     textAlign: 'center',
//   },
//   congratulationsSubtext: {
//     fontSize: getResponsiveSize(16),
//     color: '#333',
//     fontWeight: '400',
//     textAlign: 'center',
//     marginBottom: getResponsiveSize(10),
//   },
//   courseNameText: {
//     fontSize: getResponsiveSize(20),
//     color: '#FF8800',
//     fontWeight: '600',
//     textAlign: 'center',
//     marginTop: getResponsiveSize(5),
//   },
//   courseNameLoading: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: getResponsiveSize(10),
//   },
//   courseNameLoadingText: {
//     fontSize: getResponsiveSize(14),
//     color: '#666',
//     marginLeft: getResponsiveSize(8),
//   },
//   courseNameError: {
//     fontSize: getResponsiveSize(16),
//     color: '#FF0000',
//     textAlign: 'center',
//     marginTop: getResponsiveSize(10),
//     fontStyle: 'italic',
//   },
//   mainLoadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: getResponsiveSize(100),
//   },
//   mainLoadingText: {
//     fontSize: getResponsiveSize(18),
//     color: '#666',
//     marginTop: getResponsiveSize(15),
//   },
//   courseNameErrorContainer: {
//     alignItems: 'center',
//     marginTop: getResponsiveSize(10),
//   },
//   retryButton: {
//     backgroundColor: '#FF8800',
//     paddingHorizontal: getResponsiveSize(20),
//     paddingVertical: getResponsiveSize(8),
//     borderRadius: getResponsiveSize(20),
//     marginTop: getResponsiveSize(10),
//   },
//   retryButtonText: {
//     color: '#FFFFFF',
//     fontSize: getResponsiveSize(14),
//     fontWeight: '600',
//   },
//   certificateContainer: {
//     alignItems: 'center',
//     // marginVertical: getResponsiveSize(10), // Added small margin to control gap
//   },
//   certificateImage: {
//     width: width - getResponsiveSize(-10),
//     height: getResponsiveSize(450),
//   },
//   descriptionContainer: {
//     paddingHorizontal: getResponsiveSize(20),
//     // marginTop: getResponsiveSize(10), // Reduced from potential larger gap
//   },
//   descriptionText: {
//     fontSize: getResponsiveSize(16),
//     color: '#333',
//     lineHeight: getResponsiveSize(24),
//     textAlign: 'center',
//     fontWeight: '400',
//   },
//   downloadButtonContainer: {
//     paddingHorizontal: getResponsiveSize(20),
//     paddingBottom: getResponsiveSize(30),
//     backgroundColor: '#fff',
//   },
//   downloadButton: {
//     borderRadius: getResponsiveSize(12),
//     overflow: 'hidden',
//     shadowColor: '#FF8A00',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   gradientButton: {
//     paddingVertical: getResponsiveSize(18),
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   downloadButtonText: {
//     color: '#fff',
//     fontSize: getResponsiveSize(18),
//     fontWeight: 'bold',
//   },
//   dynamicPriceText: {
//     color: '#FFFFFF',
//     fontSize: getResponsiveSize(12),
//     fontWeight: '400',
//     textAlign: 'center',
//     marginTop: getResponsiveSize(5),
//     opacity: 0.9,
//   },
//   downloadButtonDisabled: {
//     opacity: 0.7,
//   },
//   refreshButton: {
//     padding: getResponsiveSize(8),
//     width: getResponsiveSize(40),
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   pageRefreshOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     zIndex: 1000,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   pageRefreshContainer: {
//     backgroundColor: '#fff',
//     padding: getResponsiveSize(20),
//     borderRadius: getResponsiveSize(12),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   pageRefreshText: {
//     marginTop: getResponsiveSize(10),
//     fontSize: getResponsiveSize(16),
//     color: '#666',
//     fontWeight: '500',
//   },
//   statusMessageContainer: {
//     alignItems: 'center',
//     marginBottom: getResponsiveSize(15),
//     paddingHorizontal: getResponsiveSize(20),
//   },
//   statusMessageText: {
//     fontSize: getResponsiveSize(14),
//     color: '#666666',
//     textAlign: 'center',
//     fontStyle: 'italic',
//     lineHeight: getResponsiveSize(20),
//   },
// });




import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../Redux/hooks';
import { getApiUrl, API_CONFIG } from '../API/config';
import { courseAPI } from '../API/courseAPI';
import { RAZORPAY_KEY_ID } from '../config/env';

// Custom Razorpay implementation using WebView - EXACT SAME AS ENROLLSCREEN
let RazorpayCheckout = null;
let RazorpayImportError = null;

// Create a custom RazorpayCheckout class that uses WebView - EXACT SAME AS ENROLLSCREEN
class CustomRazorpayCheckout {
  constructor(navigation) {
    console.log('🔧 CustomRazorpayCheckout: Constructor called with navigation:', !!navigation);
    this.navigation = navigation;
  }
  
  open(options) {
    console.log('🔧 CustomRazorpayCheckout.open: Called with options:', JSON.stringify(options, null, 2));
    return new Promise((resolve, reject) => {
      console.log('🔧 CustomRazorpayCheckout.open: Promise created, storing callbacks globally');
      // Store the options and callbacks globally so WebView can access them
      global.razorpayOptions = options;
      global.razorpayResolve = resolve;
      global.razorpayReject = reject;
      
      console.log('🔧 CustomRazorpayCheckout.open: Navigating to RazorpayPayment screen');
      // Navigate to Razorpay payment screen
      this.navigation.navigate('RazorpayPayment', { options });
    });
  }
}

console.log('✅ InternshipLetterScreen: Custom RazorpayCheckout class created successfully');

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const InternshipLetterScreen = () => {
  console.log('🚀 InternshipLetterScreen: Component initialized');
  
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAppSelector((state) => state.user);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestData, setRequestData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPageRefreshing, setIsPageRefreshing] = useState(false);
  
  console.log('🔍 InternshipLetterScreen: Initial state values:', {
    hasNavigation: !!navigation,
    hasRoute: !!route,
    hasToken: !!token,
    courseId: route.params?.courseId
  });
  
  // Create RazorpayCheckout instance with navigation - EXACT SAME AS ENROLLSCREEN
  const [razorpayCheckout] = useState(() => {
    console.log('🔧 InternshipLetterScreen: Creating RazorpayCheckout instance');
    const instance = new CustomRazorpayCheckout(navigation);
    console.log('🔧 InternshipLetterScreen: RazorpayCheckout instance created:', !!instance);
    return instance;
  });

  // Get courseId from route params
  const courseId = route.params?.courseId;
  console.log('🔍 InternshipLetterScreen: courseId from route params:', courseId);

  // Function to get user profile data (same as EnrollScreen)
  const getUserProfileData = () => {
    console.log('👤 InternshipLetterScreen: getUserProfileData called');
    return {
      email: 'student@learningsaint.com',
      contact: '9876543210',
      name: 'Student Name'
    };
  };

  // Fetch course details when component mounts
  useEffect(() => {
    console.log('🔄 InternshipLetterScreen: useEffect triggered for fetchCourseDetails');
    console.log('🔄 InternshipLetterScreen: courseId:', courseId, 'token:', !!token);
    console.log('🔄 InternshipLetterScreen: Navigation params:', route.params);
    
    if (courseId && token) {
      console.log('✅ InternshipLetterScreen: Conditions met, calling fetchCourseDetails');
      fetchCourseDetails();
      
      // Check if we have uploadStatus from navigation params
      if (route.params?.uploadStatus) {
        console.log('🔄 InternshipLetterScreen: Found uploadStatus from navigation:', route.params.uploadStatus);
        // Create a mock requestData structure with the uploadStatus
        const mockData = {
          internshipLetter: {
            uploadStatus: route.params.uploadStatus,
            paymentStatus: true,
            _id: 'temp-id'
          }
        };
        console.log('🔄 InternshipLetterScreen: Setting requestData from navigation:', JSON.stringify(mockData, null, 2));
        setRequestData(mockData);
      }
    } else {
      console.log('❌ InternshipLetterScreen: Conditions not met - courseId:', !!courseId, 'token:', !!token);
    }
  }, [courseId, token, route.params]);

  // Separate useEffect to handle navigation params changes
  useEffect(() => {
    console.log('🔄 InternshipLetterScreen: Navigation params changed:', route.params);
    if (route.params?.uploadStatus) {
      console.log('🔄 InternshipLetterScreen: Updating requestData with new uploadStatus:', route.params.uploadStatus);
      const mockData = {
        internshipLetter: {
          uploadStatus: route.params.uploadStatus,
          paymentStatus: true,
          _id: 'temp-id'
        }
      };
      console.log('🔄 InternshipLetterScreen: Setting mockData:', JSON.stringify(mockData, null, 2));
      setRequestData(mockData);
    }
  }, [route.params?.uploadStatus]);

  // Function to fetch course details
  const fetchCourseDetails = async () => {
    console.log('📚 InternshipLetterScreen: fetchCourseDetails called');
    try {
      console.log('📚 InternshipLetterScreen: Setting isLoadingCourse to true');
      setIsLoadingCourse(true);
      
      console.log('📚 InternshipLetterScreen: Calling courseAPI.getAllCourses with token:', !!token);
      const result = await courseAPI.getAllCourses(token);
      console.log('📚 InternshipLetterScreen: API response received:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data.success) {
        console.log('✅ InternshipLetterScreen: API call successful');
        const apiCourses = result.data.data;
        console.log('📚 InternshipLetterScreen: Total courses received:', apiCourses.length);
        
        const currentCourse = apiCourses.find(course => course._id === courseId);
        console.log('🔍 InternshipLetterScreen: Current course found:', !!currentCourse);
        
        if (currentCourse) {
          console.log('✅ InternshipLetterScreen: Setting courseData:', JSON.stringify(currentCourse, null, 2));
          setCourseData(currentCourse);
        } else {
          console.log('❌ InternshipLetterScreen: Course not found in API response');
        }
      } else {
        console.log('❌ InternshipLetterScreen: API call failed:', result.message);
      }
    } catch (error) {
      console.error('💥 InternshipLetterScreen: Error in fetchCourseDetails:', error);
    } finally {
      console.log('📚 InternshipLetterScreen: Setting isLoadingCourse to false');
      setIsLoadingCourse(false);
    }
  };

  // Function to handle refresh
  const handleRefresh = async () => {
    console.log('🔄 InternshipLetterScreen: handleRefresh called');
    setIsRefreshing(true);
    try {
      await fetchCourseDetails();
    } catch (error) {
      console.error('💥 InternshipLetterScreen: Error during refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to handle page refresh (full page reload)
  const handlePageRefresh = async () => {
    console.log('🔄 InternshipLetterScreen: handlePageRefresh called');
    setIsPageRefreshing(true);
    try {
      await fetchCourseDetails();
      setTimeout(() => setIsPageRefreshing(false), 1000);
    } catch (error) {
      console.error('💥 InternshipLetterScreen: Error during page refresh:', error);
      setIsPageRefreshing(false);
    }
  };
  // Function to check internship status before proceeding with payment
  const checkInternshipStatus = async () => {
    console.log('🔍 InternshipLetterScreen: checkInternshipStatus called');
    console.log('🔍 InternshipLetterScreen: courseId:', courseId);
    console.log('🔑 InternshipLetterScreen: token:', token ? token.substring(0, 30) + '...' : 'No token');
    
    try {
      // Build the check status API URL with courseId as query parameter
      const checkStatusUrl = getApiUrl(`/api/user/internshipLetter/check-internshipStatus/${courseId}`);
      console.log('🌐 InternshipLetterScreen: Check status API URL:', checkStatusUrl);
      
      console.log('🔍 InternshipLetterScreen: Making GET request to check internship status...');
      const response = await fetch(checkStatusUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 InternshipLetterScreen: Check status response received - status:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('📄 InternshipLetterScreen: Check status response parsed:', JSON.stringify(result, null, 2));
      
      if (response.ok && result.success) {
        console.log('✅ InternshipLetterScreen: Check status API call successful');
        console.log('🔍 InternshipLetterScreen: isEnrolled flag:', result.data?.isEnrolled);
        
        if (result.data?.isEnrolled === true) {
          console.log('✅ InternshipLetterScreen: User is already enrolled, skipping Razorpay payment');
          Alert.alert(
            'Already Enrolled',
            'You are already enrolled for this internship letter!',
            [{ text: 'OK' }]
          );
          return { isEnrolled: true };
        } else {
          console.log('❌ InternshipLetterScreen: User is not enrolled, proceeding with Razorpay payment');
          return { isEnrolled: false };
        }
      } else {
        console.log('❌ InternshipLetterScreen: Check status API call failed - response.ok:', response.ok, 'result.success:', result.success);
        console.log('❌ InternshipLetterScreen: Error message:', result.message);
        Alert.alert(
          'Status Check Failed',
          result.message || 'Failed to check internship status',
          [{ text: 'OK' }]
        );
        return { isEnrolled: false, error: true };
      }
    } catch (error) {
      console.error('💥 InternshipLetterScreen: Error in checkInternshipStatus:', error);
      Alert.alert(
        'Error',
        'Network error occurred while checking internship status',
        [{ text: 'OK' }]
      );
      return { isEnrolled: false, error: true };
    }
  };

  // Function to request internship letter from API
  const requestInternshipLetter = async () => {
    console.log('🎯 InternshipLetterScreen: requestInternshipLetter called');
    try {
      console.log('🎯 InternshipLetterScreen: Setting isRequesting to true');
      setIsRequesting(true);
      
      // First, check internship status
      console.log('🔍 InternshipLetterScreen: Step 1 - Checking internship status...');
      const statusCheck = await checkInternshipStatus();
      console.log('🔍 InternshipLetterScreen: Status check result:', JSON.stringify(statusCheck, null, 2));
      
      if (statusCheck.error) {
        console.log('❌ InternshipLetterScreen: Status check failed, stopping process');
        return;
      }
      
      if (statusCheck.isEnrolled) {
        console.log('✅ InternshipLetterScreen: User already enrolled, stopping process');
        return;
      }
      
      // If not enrolled, proceed with Razorpay payment
      console.log('🎯 InternshipLetterScreen: Step 2 - User not enrolled, proceeding with Razorpay payment...');
      
      console.log('🎯 InternshipLetterScreen: Building API URL');
      const apiUrl = getApiUrl('/api/user/internshipLetter/request-InternshipLetter');
      console.log('🌐 InternshipLetterScreen: API URL:', apiUrl);
      
      console.log('🎯 InternshipLetterScreen: Preparing request body with courseId:', courseId);
      const requestBody = {
        courseId: courseId
      };
      console.log('📦 InternshipLetterScreen: Request body:', JSON.stringify(requestBody, null, 2));
      
      console.log('🎯 InternshipLetterScreen: Making API call...');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📡 InternshipLetterScreen: API response received - status:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('📄 InternshipLetterScreen: API response parsed:', JSON.stringify(result, null, 2));
      
      if (response.ok && result.success && result.data) {
        console.log('✅ InternshipLetterScreen: API call successful, setting requestData');
        console.log('🔍 InternshipLetterScreen: Setting requestData with:', JSON.stringify(result.data, null, 2));
        setRequestData(result.data);
        
        console.log('🎯 InternshipLetterScreen: Calling openRazorpayPayment with result.data');
        console.log('🔍 InternshipLetterScreen: Passing data to openRazorpayPayment:', JSON.stringify(result.data, null, 2));
        // After successful request, open Razorpay payment
        openRazorpayPayment(result.data);
      } else {
        console.log('❌ InternshipLetterScreen: API call failed - response.ok:', response.ok, 'result.success:', result.success);
        Alert.alert(
          'Request Failed',
          result.message || 'Failed to request internship letter',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('💥 InternshipLetterScreen: Error in requestInternshipLetter:', error);
      Alert.alert(
        'Error',
        'Network error occurred while requesting internship letter',
        [{ text: 'OK' }]
      );
    } finally {
      console.log('🎯 InternshipLetterScreen: Setting isRequesting to false');
      setIsRequesting(false);
    }
  };

  // Function to open Razorpay payment interface - EXACT SAME AS ENROLLSCREEN
  const openRazorpayPayment = async (requestData) => {
    console.log('🔍 InternshipLetterScreen: openRazorpayPayment called');
    try {
     
      
      if (requestData.internshipLetter && requestData.internshipLetter.razorpayOrderId) {
        console.log('✅ InternshipLetterScreen: Found internship letter data with order ID');
        
        // Use the EXACT SAME logic as EnrollScreen.js
        // The API should return the same structure as courseAPI.createCourseOrder
        const orderData = {
          key: RAZORPAY_KEY_ID, // Use the live Razorpay key from env config
          amount: requestData.internshipLetter.paymentAmount * 100, // Convert to paise
          currency: requestData.internshipLetter.paymentCurrency || 'INR',
          orderId: requestData.internshipLetter.razorpayOrderId,
        };
        
        console.log('🔑 InternshipLetterScreen: Using Razorpay key from env config:', RAZORPAY_KEY_ID);
        console.log('🔍 InternshipLetterScreen: Order Data prepared (same as EnrollScreen):', JSON.stringify(orderData, null, 2));
        
        // Validate order data (key will come from frontend config)
        if (!orderData.amount || !orderData.orderId) {
          console.log('❌ InternshipLetterScreen: Invalid order data received:', orderData);
          Alert.alert('Error', 'Invalid payment data received. Please try again.');
          return;
        }
        
        // Open Razorpay payment interface using the same method as EnrollScreen
        console.log('🔍 InternshipLetterScreen: Calling handlePaymentWithRazorpay');
        const paymentData = await handlePaymentWithRazorpay(orderData);
        
        if (!paymentData) {
          return; // Payment was cancelled or failed
        }
        
        // Handle successful payment
        console.log('✅ InternshipLetterScreen: Payment successful, calling handleSuccessfulPayment');
        await handleSuccessfulPayment(paymentData, requestData.internshipLetter.razorpayOrderId, requestData);
        
      } else {
        
        if (requestData.internshipLetter) {
          console.log('❌ InternshipLetterScreen: Available fields in internshipLetter:', Object.keys(requestData.internshipLetter));
        }
        if (requestData.razorpayOrder) {
          console.log('❌ InternshipLetterScreen: Available fields in razorpayOrder:', Object.keys(requestData.razorpayOrder));
        }
        Alert.alert('Error', 'No payment order found. Please try again.');
      }
    } catch (error) {
      console.error('💥 InternshipLetterScreen: Error in openRazorpayPayment:', error);
      Alert.alert('Error', 'Failed to open payment interface. Please try again.');
    }
  };

  // Function to handle payment with Razorpay - EXACT SAME AS ENROLLSCREEN
  const handlePaymentWithRazorpay = async (orderData) => {
   
    
    if (!razorpayCheckout || typeof razorpayCheckout.open !== 'function') {
      console.log('❌ InternshipLetterScreen: Razorpay not available');
      Alert.alert('Error', 'Razorpay payment gateway is not available. Please try again later.');
      return null;
    }

    try {
      console.log('💳 InternshipLetterScreen: Opening Razorpay payment interface...');
      console.log('🔑 InternshipLetterScreen: Using Razorpay key from frontend config:', RAZORPAY_KEY_ID ? RAZORPAY_KEY_ID.substring(0, 20) + '...' : 'Not found');
      
      // Validate Razorpay key is available
      if (!RAZORPAY_KEY_ID) {
        console.log('❌ InternshipLetterScreen: Razorpay key not found in frontend config');
        Alert.alert('Error', 'Razorpay configuration not found. Please contact support.');
        return null;
      }
      
      const userProfile = getUserProfileData();
      console.log('👤 InternshipLetterScreen: User profile data:', JSON.stringify(userProfile, null, 2));
      
      const razorpayOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Learning Saint',
        description: 'Internship Letter Payment',
        order_id: orderData.orderId,
        prefill: {
          email: userProfile.email,
          contact: userProfile.contact,
          name: userProfile.name
        },
        theme: {
          color: '#FF6B35'
        },
        modal: {
          ondismiss: () => {
            console.log('🔒 InternshipLetterScreen: Razorpay modal dismissed');
          }
        }
      };
      
      console.log('🎨 InternshipLetterScreen: Razorpay options configured:', JSON.stringify(razorpayOptions, null, 2));
      console.log('🔍 InternshipLetterScreen: About to call razorpayCheckout.open with options:', JSON.stringify(razorpayOptions, null, 2));
      
      const paymentData = await razorpayCheckout.open(razorpayOptions);
      console.log('✅ InternshipLetterScreen: Payment successful:', JSON.stringify(paymentData, null, 2));
      return paymentData;
    } catch (razorpayError) {
      console.log('❌ InternshipLetterScreen: Razorpay error:', razorpayError);
      
      if (razorpayError.message === 'PAYMENT_CANCELLED') {
        throw new Error('PAYMENT_CANCELLED');
      } else if (razorpayError.message === 'PAYMENT_FAILED') {
        throw new Error('PAYMENT_FAILED');
      } else {
        throw new Error('Razorpay payment failed. Please try again.');
      }
    }
  };

  // Function to handle successful payment
  const handleSuccessfulPayment = async (paymentData, orderId, internshipLetterData = null) => {
    console.log('🎉 InternshipLetterScreen: handleSuccessfulPayment called');
    try {
      console.log('🎉 InternshipLetterScreen: Payment data received:', JSON.stringify(paymentData, null, 2));
      console.log('🎉 InternshipLetterScreen: Order ID:', orderId);
      console.log('🎉 InternshipLetterScreen: Current requestData:', JSON.stringify(requestData, null, 2));
      console.log('🎉 InternshipLetterScreen: Passed internshipLetterData:', JSON.stringify(internshipLetterData, null, 2));
      
      // Use passed data or fallback to requestData
      const dataToUse = internshipLetterData || requestData;
      console.log('🎉 InternshipLetterScreen: Using data for verification:', JSON.stringify(dataToUse, null, 2));
      
      // Verify payment with backend using the correct structure
      const verificationUrl = getApiUrl('/api/user/internshipLetter/verify-payment');
      console.log('🌐 InternshipLetterScreen: Verification URL:', verificationUrl);
      
      // Validate required data
      const internshipLetterId = dataToUse?.internshipLetter?._id;
      if (!internshipLetterId) {
        console.log('❌ InternshipLetterScreen: Missing internshipLetterId');
        console.log('❌ InternshipLetterScreen: Available data structure:', Object.keys(dataToUse || {}));
        Alert.alert('Error', 'Missing internship letter ID. Please try again.');
        return;
      }
      
      // Use the correct verification body structure as per your API requirements
      const verificationBody = {
        internshipLetterId: internshipLetterId, // Get _id from the request response
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentData.razorpay_payment_id || paymentData.razorpayPaymentId,
        razorpaySignature: paymentData.razorpay_signature || paymentData.razorpaySignature,
        courseId: courseId // Use courseId instead of subcourseId
      };
      
      console.log('📦 InternshipLetterScreen: Verification request body (updated structure):', JSON.stringify(verificationBody, null, 2));
      console.log('🔍 InternshipLetterScreen: Validation - internshipLetterId:', internshipLetterId);
      console.log('🔍 InternshipLetterScreen: Validation - razorpayOrderId:', orderId);
      console.log('🔍 InternshipLetterScreen: Validation - courseId:', courseId);
      
      const verificationResponse = await fetch(verificationUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationBody),
      });
      
      console.log('📡 InternshipLetterScreen: Verification response status:', verificationResponse.status, verificationResponse.statusText);
      
      if (verificationResponse.ok) {
        const verificationResult = await verificationResponse.json();
        console.log('📄 InternshipLetterScreen: Verification result:', JSON.stringify(verificationResult, null, 2));
        
        if (verificationResult.success) {
          console.log('✅ InternshipLetterScreen: Payment verification successful');
          
          // Update requestData with the latest information from verification response
          if (verificationResult.data) {
            console.log('🔄 InternshipLetterScreen: Updating requestData with verification response');
            setRequestData(verificationResult.data);
          }
          
          Alert.alert(
            'Success! 🎉',
            'Payment successful! Your internship letter is being processed and will be available for download shortly.',
            [{ 
              text: 'OK',
              onPress: () => {
                // Navigate back to Internship screen with uploadStatus to show updated button state
                console.log('✅ InternshipLetterScreen: Navigating back to Internship screen with uploadStatus');
                console.log('✅ InternshipLetterScreen: Verification result data:', JSON.stringify(verificationResult.data, null, 2));
                
                // Extract uploadStatus from the verification response
                const uploadStatus = verificationResult.data?.uploadStatus || 'upload';
                console.log('✅ InternshipLetterScreen: Extracted uploadStatus:', uploadStatus);
                
                navigation.navigate('Internship', { 
                  courseId: courseId,
                  uploadStatus: uploadStatus
                });
              }
            }]
          );
        } else {
          console.log('❌ InternshipLetterScreen: Payment verification failed:', verificationResult.message);
          Alert.alert('Error', 'Payment verification failed. Please contact support.');
        }
      } else {
        console.log('❌ InternshipLetterScreen: Payment verification failed - response not ok');
        const errorText = await verificationResponse.text();
        console.log('❌ InternshipLetterScreen: Error response:', errorText);
        Alert.alert('Error', 'Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('💥 InternshipLetterScreen: Error in handleSuccessfulPayment:', error);
      Alert.alert('Error', 'Failed to verify payment. Please contact support.');
    }
  };

  const handleBackPress = () => {
    console.log('⬅️ InternshipLetterScreen: handleBackPress called');
    navigation.goBack();
  };

  const handleDownload = () => {
    console.log('📥 InternshipLetterScreen: Download button pressed');
    console.log('📜 InternshipLetterScreen: This function is not implemented yet');
    // Add your download logic here
  };

  // Function to handle downloading the internship letter
  const handleDownloadLetter = async () => {
    try {
      console.log('📥 InternshipLetterScreen: handleDownloadLetter called');
      console.log('📥 InternshipLetterScreen: requestData:', JSON.stringify(requestData, null, 2));
      
      if (!requestData?.internshipLetter?._id) {
        console.log('❌ InternshipLetterScreen: No internship letter ID found');
        Alert.alert('Error', 'Internship letter ID not found. Please try again.');
        return;
      }
      
      // Build download URL (you'll need to update this based on your actual download endpoint)
      const downloadUrl = getApiUrl(`/api/user/internshipLetter/download/${requestData.internshipLetter._id}`);
      console.log('🌐 InternshipLetterScreen: Download URL:', downloadUrl);
      
      // For now, show success message (you can implement actual download logic later)
      Alert.alert(
        'Download Started! 📥',
        'Your internship letter download has started. Please check your downloads folder.',
        [{ text: 'OK' }]
      );
      
      // TODO: Implement actual file download logic here
      // This could involve using react-native-fs or similar library
      
    } catch (error) {
      console.error('💥 InternshipLetterScreen: Error in handleDownloadLetter:', error);
      Alert.alert('Error', 'Failed to download internship letter. Please try again.');
    }
  };

  console.log('🎨 InternshipLetterScreen: Rendering component');
  console.log('🎨 InternshipLetterScreen: Current state:', {
    isRequesting,
    hasRequestData: !!requestData,
    hasCourseData: !!courseData,
    isLoadingCourse,
    isRefreshing
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Page Refresh Loader Overlay */}
      {isPageRefreshing && (
        <View style={styles.pageRefreshOverlay}>
          <View style={styles.pageRefreshContainer}>
            <ActivityIndicator size="large" color="#FF8800" />
            <Text style={styles.pageRefreshText}>Refreshing...</Text>
          </View>
        </View>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Icon name="chevron-back" size={getResponsiveSize(24)} color="#FF8800" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Internship Letter</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handlePageRefresh}
          disabled={isPageRefreshing}
        >
          <Icon 
            name="refresh" 
            size={getResponsiveSize(20)} 
            color={isPageRefreshing ? "#999" : "#FF8800"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#FF8800']}
            tintColor="#FF8800"
            title="Pull to refresh..."
            titleColor="#666666"
          />
        }
      >
        {isLoadingCourse ? (
          <View style={styles.mainLoadingContainer}>
            <ActivityIndicator size="large" color="#FF8800" />
            <Text style={styles.mainLoadingText}>Loading course details...</Text>
          </View>
        ) : courseData ? (
          <>
            {/* Congratulations Section */}
            <View style={styles.congratulationsContainer}>
              <Text style={styles.congratulationsText}>Congratulations</Text>
              <Text style={styles.congratulationsSubtext}>For Completing Course</Text>
              
              {/* Dynamic Course Name */}
              <Text style={styles.courseNameText}>{courseData.courseName}</Text>
            </View>

            {/* Certificate Image */}
            <View style={styles.certificateContainer}>
              <Image 
                source={require('../assests/images/DownloadCertificate.png')} 
                style={styles.certificateImage}
                resizeMode="contain"
              />
            </View>

            {/* Course Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>
                In this course you will learn how to build a space to a 3-dimensional product. There are 24 premium learning videos for you.
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.mainLoadingContainer}>
            <Text style={styles.mainLoadingText}>Course not found</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCourseDetails}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Status Message and Download Button */}
      <View style={styles.downloadButtonContainer}>
        {/* Status Message */}
        {requestData?.internshipLetter?.paymentStatus && requestData?.internshipLetter?.uploadStatus === 'upload' && (
          <View style={styles.statusMessageContainer}>
            <Text style={styles.statusMessageText}>
              Internship Letter Underprocess you will be notified for download
            </Text>
          </View>
        )}
        
        {(() => {
          const uploadStatus = requestData?.internshipLetter?.uploadStatus;
          const paymentStatus = requestData?.internshipLetter?.paymentStatus;
          
          // If payment is successful and letter is uploaded, show enabled download button
          if (paymentStatus && uploadStatus === 'uploaded') {
            return (
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={() => {
                  console.log('📥 InternshipLetterScreen: Download letter button pressed');
                  handleDownloadLetter();
                }}
              >
                <LinearGradient
                  colors={['#FF8A00', '#FFB300']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.downloadButtonText}>
                    Internship
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }
          
          // If payment is successful but letter is still being processed (upload status)
          if (paymentStatus && uploadStatus === 'upload') {
            return (
              <TouchableOpacity 
                style={[styles.downloadButton, styles.downloadButtonDisabled]}
                disabled={true}
              >
                <LinearGradient
                  colors={['#FF8A00', '#FFB300']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.downloadButtonText}>
                    Internship
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }
          
          // Default: Show payment button
          return (
            <TouchableOpacity 
              style={[styles.downloadButton, (isRequesting || isLoadingCourse || !courseData) && styles.downloadButtonDisabled]}
              onPress={() => {
                console.log('🔘 InternshipLetterScreen: Get Internship Letter button pressed');
                requestInternshipLetter();
              }}
              disabled={isRequesting || isLoadingCourse || !courseData}
            >
              <LinearGradient
                colors={['#FF8A00', '#FFB300']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.downloadButtonText}>
                  Download
                  {/* {isRequesting ? 'Processing...' : `Download ₹${requestData?.internshipLetter?.paymentAmount || 99}/-`} */}
                </Text>
                {requestData?.internshipLetter?.paymentAmount && (
                  <Text style={styles.dynamicPriceText}>
                    Dynamic Price: ₹{requestData.internshipLetter.paymentAmount} (from API)
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })()}
      </View>
    </SafeAreaView>
  );
};

export default InternshipLetterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSize(20),
    paddingTop: getResponsiveSize(10),
    paddingBottom: getResponsiveSize(15),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: getResponsiveSize(8),
  },
  headerTitle: {
    fontSize: getResponsiveSize(18),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  placeholder: {
    width: getResponsiveSize(40),
  },
  scrollView: {
    // flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    // paddingBottom: getResponsiveSize(20),
  },
  congratulationsContainer: {
    alignItems: 'center',
    // paddingTop: getResponsiveSize(40),
    // paddingBottom: getResponsiveSize(10), // Reduced from 30 to 10
  },
  congratulationsText: {
    fontSize: getResponsiveSize(36),
    fontWeight: 'bold',
    color: '#2285FA',
    fontStyle: 'italic',
    // marginBottom: getResponsiveSize(8),
    textAlign: 'center',
  },
  congratulationsSubtext: {
    fontSize: getResponsiveSize(16),
    color: '#333',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: getResponsiveSize(10),
  },
  courseNameText: {
    fontSize: getResponsiveSize(20),
    color: '#FF8800',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: getResponsiveSize(5),
  },
  courseNameLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getResponsiveSize(10),
  },
  courseNameLoadingText: {
    fontSize: getResponsiveSize(14),
    color: '#666',
    marginLeft: getResponsiveSize(8),
  },
  courseNameError: {
    fontSize: getResponsiveSize(16),
    color: '#FF0000',
    textAlign: 'center',
    marginTop: getResponsiveSize(10),
    fontStyle: 'italic',
  },
  mainLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(100),
  },
  mainLoadingText: {
    fontSize: getResponsiveSize(18),
    color: '#666',
    marginTop: getResponsiveSize(15),
  },
  courseNameErrorContainer: {
    alignItems: 'center',
    marginTop: getResponsiveSize(10),
  },
  retryButton: {
    backgroundColor: '#FF8800',
    paddingHorizontal: getResponsiveSize(20),
    paddingVertical: getResponsiveSize(8),
    borderRadius: getResponsiveSize(20),
    marginTop: getResponsiveSize(10),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: getResponsiveSize(14),
    fontWeight: '600',
  },
  certificateContainer: {
    alignItems: 'center',
    // marginVertical: getResponsiveSize(10), // Added small margin to control gap
  },
  certificateImage: {
    width: width - getResponsiveSize(-10),
    height: getResponsiveSize(450),
  },
  descriptionContainer: {
    paddingHorizontal: getResponsiveSize(20),
    // marginTop: getResponsiveSize(10), // Reduced from potential larger gap
  },
  descriptionText: {
    fontSize: getResponsiveSize(16),
    color: '#333',
    lineHeight: getResponsiveSize(24),
    textAlign: 'center',
    fontWeight: '400',
  },
  downloadButtonContainer: {
    paddingHorizontal: getResponsiveSize(20),
    paddingBottom: getResponsiveSize(30),
    backgroundColor: '#fff',
  },
  downloadButton: {
    borderRadius: getResponsiveSize(12),
    overflow: 'hidden',
    shadowColor: '#FF8A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: getResponsiveSize(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(18),
    fontWeight: 'bold',
  },
  dynamicPriceText: {
    color: '#FFFFFF',
    fontSize: getResponsiveSize(12),
    fontWeight: '400',
    textAlign: 'center',
    marginTop: getResponsiveSize(5),
    opacity: 0.9,
  },
  downloadButtonDisabled: {
    opacity: 0.7,
  },
  refreshButton: {
    padding: getResponsiveSize(8),
    width: getResponsiveSize(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageRefreshOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageRefreshContainer: {
    backgroundColor: '#fff',
    padding: getResponsiveSize(20),
    borderRadius: getResponsiveSize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageRefreshText: {
    marginTop: getResponsiveSize(10),
    fontSize: getResponsiveSize(16),
    color: '#666',
    fontWeight: '500',
  },
  statusMessageContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSize(15),
    paddingHorizontal: getResponsiveSize(20),
  },
  statusMessageText: {
    fontSize: getResponsiveSize(14),
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: getResponsiveSize(20),
  },
});