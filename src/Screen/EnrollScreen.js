// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   Dimensions,
//   Platform,
//   StatusBar,
//   SafeAreaView,
//   Linking,
//   Modal,
//   Alert,
//   RefreshControl,
//   ActivityIndicator,
// } from 'react-native';
// import { WebView } from 'react-native-webview';
// import Orientation from 'react-native-orientation-locker';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { useAppSelector } from '../Redux/hooks';
// import { courseAPI } from '../API/courseAPI';
// import { getApiUrl } from '../API/config';
// import { RAZORPAY_KEY_ID } from '../config/env';
// import BackButton from '../Component/BackButton';
// import RazorpayCheckout from 'react-native-razorpay';

// console.log('✅ EnrollScreen: Direct Razorpay package imported successfully');

// // Import local assets
// const PlayIcon = require('../assests/images/Course.png');
// const StudentIcon = require('../assests/images/student.png');
// const StarIcon = require('../assests/images/star.png');
// const CheckIcon = require('../assests/images/TickMark.png');
// const WarningIcon = require('../assests/images/Danger.png');

// // Get screen dimensions for responsive design
// const { width, height } = Dimensions.get('window');

// // Responsive scaling factors
// const scale = width / 375;
// const verticalScale = height / 812;

// // Responsive font sizes
// const getFontSize = (size) => size * scale;
// const getVerticalSize = (size) => size * verticalScale;

// const EnrollScreen = ({ navigation, route }) => {
//   const [activeTab, setActiveTab] = useState('lessons');
//   const [isVideoPlaying, setIsVideoPlaying] = useState(false);
//   const [showDownloadModal, setShowDownloadModal] = useState(false);
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const webViewRef = useRef(null);

//   // Direct Razorpay integration - no custom class needed

//   // Get user data from Redux
//   const { token } = useAppSelector((state) => state.user);

//   // Get course ID from route params
//   const courseId = route.params?.courseId;

//   // State for course data from API
//   const [courseData, setCourseData] = useState({
//     title: 'Loading...',
//     description: 'Loading course details...',
//     duration: 'Loading...',
//     lessons: 0,
//     enrollments: '0',
//     rating: '0',
//     price: 'Loading...',
//     isBestSeller: false,
//     isLive: false,
//     liveTime: '00:00:00',
//     introVideoUrl: '',
//     totalStudentsEnrolled: 0,
//     totalDuration: '',
//     subCourseDescription: '',
//     totalLessons: 0,
//     lessons: [],
//     paymentStatus: false, // Add paymentStatus to track enrollment
//     isCompleted: false, // Add isCompleted flag initialization
//   });

//   const [isLoadingCourse, setIsLoadingCourse] = useState(true);
//   const [courseError, setCourseError] = useState(null);
//   const [isEnrolling, setIsEnrolling] = useState(false); // Add loading state for enrollment
//   const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle', 'processing', 'success', 'failed'
//   const [refreshing, setRefreshing] = useState(false); // Add refresh state

//   // Fetch course data when component mounts
//   useEffect(() => {
//     if (courseId && token) {
//       fetchCourseDetails();
//     }
//   }, [courseId, token]);

//   // Handle completed flag when coming back from FeedbackScreen
//   useEffect(() => {
//     if (route.params?.fromFeedback && route.params?.isCompleted) {
//       console.log('🎯 EnrollScreen: Coming back from FeedbackScreen with completed flag');
//       console.log('🔍 EnrollScreen: Route params:', route.params);
      
//       // Update courseData to show completed status
//       setCourseData(prevData => ({
//         ...prevData,
//         isCompleted: true,
//       }));
      
//       console.log('✅ EnrollScreen: Updated courseData.isCompleted to true');
//     }
//   }, [route.params]);

//   // Debug log for isCompleted changes
//   useEffect(() => {
//     console.log('🔍 EnrollScreen: courseData.isCompleted changed to:', courseData.isCompleted);
//     console.log('🔍 EnrollScreen: courseData object:', JSON.stringify(courseData, null, 2));
//   }, [courseData.isCompleted]);

//   // Check if course is completed and navigate to BadgeCourseScreen (only once)
//   useEffect(() => {
//     if (courseData.isCompleted && !route.params?.fromFeedback) {
//       // Check if user has already seen the BadgeCourse for this course
//       const badgeSeenKey = `badgeSeen_${courseId}`;
//       const hasSeenBadge = global.badgeSeenCourses && global.badgeSeenCourses[badgeSeenKey];
      
//       if (!hasSeenBadge) {
//         console.log('🎯 EnrollScreen: Course is completed, navigating to BadgeCourseScreen (first time)');
        
//         // Mark this course badge as seen
//         if (!global.badgeSeenCourses) {
//           global.badgeSeenCourses = {};
//         }
//         global.badgeSeenCourses[badgeSeenKey] = true;
        
//         const navigationParams = { 
//           courseId: courseId,
//           courseName: courseData.title,
//           returnToEnroll: true // Flag to indicate return to EnrollScreen
//         };
        
//         console.log('📤 EnrollScreen: Full navigation params:', JSON.stringify(navigationParams, null, 2));
        
//         // Add delay before navigation
//         setTimeout(() => {
//           console.log('⏰ EnrollScreen: Delay completed, now navigating to BadgeCourse');
//           navigation.navigate('BadgeCourse', navigationParams);
//         }, 1000); // Wait for 1 second
//       } else {
//         console.log('ℹ️ EnrollScreen: User has already seen BadgeCourse for this course, skipping navigation');
//       }
//     }
//   }, [courseData.isCompleted, courseId, courseData.title, navigation, route.params?.fromFeedback]);

//   // Log Razorpay import status
//   useEffect(() => {
//     console.log('🔍 EnrollScreen: Direct Razorpay import status:');
//     console.log('  - RazorpayCheckout available:', !!RazorpayCheckout);
//     console.log('  - RazorpayCheckout.open function:', RazorpayCheckout ? typeof RazorpayCheckout.open : 'N/A');
//     console.log('  - RAZORPAY_KEY_ID available:', !!RAZORPAY_KEY_ID);
//   }, []);

//   // Function to fetch course details from API
//   const fetchCourseDetails = async () => {
//     try {
//       setIsLoadingCourse(true);
//       setCourseError(null);
      
//       console.log('🏠 EnrollScreen: Fetching course details for ID:', courseId);
//       console.log('🔑 EnrollScreen: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      
//       const result = await courseAPI.getSubcourseById(token, courseId);
      
//       console.log('📡 EnrollScreen: Raw API response:', result);
      
//       if (result.success && result.data.success) {
//         const apiCourse = result.data.data;
//         console.log('🎉 EnrollScreen: Course details received successfully!');
//         console.log('📚 EnrollScreen: Course data:', apiCourse);
        
//         const transformedCourse = {
//           _id: apiCourse._id || courseId, // Add the subcourse ID
//           title: apiCourse.subcourseName || 'Course Title',
//           description: apiCourse.subCourseDescription || 'No description available',
//           duration: apiCourse.totalDuration || '0h 0min',
//           lessons: apiCourse.totalLessons || 0,
//           enrollments: apiCourse.totalStudentsEnrolled?.toString() || '0',
//           rating: apiCourse.avgRating?.toString() || '0',
//           price: `₹${apiCourse.price || 1}.00`,
//           isBestSeller: apiCourse.isBestSeller || false,
//           isLive: false,
//           liveTime: '00:00:00',
//           introVideoUrl: apiCourse.introVideoUrl || '',
//           totalStudentsEnrolled: apiCourse.totalStudentsEnrolled || 0,
//           totalDuration: apiCourse.totalDuration || '',
//           subCourseDescription: apiCourse.subCourseDescription || '',
//           totalLessons: apiCourse.totalLessons || 0,
//           lessons: Array.isArray(apiCourse.lessons) ? apiCourse.lessons : [],
//           paymentStatus: apiCourse.paymentStatus || false,
//           isCompleted: Boolean(apiCourse.isCompleted), // Ensure boolean conversion
//         };
        
//         console.log('💰 EnrollScreen: Course price transformation:', {
//           apiPrice: apiCourse.price,
//           transformedPrice: transformedCourse.price,
//           type: typeof apiCourse.price
//         });
        
       
       
//         // Set isCompleted from API response
//         if (apiCourse.isCompleted === true) {
//           console.log('🎯 Setting isCompleted to true from API response');
//           transformedCourse.isCompleted = true;
//         }
        
//         setCourseData(transformedCourse);
        
//       } else {
//         console.log(' EnrollScreen: Failed to fetch course details:', result.data?.message);
      
//         setCourseError(result.data?.message || 'Failed to fetch course details');
//       }
//     } catch (error) {
//       console.error('💥 EnrollScreen: Error fetching course details:', error);
//       setCourseError(error.message || 'Network error occurred');
//     } finally {
//       setIsLoadingCourse(false);
//     }
//   };

//   // Function to handle pull-to-refresh
//   const onRefresh = async () => {
//     try {
//       setRefreshing(true);
//       console.log('🔄 EnrollScreen: Pull-to-refresh triggered');
//       await fetchCourseDetails();
//       console.log('✅ EnrollScreen: Refresh completed successfully');
//     } catch (error) {
//       console.error('❌ EnrollScreen: Refresh failed:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   // Function to calculate live time from lesson start times
//   const calculateLiveTime = () => {
//     if (!courseData.lessons || courseData.lessons.length === 0) {
//       return null;
//     }

//     const now = new Date();
//     const currentHour = now.getHours();
//     const currentMinute = now.getMinutes();
//     const currentTime = currentHour * 60 + currentMinute; // Convert to minutes
    
//     console.log('🕐 Current time:', currentHour + ':' + currentMinute, '(', currentTime, 'minutes)');
    
//     // Find the next lesson based on start time
//     let nextLesson = null;
//     let minTimeDiff = Infinity;
    
//     courseData.lessons.forEach(lesson => {
//       if (lesson.startTime) {
//         const [startHour, startMinute] = lesson.startTime.split(':').map(Number);
//         const lessonStartMinutes = startHour * 60 + startMinute;
        
//         console.log('📚 Lesson:', lesson.lessonName, 'Start time:', lesson.startTime, '(', lessonStartMinutes, 'minutes)');
        
//         // Calculate time difference
//         let timeDiff = lessonStartMinutes - currentTime;
        
//         // If lesson already started today, check for next occurrence (tomorrow)
//         if (timeDiff <= 0) {
//           timeDiff += 24 * 60; // Add 24 hours (1440 minutes)
          
//         } else {
//           console.log('⏰ Lesson starts today in:', timeDiff, 'minutes');
//         }
        
//         if (timeDiff < minTimeDiff) {
//           minTimeDiff = timeDiff;
//           nextLesson = lesson;
//         }
//       }
//     });
    
//     if (!nextLesson || minTimeDiff === Infinity) {
    
//       return null;
//     }
    
  
    
//     // Calculate hours and minutes
//     const hours = Math.floor(minTimeDiff / 60);
//     const minutes = minTimeDiff % 60;
    
//     // Format the time string
//     let timeString = '';
//     if (hours > 0) {
//       timeString = `${hours}h ${minutes}m`;
//     } else {
//       timeString = `${minutes}m`;
//     }
    
//     console.log('⏱️ Live timer display:', timeString);
//     return timeString;
//   };

//   // State for live time countdown
//   const [liveTime, setLiveTime] = useState('');

//   // Update live time every second
//   useEffect(() => {
//     if (courseData.lessons && courseData.lessons.length > 0) {
//       const interval = setInterval(() => {
//         const calculatedTime = calculateLiveTime();
//         if (calculatedTime) {
//           setLiveTime(calculatedTime);
//         } else {
//           setLiveTime('');
//         }
//       }, 1000);

//       return () => clearInterval(interval);
//     }
//   }, [courseData.lessons]);

//   // Handle orientation and full-screen mode
//   useEffect(() => {
//     if (isFullScreen) {
//       Orientation.lockToLandscape();
//       StatusBar.setHidden(true);
//     } else {
//       Orientation.lockToPortrait();
//       StatusBar.setHidden(false);
//     }

//     return () => {
//       Orientation.unlockAllOrientations();
//       StatusBar.setHidden(false);
//     };
//   }, [isFullScreen]);

//   const handlePlayVideo = () => {
//     setIsVideoPlaying(true);
//   };

//   const handleEnrollNow = async () => {
//     try {
    
      
//       // Check if user is already enrolled
//       if (courseData.paymentStatus) {
//         console.log('ℹ️ EnrollScreen: User is already enrolled in this course');
//         Alert.alert('Already Enrolled', 'You are already enrolled in this course!');
//         return;
//       }
      
//       setIsEnrolling(true);
//       setPaymentStatus('processing');
      
//       // Check if we have required data
//       if (!courseId || !token) {
//         console.log('❌ EnrollScreen: Missing required data - courseId:', courseId, 'token:', !!token);
//         setPaymentStatus('failed');
//         Alert.alert('Error', 'Missing required data. Please try again.');
//         return;
//       }
     
      
//       // Extract price from courseData.price (format: "₹99.00")
//       console.log('💰 EnrollScreen: Original courseData.price:', courseData.price);
//       console.log('💰 EnrollScreen: Type of courseData.price:', typeof courseData.price);
      
//       const priceString = courseData.price.replace('₹', '').replace('.00', '');
//       const priceInRupees = parseFloat(priceString) || 1;
//       const priceInPaise = Math.round(priceInRupees * 100);
      
//       console.log('💰 EnrollScreen: Price calculation in handleEnrollNow:', {
//         originalPrice: courseData.price,
//         priceString: priceString,
//         priceInRupees: priceInRupees,
//         priceInPaise: priceInPaise
//       });
      
//       const orderResult = await courseAPI.createCourseOrder(token, courseId, priceInPaise);
      
//       if (!orderResult.success || !orderResult.data.success) {
//         console.log('❌ EnrollScreen: Failed to create course order:', orderResult.data?.message);
//         setPaymentStatus('failed');
//         Alert.alert('Error', orderResult.data?.message || 'Failed to create course order');
//         return;
//       }
      
//       const orderData = orderResult.data.data;
//       console.log('✅ EnrollScreen: Course order created successfully:', orderData);
//       console.log('💰 EnrollScreen: Order amount from backend:', orderData.amount);
//       console.log('💰 EnrollScreen: Expected amount (paise):', priceInPaise);
//       console.log('💰 EnrollScreen: Backend amount in rupees:', orderData.amount ? (orderData.amount / 100).toFixed(2) : 'N/A');
      
//       // Validate order data (key will come from frontend config)
//       if (!orderData.amount || !orderData.orderId) {
//         console.log('❌ EnrollScreen: Invalid order data received:', orderData);
//         setPaymentStatus('failed');
//         Alert.alert('Error', 'Invalid order data received. Please try again.');
//         return;
//       }
      
//       // Step 2: Open Razorpay payment interface
//       console.log('💳 EnrollScreen: Opening Razorpay payment interface...');
//       const paymentData = await handlePaymentWithRazorpay(orderData);
      
//       if (!paymentData) {
//         return; // Payment was cancelled or failed
//       }
      
//       // Log the complete payment response to see the structure
//       console.log('🔍 EnrollScreen: Complete Razorpay payment response:', JSON.stringify(paymentData, null, 2));
      
//       // Validate payment data - check for both possible field name formats
//       const paymentId = paymentData.razorpay_payment_id || paymentData.razorpayPaymentId;
//       const signature = paymentData.razorpay_signature || paymentData.razorpaySignature;
//       const orderId = paymentData.razorpay_order_id || paymentData.razorpayOrderId;
      
//       if (!paymentId || !signature) {
//         console.log('❌ EnrollScreen: Invalid payment data received:', paymentData);
//         console.log('❌ EnrollScreen: Missing paymentId or signature');
//         setPaymentStatus('failed');
//         Alert.alert('Error', 'Invalid payment data received. Please contact support.');
//         return;
//       }
    
      
//       const verificationResult = await courseAPI.verifyPayment(
//         token,
//         orderData.orderId,
//         paymentId,
//         signature,
//         courseId // Pass courseId as subcourseId
//       );
      
//       if (verificationResult.success && verificationResult.data.success) {
//         console.log('🎉 EnrollScreen: Payment verified successfully!');
//         setPaymentStatus('success');
        
//         // Update local state to reflect enrollment
//         setCourseData(prevData => ({
//           ...prevData,
//           paymentStatus: true,
//         }));
        
//         // Show success message and navigate to MyCourses
//         Alert.alert(
//           'Success! 🎉',
//           'Payment successful! You are now enrolled in the course.',
//           [
//             {
//               text: 'Continue',
//               onPress: () => {
//                 // Navigate to MyCourses page after successful enrollment
//                 console.log('🚀 EnrollScreen: Navigating to MyCourses page...');
//                 navigation.navigate('MyCourses');
//               }
//             }
//           ]
//         );
//       } else {
//         console.log('❌ EnrollScreen: Payment verification failed:', verificationResult.data?.message);
//         setPaymentStatus('failed');
//         Alert.alert('Error', 'Payment verification failed. Please contact support.');
//       }
      
//     } catch (error) {
//       console.error('💥 EnrollScreen: Error during enrollment:', error);
//       console.error('💥 EnrollScreen: Error message:', error.message);
//       console.error('💥 EnrollScreen: Error stack:', error.stack);
//       setPaymentStatus('failed');
      
//       // Handle specific Razorpay errors
//       if (error.message === 'PAYMENT_CANCELLED') {
//         console.log('🚫 EnrollScreen: Payment was cancelled by user');
//         Alert.alert('Payment Cancelled', 'You cancelled the payment. You can try again anytime.');
//       } else if (error.message === 'PAYMENT_FAILED') {
//         console.log('💥 EnrollScreen: Payment failed');
//         Alert.alert('Payment Failed', 'Payment was not successful. Please try again.');
//       } else if (error.message && error.message.includes('Invalid Razorpay configuration')) {
//         console.log('⚙️ EnrollScreen: Invalid Razorpay configuration');
//         Alert.alert('Configuration Error', 'Payment gateway configuration error. Please contact support.');
//       } else if (error.message && error.message.includes('Razorpay payment failed')) {
//         console.log('💳 EnrollScreen: Razorpay payment error');
//         Alert.alert('Payment Error', error.message);
//       } else if (error.message && error.message.includes('PAYMENT_CANCELLED')) {
//         console.log('🚫 EnrollScreen: Payment was cancelled by user (alternative check)');
//         Alert.alert('Payment Cancelled', 'You cancelled the payment. You can try again anytime.');
//       } else if (error.code === 'PAYMENT_CANCELLED') {
//         console.log('🚫 EnrollScreen: Payment was cancelled by user (code check)');
//         Alert.alert('Payment Cancelled', 'You cancelled the payment. You can try again anytime.');
//       } else if (error.message && error.message.includes('cancelled')) {
//         console.log('🚫 EnrollScreen: Payment was cancelled by user (cancelled check)');
//         Alert.alert('Payment Cancelled', 'You cancelled the payment. You can try again anytime.');
//       } else {
//         console.log('💥 EnrollScreen: Generic enrollment error');
//         Alert.alert('Error', `Something went wrong during enrollment: ${error.message || 'Unknown error'}. Please try again.`);
//       }
//     } finally {
//       setIsEnrolling(false);
//     }
//   };

//   // Function to reset payment status
//   const resetPaymentStatus = () => {
//     setPaymentStatus('idle');
//   };

//   // Function to get user profile data for Razorpay prefill
//   const getUserProfileData = () => {
//     // You can get this from Redux store or API
//     // For now, using placeholder data
//     return {
//       email: 'student@learningsaint.com',
//       contact: '9876543210',
//       name: 'Student Name'
//     };
//   };

//   // Function to handle payment with direct Razorpay
//   const handlePaymentWithRazorpay = async (orderData) => {
//     console.log('🚀 EnrollScreen: Starting direct Razorpay payment...');
//     console.log('🔍 EnrollScreen: orderData received:', JSON.stringify(orderData, null, 2));
    
//     if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
//       console.log('❌ EnrollScreen: Direct Razorpay not available');
//       Alert.alert('Error', 'Razorpay payment gateway is not available. Please try again later.');
//       setPaymentStatus('failed');
//       return null;
//     }

//     try {
//       console.log('💳 EnrollScreen: Opening direct Razorpay payment interface...');
//       console.log('🔑 EnrollScreen: Using Razorpay key:', RAZORPAY_KEY_ID ? RAZORPAY_KEY_ID.substring(0, 20) + '...' : 'Not found');
      
//       // Validate Razorpay key is available
//       if (!RAZORPAY_KEY_ID) {
//         console.log('❌ EnrollScreen: Razorpay key not found');
//         Alert.alert('Error', 'Razorpay configuration not found. Please contact support.');
//         setPaymentStatus('failed');
//         return null;
//       }
      
//       const userProfile = getUserProfileData();
//       console.log('👤 EnrollScreen: User profile data:', userProfile);
      
//       // Calculate priceInPaise from courseData.price
//       console.log('💰 EnrollScreen: Raw courseData.price:', courseData.price);
      
//       if (!courseData.price || typeof courseData.price !== 'string') {
//         console.log('❌ EnrollScreen: Invalid course price:', courseData.price);
//         throw new Error('Invalid course price. Please refresh and try again.');
//       }
      
//       const priceString = courseData.price.replace('₹', '').replace('.00', '');
//       const priceInRupees = parseFloat(priceString);
      
//       if (isNaN(priceInRupees) || priceInRupees <= 0) {
//         console.log('❌ EnrollScreen: Invalid price calculation:', { priceString, priceInRupees });
//         throw new Error('Invalid course price. Please contact support.');
//       }
      
//       const priceInPaise = Math.round(priceInRupees * 100);
      
//       console.log('💰 EnrollScreen: Price calculation:', {
//         originalPrice: courseData.price,
//         priceString: priceString,
//         priceInRupees: priceInRupees,
//         priceInPaise: priceInPaise
//       });
      
//       // Use the calculated price from frontend
//       const finalAmount = priceInPaise;
      
//       const razorpayOptions = {
//         description: `Course: ${courseData.title}`,
       
//         currency: 'INR',
//         key: RAZORPAY_KEY_ID,
//         amount: finalAmount,
//         name: 'Learning Saint',
//         order_id: orderData.orderId,
//         prefill: {
//           email: userProfile.email,
//           contact: userProfile.contact,
//           name: userProfile.name
//         },
//         theme: {
//           color: '#FF6B35'
//         }
//       };
      
//       console.log('🎨 EnrollScreen: Direct Razorpay options:', JSON.stringify(razorpayOptions, null, 2));
      
//       // Validate Razorpay options
//       if (!razorpayOptions.key || !razorpayOptions.amount || !razorpayOptions.order_id) {
//         console.log('❌ EnrollScreen: Invalid Razorpay options');
//         throw new Error('Invalid Razorpay options: missing key, amount, or order_id');
//       }
      
//       console.log('🔧 EnrollScreen: Calling direct RazorpayCheckout.open()...');
//       const paymentData = await RazorpayCheckout.open(razorpayOptions);
//       console.log('✅ EnrollScreen: Direct payment successful:', JSON.stringify(paymentData, null, 2));
//       return paymentData;
//     } catch (razorpayError) {
//       console.log('❌ EnrollScreen: Direct Razorpay error caught:', razorpayError);
//       console.log('❌ EnrollScreen: Error message:', razorpayError.message);
//       console.log('❌ EnrollScreen: Error code:', razorpayError.code);
      
//       // Handle specific Razorpay errors
//       if (razorpayError.code === 'PAYMENT_CANCELLED' || razorpayError.message === 'PAYMENT_CANCELLED') {
//         console.log('🚫 EnrollScreen: Payment was cancelled by user');
//         throw new Error('PAYMENT_CANCELLED');
//       } else if (razorpayError.code === 'PAYMENT_FAILED' || razorpayError.message === 'PAYMENT_FAILED') {
//         console.log('💥 EnrollScreen: Payment failed');
//         throw new Error('PAYMENT_FAILED');
//       } else if (razorpayError.message && razorpayError.message.includes('cancelled')) {
//         console.log('🚫 EnrollScreen: Payment was cancelled by user (message contains cancelled)');
//         throw new Error('PAYMENT_CANCELLED');
//       } else {
//         console.log('💥 EnrollScreen: Generic Razorpay error:', razorpayError);
//         throw new Error(`Razorpay payment failed: ${razorpayError.message || 'Unknown error'}. Please try again.`);
//       }
//     }
//   };

//   const handleStudentIconClick = () => {
//     console.log('🎓 EnrollScreen: Student icon clicked, navigating to Student screen with courseId:', courseId);
//     navigation.navigate('Student', { subcourseId: courseId });
//   };

//   const handleStarIconClick = () => {
//     console.log('⭐ EnrollScreen: Star icon clicked');
//     console.log('🆔 EnrollScreen: courseId from route params:', courseId);
//     console.log('🆔 EnrollScreen: courseData._id:', courseData._id);
    
//     // Use courseData._id if available, otherwise fall back to route params
//     const subcourseIdToPass = courseData._id || courseId;
//     console.log('🚀 EnrollScreen: Navigating to Review screen with subcourseId:', subcourseIdToPass);
    
//     navigation.navigate('Review', { subcourseId: subcourseIdToPass });
//   };

//   const handleLiveClick = () => {
//     console.log('Live clicked');
//   };

//   const handleDownloadCertificate = async () => {
//     try {
//       console.log('🚀 Download certificate clicked for courseId:', courseId);
      
//       // Check payment status from existing courseData
//       console.log('🔍 Checking payment status from courseData:', courseData.paymentStatus);
      
//       if (courseData.paymentStatus === true) {
//         console.log('✅ Payment status is true, navigating to DownloadCertificateScreen');
//         navigation.navigate('DownloadCertificate', { courseId: courseId });
//         return;
//       } else {
//         console.log('❌ Payment status is false, showing popup message');
//         setShowDownloadModal(true);
//         return;
//       }
//     } catch (error) {
//       console.error('💥 Error checking payment status:', error);
//       // On error, show the popup to be safe
//       setShowDownloadModal(true);
//     }
//   };

//   const onMessage = (event) => {
//     const data = JSON.parse(event.nativeEvent.data);
//     if (data.event === 'fullscreen') {
//       setIsFullScreen(data.value);
//     }
//   };

//   const injectedJavaScript = `
//     (function() {
//       const video = document.querySelector('video');
//       if (video) {
//         video.addEventListener('webkitfullscreenchange', () => {
//           window.ReactNativeWebView.postMessage(JSON.stringify({
//             event: 'fullscreen',
//             value: document.webkitIsFullScreen
//           }));
//         });
//         video.addEventListener('fullscreenchange', () => {
//           window.ReactNativeWebView.postMessage(JSON.stringify({
//             event: 'fullscreen',
//             value: document.fullscreenElement !== null
//           }));
//         });
//       }
//     })();
//     true;
//   `;

//   const renderVideoPlayer = () => (
//     <View style={[styles.videoContainer, isFullScreen && styles.fullScreenVideoContainer]}>
//       {isVideoPlaying ? (
//         <WebView
//           ref={webViewRef}
//           source={{ uri: courseData.introVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }}
//           style={styles.webView}
//           javaScriptEnabled={true}
//           domStorageEnabled={true}
//           startInLoadingState={true}
//           allowsFullscreenVideo={true}
//           mediaPlaybackRequiresUserAction={false}
//           onMessage={onMessage}
//           injectedJavaScript={injectedJavaScript}
//           renderLoading={() => <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>Loading Video...</Text>}
//         />
//       ) : (
//         <View style={styles.videoThumbnail}>
//           <Image 
//             source={require('../assests/images/Course.png')} 
//             style={styles.thumbnailImage}
//             resizeMode="cover"
//           />
//           <View style={styles.thumbnailOverlay}>
//             <Text style={styles.thumbnailText}>Video Preview</Text>
//           </View>
//         </View>
//       )}
//       {!isVideoPlaying && (
//         <TouchableOpacity 
//           style={styles.playButton}
//           onPress={handlePlayVideo}
//         >
//           <View style={styles.playIconContainer}>
//             <View style={styles.playTriangle} />
//           </View>
//         </TouchableOpacity>
//       )}
//       {isFullScreen && (
//         <TouchableOpacity
//           style={styles.exitFullScreenButton}
//           onPress={() => {
//             setIsFullScreen(false);
//             if (webViewRef.current) {
//               webViewRef.current.injectJavaScript(`
//                 document.exitFullscreen();
//                 true;
//               `);
//             }
//           }}
//         >
//           <Text style={styles.exitFullScreenText}>Exit Full Screen</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   const renderCourseInfo = () => (
//     <View style={[styles.courseInfoContainer, isFullScreen && { display: 'none' }]}>
//       <View style={styles.engagementMetrics}>
//         <TouchableOpacity style={styles.metricItem} onPress={handleStudentIconClick}>
//           <Image source={StudentIcon} style={styles.metricIcon} />
//           <Text style={styles.metricText}>
//             {typeof courseData.enrollments === 'string' ? courseData.enrollments : '0'}
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.metricItem} onPress={handleStarIconClick}>
//           <Image source={StarIcon} style={styles.metricIcon} />
//           <Text style={styles.metricText}>
//             {typeof courseData.rating === 'string' ? courseData.rating : '0'}
//           </Text>
//         </TouchableOpacity>
//         {courseData.isBestSeller && (
//           <View style={styles.bestSellerBadge}>
//             <Text style={styles.bestSellerText}>Best Seller</Text>
//           </View>
//         )}
        
//         {liveTime && (
//           <TouchableOpacity style={styles.liveBadge} onPress={handleLiveClick}>
//             <Text style={styles.liveText}>
//               Live In {liveTime}
//             </Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       <Text style={styles.courseTitle}>
//         {typeof courseData.title === 'string' ? courseData.title : 'Course Title'}
//       </Text>
//       <Text style={styles.courseDescription}>
//         {typeof courseData.description === 'string' ? courseData.description : 'No description available'}
//       </Text>
      

      
//       <View style={styles.courseStats}>
//         <View style={styles.statItem}>
//           <Icon name="time-outline" size={getFontSize(16)} color="#FF8800" style={styles.statIcon} />
//           <Text style={styles.statText}>
//             {typeof courseData.duration === 'string' ? courseData.duration : '0h 0min'}
//           </Text>
//         </View>
//         <View style={styles.separator} />
//         <Text style={styles.lessonsText}>
//           {typeof courseData.totalLessons === 'number' ? courseData.totalLessons : 0} lessons
//         </Text>
//       </View>
//     </View>
//   );

//   const renderTabs = () => {
//     console.log('🔍 renderTabs: courseData.isCompleted =', courseData.isCompleted);
//     console.log('🔍 renderTabs: Downloads tab disabled =', !courseData.isCompleted);
//     console.log('🔍 renderTabs: courseData object =', JSON.stringify(courseData, null, 2));
    
//     return (
//       <View style={[styles.tabsContainer, isFullScreen && { display: 'none' }]}>
//         <TouchableOpacity 
//           style={[styles.tab, activeTab === 'lessons' && styles.activeTab]}
//           onPress={() => setActiveTab('lessons')}
//         >
//           <Text style={[styles.tabText, activeTab === 'lessons' && styles.activeTabText]}>
//             Lessons
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[
//             styles.tab, 
//             activeTab === 'downloads' && styles.activeTab
//           ]}
//           onPress={() => {
//             console.log('📥 Downloads tab clicked! isCompleted =', courseData.isCompleted);
//             setActiveTab('downloads');
//           }}
//         >
//           <Text style={[
//             styles.tabText, 
//             activeTab === 'downloads' && styles.activeTabText
//           ]}>
//             Downloads
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   const renderLessons = () => {
//     // Add extra safety check
//     if (!courseData.lessons || !Array.isArray(courseData.lessons) || courseData.lessons.length === 0) {
//       return (
//         <View style={styles.lessonsContainer}>
//           <View style={styles.emptyLessonsContainer}>
//             <Text style={styles.emptyLessonsText}>No lessons available yet</Text>
//           </View>
//         </View>
//       );
//     }

//     return (
//       <View style={styles.lessonsContainer}>
//         {courseData.lessons.map((lesson, index) => {
//           // Extra safety checks for each property
//           const lessonTitle = lesson && lesson.lessonName && typeof lesson.lessonName === 'string' 
//             ? lesson.lessonName 
//             : `Lesson ${index + 1}`;
          
//           const lessonDuration = lesson && lesson.duration && typeof lesson.duration === 'string' 
//             ? lesson.duration 
//             : '0 mins';

//           // Ensure thumbnail is valid
//           const thumbnailSource = lesson && lesson.thumbnailImageUrl && typeof lesson.thumbnailImageUrl === 'string'
//             ? { uri: lesson.thumbnailImageUrl }
//             : require('../assests/images/Course.png');

//           // Check if lesson should be locked
//           const isFirstLesson = index === 0;
//           const isLessonLocked = !courseData.paymentStatus || 
//             (!isFirstLesson && !courseData.lessons[index - 1]?.isCompleted);

//           console.log('🔍 Rendering lesson:', {
//             index,
//             lessonTitle,
//             lessonDuration,
//             hasThumbnail: !!lesson.thumbnailImageUrl,
//             isCompleted: lesson.isCompleted,
//             isFirstLesson,
//             isLessonLocked,
//             paymentStatus: courseData.paymentStatus
//           });

//           return (
//             <TouchableOpacity 
//               key={`lesson-${index}`}
//               style={styles.lessonItem} // Remove lockedLessonItem style
//               onPress={() => {
//                 if (isLessonLocked) {
//                   if (!courseData.paymentStatus) {
//                     Alert.alert('Lesson Locked', 'Please enroll in the course first to access this lesson.');
//                   } else {
//                     Alert.alert('Lesson Locked', 'Please complete the previous lesson first to unlock this one.');
//                   }
//                   return;
//                 }
                
//                 if (courseData.paymentStatus) {
//                   console.log('🎬 EnrollScreen: Lesson clicked, navigating to LessonVideo with lessonId:', lesson.lessonId);
//                   navigation.navigate('LessonVideo', { lessonId: lesson.lessonId });
//                 }
//               }}
//               disabled={isLessonLocked}
//             >
//               <Image 
//                 source={thumbnailSource}
//                 style={styles.lessonThumbnail} // Remove lockedLessonThumbnail style
//               />
//               <View style={styles.lessonInfo}>
//                 <Text style={styles.lessonTitle}> {/* Remove lockedLessonTitle style */}
//                   {lessonTitle}
//                 </Text>
//                 <Text style={styles.lessonDuration}> {/* Remove lockedLessonDuration style */}
//                   {lessonDuration}
//                 </Text>
//               </View>
              
//               {/* Show lock icon for locked lessons */}
//               {isLessonLocked && (
//                 <View style={styles.lockIconContainer}>
//                   <Icon name="lock-closed" size={24} color="#999999" />
//                 </View>
//               )}
              
//               {/* Show completed badge for completed lessons */}
//               {lesson.isCompleted && !isLessonLocked && (
//                 <View style={styles.completedBadge}>
//                   <Icon name="checkmark-circle" size={24} color="#2285FA" />
//                 </View>
//               )}
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     );
//   };

//   const renderDownloads = () => (
//     <View style={styles.downloadsContainer}>
//       <View style={styles.enabledDownloadsContainer}>
//         <TouchableOpacity 
//           style={styles.downloadCertificateCard}
//           onPress={handleDownloadCertificate}
//         >
//           <View style={styles.downloadCertificateLeft}>
//             <Text style={styles.downloadCertificateTitle}>Download Module Certificate</Text>
//           </View>
//           <View style={styles.downloadCertificateRight}>
//             <Icon name="download-outline" size={24} color="#FF6B35" />
//           </View>
//         </TouchableOpacity>
//         <Text style={styles.certificateText}>Certificate</Text>
//       </View>

//       {/* Popup Modal for incomplete course */}
//       <Modal
//         visible={showDownloadModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowDownloadModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Image source={WarningIcon} style={styles.modalWarningIcon} />
//               <Text style={styles.modalTitle}>Course Completion Required</Text>
//             </View>
//             <Text style={styles.modalMessage}>
//               First you have to complete Your course to download Cirtificate
//             </Text>
//             <TouchableOpacity 
//               style={styles.modalButton}
//               onPress={() => setShowDownloadModal(false)}
//             >
//               <Text style={styles.modalButtonText}>Continue</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );

//   return (
//     <SafeAreaView style={[styles.container, isFullScreen && styles.fullScreenContainer]}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" hidden={isFullScreen} />
      
//       {!isFullScreen && (
//         <View style={styles.header}>
//           <BackButton onPress={() => navigation.navigate('MyCourses')} />
//           <Text style={styles.headerTitle}>
//             {(() => {
//               const title = typeof courseData.title === 'string' ? courseData.title : 'Course Title';
//               const words = title.split(' ');
//               return words.slice(0, 2).join(' ');
//             })()}
//           </Text>
//           {courseData.isCompleted && (
//             <View style={styles.headerCompletedBadge}>
//               <Text style={styles.headerCompletedText}>Completed</Text>
//             </View>
//           )}
//         </View>
//       )}

//       <ScrollView 
//         style={[styles.scrollView, isFullScreen && { display: 'none' }]}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#FF6B35']}
//             tintColor="#FF6B35"
//             title="Pull to refresh..."
//             titleColor="#FF6B35"
//           />
//         }
//       >
//         {isLoadingCourse ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#FF6B35" />
//             <Text style={styles.loadingText}>Loading course details...</Text>
//           </View>
//         ) : courseError ? (
//           <View style={styles.errorContainer}>
//             <Text style={styles.errorText}>Error: {courseError}</Text>
//             <TouchableOpacity style={styles.retryButton} onPress={fetchCourseDetails}>
//               <Text style={styles.retryButtonText}>Retry</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <>
//             {renderVideoPlayer()}
//             {renderCourseInfo()}
//             {renderTabs()}
//             {activeTab === 'lessons' ? renderLessons() : renderDownloads()}
//           </>
//         )}
//       </ScrollView>

//       {!isFullScreen && !courseData.paymentStatus && (
//         <View style={styles.enrollButtonContainer}>
//           {paymentStatus === 'failed' ? (
//             <View style={styles.paymentFailedContainer}>
             
//               <TouchableOpacity 
//                 style={styles.retryButton}
//                 onPress={() => {
//                   resetPaymentStatus();
//                   handleEnrollNow();
//                 }}
//               >
//                 <Text style={styles.retryButtonText}>Retry Payment</Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <TouchableOpacity 
//               style={[styles.enrollButton, isEnrolling && styles.enrollButtonDisabled]}
//               onPress={handleEnrollNow}
//               disabled={isEnrolling}
//             >
//               {isEnrolling ? (
//                 <View style={styles.enrollButtonLoading}>
//                   <ActivityIndicator size="small" color="#FFFFFF" />
//                   <Text style={styles.enrollButtonText}>Processing Payment...</Text>
//                 </View>
//               ) : (
//                 <Text style={styles.enrollButtonText}>
//                   Enroll  - {courseData.price}
//                 </Text>
//               )}
//             </TouchableOpacity>
//           )}
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// // Styles remain the same
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   fullScreenContainer: {
//     backgroundColor: '#000000',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: getVerticalSize(20),
//     paddingTop: Platform.OS === 'ios' ? getVerticalSize(15) : getVerticalSize(25),
//     paddingBottom: getVerticalSize(15),
//     marginTop: getVerticalSize(10),
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E0E0E0',
//   },
//   headerTitle: {
//     flex: 1,
//     fontSize: getFontSize(18),
//     fontWeight: 'bold',
//     color: '#000000',
//     textAlign: 'center',
//     marginHorizontal: getVerticalSize(10),
//   },
//   placeholder: {
//     width: getFontSize(40),
//   },
//   scrollView: {
//     flex: 1,
//   },
//   videoContainer: {
//     width: '100%',
//     height: getVerticalSize(250),
//     position: 'relative',
//     backgroundColor: '#000000',
//   },
//   fullScreenVideoContainer: {
//     width: Dimensions.get('window').width,
//     height: Dimensions.get('window').height,
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 1000,
//   },
//   webView: {
//     width: '100%',
//     height: '100%',
//   },
//   playButton: {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: [{ translateX: -getFontSize(30) }, { translateY: -getFontSize(30) }],
//   },
//   playIconContainer: {
//     width: getFontSize(60),
//     height: getFontSize(60),
//     borderRadius: getFontSize(30),
//     backgroundColor: '#FF6B35',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   playTriangle: {
//     width: 0,
//     height: 0,
//     backgroundColor: 'transparent',
//     borderStyle: 'solid',
//     borderLeftWidth: getFontSize(12),
//     borderRightWidth: 0,
//     borderBottomWidth: getFontSize(8),
//     borderTopWidth: getFontSize(8),
//     borderLeftColor: '#FFFFFF',
//     borderRightColor: 'transparent',
//     borderBottomColor: 'transparent',
//     borderTopColor: 'transparent',
//     marginLeft: getFontSize(2),
//   },
//   videoThumbnail: {
//     width: '100%',
//     height: '100%',
//     position: 'relative',
//   },
//   thumbnailImage: {
//     width: '100%',
//     height: '100%',
//   },
//   thumbnailOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   thumbnailText: {
//     color: '#FFFFFF',
//     fontSize: getFontSize(18),
//     fontWeight: 'bold',
//   },
//   exitFullScreenButton: {
//     position: 'absolute',
//     top: getVerticalSize(20),
//     right: getVerticalSize(20),
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     padding: getVerticalSize(10),
//     borderRadius: getFontSize(5),
//   },
//   exitFullScreenText: {
//     color: '#FFFFFF',
//     fontSize: getFontSize(14),
//     fontWeight: '600',
//   },
//   courseInfoContainer: {
//     padding: getVerticalSize(20),
//     backgroundColor: '#FFFFFF',
//   },
//   courseTitle: {
//     fontSize: getFontSize(24),
//     fontWeight: 'bold',
//     color: '#000000',
//     marginBottom: getVerticalSize(10),
//   },
//   courseDescription: {
//     fontSize: getFontSize(16),
//     color: '#666666',
//     lineHeight: getFontSize(24),
//     marginBottom: getVerticalSize(15),
//   },
//   debugInfo: {
//     backgroundColor: '#F0F0F0',
//     padding: getVerticalSize(10),
//     borderRadius: getFontSize(5),
//     marginBottom: getVerticalSize(15),
//   },
//   debugText: {
//     fontSize: getFontSize(12),
//     color: '#666666',
//     fontFamily: 'monospace',
//   },
//   courseStats: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   statItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: getVerticalSize(15),
//   },
//   statIcon: {
//     marginRight: getVerticalSize(5),
//   },
//   statText: {
//     fontSize: getFontSize(14),
//     color: '#666666',
//   },
//   separator: {
//     width: 1,
//     height: getFontSize(16),
//     backgroundColor: '#E0E0E0',
//     marginRight: getVerticalSize(15),
//   },
//   lessonsText: {
//     fontSize: getFontSize(14),
//     color: '#666666',
//   },
//   engagementMetrics: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: getVerticalSize(15),
//     flexWrap: 'wrap',
//   },
//   metricItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: getVerticalSize(15),
//   },
//   metricIcon: {
//     width: getFontSize(16),
//     height: getFontSize(16),
//     marginRight: getVerticalSize(5),
//     resizeMode: 'contain',
//   },
//   metricText: {
//     fontSize: getFontSize(14),
//     color: '#666666',
//   },
//   bestSellerBadge: {
//     backgroundColor: '#FF6B35',
//     paddingHorizontal: getVerticalSize(8),
//     paddingVertical: getVerticalSize(4),
//     borderRadius: getFontSize(12),
//     marginRight: getVerticalSize(10),
//   },
//   bestSellerText: {
//     color: '#FFFFFF',
//     fontSize: getFontSize(12),
//     fontWeight: '600',
//   },
//   completedCourseBadge: {
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: getVerticalSize(8),
//     paddingVertical: getVerticalSize(4),
//     borderRadius: getFontSize(12),
//     marginRight: getVerticalSize(10),
//   },
//   completedCourseText: {
//     color: '#FFFFFF',
//     fontSize: getFontSize(12),
//     fontWeight: '600',
//   },
//   liveBadge: {
//     backgroundColor: '#FF4444',
//     paddingHorizontal: getVerticalSize(8),
//     paddingVertical: getVerticalSize(4),
//     borderRadius: getFontSize(12),
//     marginRight: getVerticalSize(10),
//   },
//   liveText: {
//     color: '#FFFFFF',
//     fontSize: getFontSize(12),
//     fontWeight: '600',
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     paddingHorizontal: getVerticalSize(20),
//     borderBottomWidth: 1,
//     borderBottomColor: '#E0E0E0',
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: getVerticalSize(15),
//     alignItems: 'center',
//   },
//   activeTab: {
//     borderBottomWidth: 2,
//     borderBottomColor: '#FF6B35',
//   },
//   disabledTab: {
//     opacity: 0.5,
//   },
//   tabText: {
//     fontSize: getFontSize(16),
//     color: '#666666',
//     fontWeight: '500',
//   },
//   activeTabText: {
//     color: '#FF6B35',
//     fontWeight: 'bold',
//   },
//   disabledTabText: {
//     color: '#999999',
//   },
//   lessonsContainer: {
//     padding: getVerticalSize(20),
//   },
//   lessonItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: getVerticalSize(15),
//     padding: getVerticalSize(12),
//     backgroundColor: '#F8F8F8',
//     borderRadius: getFontSize(8),
//   },
//   lockedLessonItem: {
//     backgroundColor: '#F0F0F0',
//     opacity: 0.7,
//   },
//   lessonThumbnail: {
//     width: getFontSize(60),
//     height: getFontSize(40),
//     borderRadius: getFontSize(6),
//     marginRight: getVerticalSize(12),
//   },
//   lockedLessonThumbnail: {
//     opacity: 0.5,
//   },
//   lessonInfo: {
//     flex: 1,
//   },
//   lessonTitle: {
//     fontSize: getFontSize(16),
//     fontWeight: '600',
//     color: '#000000',
//     marginBottom: getVerticalSize(4),
//   },
//   lockedLessonTitle: {
//     color: '#999999',
//   },
//   lessonDuration: {
//     fontSize: getFontSize(14),
//     color: '#666666',
//   },
//   lockedLessonDuration: {
//     color: '#999999',
//   },
//   lockIconContainer: {
//     width: getFontSize(24),
//     height: getFontSize(24),
//     borderRadius: getFontSize(12),
//     backgroundColor: 'transparent',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: getVerticalSize(8),
//   },
//   completedBadge: {
//     width: getFontSize(24),
//     height: getFontSize(24),
//     borderRadius: getFontSize(12),
//     backgroundColor: 'transparent',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: getVerticalSize(8),
//   },
//   checkIcon: {
//     width: getFontSize(12),
//     height: getFontSize(12),
//     resizeMode: 'contain',
//     tintColor: '#FFFFFF',
//   },
//   downloadsContainer: {
//     padding: getVerticalSize(20),
//   },
//   disabledMessageContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: getVerticalSize(40),
//   },
//   disabledMessageText: {
//     fontSize: getFontSize(16),
//     color: '#999999',
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
//   enabledDownloadsContainer: {
//     paddingVertical: getVerticalSize(20),
//   },
//   downloadCertificateCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: getFontSize(8),
//     padding: getVerticalSize(16),
//     marginBottom: getVerticalSize(15),
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   downloadCertificateLeft: {
//     flex: 1,
//   },
//   downloadCertificateTitle: {
//     fontSize: getFontSize(16),
//     fontWeight: '600',
//     color: '#000000',
//   },
//   downloadCertificateRight: {
//     marginLeft: getVerticalSize(15),
//   },
//   downloadButton: {
//     padding: getVerticalSize(8),
//   },
//   certificateText: {
//     fontSize: getFontSize(14),
//     color: '#666666',
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
//   enrollButtonContainer: {
//     padding: getVerticalSize(20),
//     backgroundColor: '#FFFFFF',
//     borderTopWidth: 1,
//     borderTopColor: '#E0E0E0',
//   },
//   enrollButton: {
//     backgroundColor: '#FF8800',
//     paddingVertical: getVerticalSize(16),
//     borderRadius: getFontSize(25),
//     alignItems: 'center',
//   },
//   enrollButtonLoading: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   enrollButtonText: {
//     color: '#FFFFFF',
//     fontSize: getFontSize(18),
//     fontWeight: 'bold',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     paddingVertical: getVerticalSize(40),
//   },
//   loadingText: {
//     fontSize: getFontSize(18),
//     color: '#666666',
//     marginTop: getVerticalSize(15),
//     textAlign: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     padding: getVerticalSize(20),
//   },
//   errorText: {
//     fontSize: getFontSize(16),
//     color: '#FF0000',
//     textAlign: 'center',
//     marginBottom: getVerticalSize(20),
//   },
//   retryButton: {
//     backgroundColor: '#FF8800',
//     paddingVertical: getVerticalSize(12),
//     paddingHorizontal: getVerticalSize(25),
//     borderRadius: getFontSize(25),
//   },
//   retryButtonText: {
//     color: '#FFFFFF',
//     fontSize: getFontSize(16),
//     fontWeight: 'bold',
//   },
//   emptyLessonsContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: getVerticalSize(40),
//   },
//   emptyLessonsText: {
//     fontSize: getFontSize(16),
//     color: '#999999',
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
//   enrollButtonDisabled: {
//     opacity: 0.7,
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//   },
//   modalContainer: {
//     backgroundColor: '#FF8A00',
//     borderRadius: getFontSize(12),
//     padding: getVerticalSize(24),
//     alignItems: 'center',
//     width: '85%',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: getVerticalSize(20),
//   },
//   modalWarningIcon: {
//     width: getFontSize(32),
//     height: getFontSize(32),
//     marginRight: getVerticalSize(12),
//     tintColor: '#FFFFFF',
//   },
//   modalTitle: {
//     fontSize: getFontSize(18),
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//   },
//   modalMessage: {
//     fontSize: getFontSize(16),
//     color: '#FFFFFF',
//     textAlign: 'center',
//     marginBottom: getVerticalSize(24),
//     lineHeight: getFontSize(22),
//     fontWeight: '500',
//   },
//   modalButton: {
//     backgroundColor: '#FFFFFF',
//     paddingVertical: getVerticalSize(14),
//     paddingHorizontal: getVerticalSize(32),
//     borderRadius: getFontSize(25),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   modalButtonText: {
//     color: '#FF8A00',
//     fontSize: getFontSize(16),
//     fontWeight: 'bold',
//   },
//   paymentFailedContainer: {
//     alignItems: 'center',
//     paddingVertical: getVerticalSize(20),
//   },
//   paymentFailedText: {
//     fontSize: getFontSize(16),
//     color: '#FF0000',
//     textAlign: 'center',
//     marginBottom: getVerticalSize(15),
//   },
//   retryButton: {
//     backgroundColor: '#FF6B35',
//     paddingVertical: getVerticalSize(12),
//     paddingHorizontal: getVerticalSize(25),
//     borderRadius: getFontSize(25),
//   },
//   retryButtonText: {
//     color: '#FFFFFF',
//     fontSize: getFontSize(16),
//     fontWeight: 'bold',
//   },
//   headerCompletedBadge: {
//     backgroundColor: '#FF8800',
//     paddingHorizontal: getVerticalSize(16),
//     paddingVertical: getVerticalSize(8),
//     borderRadius: getFontSize(12),
//     shadowColor: '#FF8800',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   headerCompletedText: {
//     color: '#FFFFFF',
//     fontSize: getFontSize(14),
//     fontWeight: '600',
//     textAlign: 'center',
//   },
// });

// export default EnrollScreen;




import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  Modal,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { WebView } from 'react-native-webview';
import Orientation from 'react-native-orientation-locker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';
import { RAZORPAY_KEY_ID } from '../config/env';
import BackButton from '../Component/BackButton';
import RazorpayCheckout from 'react-native-razorpay';

const StudentIcon = require('../assests/images/student.png');
const StarIcon = require('../assests/images/star.png');
// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

// Responsive scaling factors
const scale = width / 375;
const verticalScale = height / 812;

// Responsive font sizes
const getFontSize = (size) => size * scale;
const getVerticalSize = (size) => size * verticalScale;

const EnrollScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('lessons');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const webViewRef = useRef(null);
  
  // Get safe area insets for responsive design
  const insets = useSafeAreaInsets();

  // Direct Razorpay integration - no custom class needed

  // Get user data from Redux
  const { token } = useAppSelector((state) => state.user);

  // Get course ID from route params
  const courseId = route.params?.courseId;

  // State for course data from API
  const [courseData, setCourseData] = useState({
    title: 'Loading...',
    description: 'Loading course details...',
    duration: 'Loading...',
    lessons: 0,
    enrollments: '0',
    rating: '0',
    price: 'Loading...',
    isBestSeller: false,
    isLive: false,
    liveTime: '00:00:00',
    introVideoUrl: '',
    totalStudentsEnrolled: 0,
    totalDuration: '',
    subCourseDescription: '',
    totalLessons: 0,
    lessons: [],
    paymentStatus: false, // Add paymentStatus to track enrollment
    isCompleted: false, // Add isCompleted flag initialization
  });

  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [courseError, setCourseError] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false); // Add loading state for enrollment
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle', 'processing', 'success', 'failed'
  const [refreshing, setRefreshing] = useState(false); // Add refresh state
  const [retryCount, setRetryCount] = useState(0); // Track retry attempts
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [customAlertData, setCustomAlertData] = useState({
    title: '',
    message: '',
    primaryButton: '',
    secondaryButton: '',
    onPrimaryPress: null,
    onSecondaryPress: null
  });

  // Fetch course data when component mounts
  useEffect(() => {
    if (courseId && token) {
      fetchCourseDetails();
    }
  }, [courseId, token]);

  // Handle completed flag when coming back from FeedbackScreen
  useEffect(() => {
    if (route.params?.fromFeedback && route.params?.isCompleted) {
      // Update courseData to show completed status
      setCourseData(prevData => ({
        ...prevData,
        isCompleted: true,
      }));
    }
  }, [route.params]);

  // Check if course is completed and navigate to BadgeCourseScreen (only once)
  useEffect(() => {
    if (courseData.isCompleted && !route.params?.fromFeedback) {
      // Check if user has already seen the BadgeCourse for this course
      const badgeSeenKey = `badgeSeen_${courseId}`;
      const hasSeenBadge = global.badgeSeenCourses && global.badgeSeenCourses[badgeSeenKey];

      if (!hasSeenBadge) {
        // Mark this course badge as seen
        if (!global.badgeSeenCourses) {
          global.badgeSeenCourses = {};
        }
        global.badgeSeenCourses[badgeSeenKey] = true;

        const navigationParams = {
          courseId: courseId,
          courseName: courseData.title,
          returnToEnroll: true // Flag to indicate return to EnrollScreen
        };

        // Add delay before navigation
        setTimeout(() => {
          navigation.navigate('BadgeCourse', navigationParams);
        }, 1000); // Wait for 1 second
      }
    }
  }, [courseData.isCompleted, courseId, courseData.title, navigation, route.params?.fromFeedback]);

  // Function to fetch course details from API
  const fetchCourseDetails = async () => {
    try {
      setIsLoadingCourse(true);
      setCourseError(null);

      const result = await courseAPI.getSubcourseById(token, courseId);

      if (result.success && result.data.success) {
        const apiCourse = result.data.data;

        const transformedCourse = {
          _id: apiCourse._id || courseId, // Add the subcourse ID
          title: apiCourse.subcourseName || 'Course Title',
          description: apiCourse.subCourseDescription || 'No description available',
          duration: apiCourse.totalDuration || '0h 0min',
          lessons: apiCourse.totalLessons || 0,
          enrollments: apiCourse.totalStudentsEnrolled?.toString() || '0',
          rating: apiCourse.avgRating?.toString() || '0',
          price: `₹${apiCourse.price || 1}.00`,
          isBestSeller: apiCourse.isBestSeller || false,
          isLive: false,
          liveTime: '00:00:00',
          introVideoUrl: apiCourse.introVideoUrl || '',
          totalStudentsEnrolled: apiCourse.totalStudentsEnrolled || 0,
          totalDuration: apiCourse.totalDuration || '',
          subCourseDescription: apiCourse.subCourseDescription || '',
          totalLessons: apiCourse.totalLessons || 0,
          lessons: Array.isArray(apiCourse.lessons) ? apiCourse.lessons : [],
          paymentStatus: apiCourse.paymentStatus || false,
          isCompleted: Boolean(apiCourse.isCompleted), // Ensure boolean conversion
        };

        // Set isCompleted from API response
        if (apiCourse.isCompleted === true) {
          transformedCourse.isCompleted = true;
        }

        setCourseData(transformedCourse);

      } else {
        setCourseError(result.data?.message || 'Failed to fetch course details');
      }
    } catch (error) {
      setCourseError(error.message || 'Network error occurred');
    } finally {
      setIsLoadingCourse(false);
    }
  };

  // Function to handle pull-to-refresh
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchCourseDetails();
    } catch (error) {
      // Handle refresh error silently
    } finally {
      setRefreshing(false);
    }
  };

  // Function to calculate live time from lesson start times
  const calculateLiveTime = () => {
    if (!courseData.lessons || courseData.lessons.length === 0) {
      return null;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const currentTimeInSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond;

    // Find the next lesson based on start time
    let nextLesson = null;
    let minTimeDiff = Infinity;

    courseData.lessons.forEach(lesson => {
      if (lesson.startTime) {
        const [startHour, startMinute] = lesson.startTime.split(':').map(Number);
        const lessonStartSeconds = startHour * 3600 + startMinute * 60; // Convert to seconds

        // Calculate time difference in seconds
        let timeDiff = lessonStartSeconds - currentTimeInSeconds;

        // If lesson already started today, check for next occurrence (tomorrow)
        if (timeDiff <= 0) {
          timeDiff += 24 * 3600; // Add 24 hours (86400 seconds)
        }

        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          nextLesson = lesson;
        }
      }
    });

    if (!nextLesson || minTimeDiff === Infinity) {
      return null;
    }

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(minTimeDiff / 3600);
    const minutes = Math.floor((minTimeDiff % 3600) / 60);
    const seconds = minTimeDiff % 60;

    // Format the time string as HH:MM:SS
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return timeString;
  };

  // State for live time countdown
  const [liveTime, setLiveTime] = useState('');

  // Update live time every second
  useEffect(() => {
    if (courseData.lessons && courseData.lessons.length > 0) {
      const interval = setInterval(() => {
        const calculatedTime = calculateLiveTime();
        if (calculatedTime) {
          setLiveTime(calculatedTime);
        } else {
          setLiveTime('');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [courseData.lessons]);

  // Handle orientation and full-screen mode
  useEffect(() => {
    if (isFullScreen) {
      Orientation.lockToLandscape();
      StatusBar.setHidden(true);
    } else {
      Orientation.lockToPortrait();
      StatusBar.setHidden(false);
    }

    return () => {
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);
    };
  }, [isFullScreen]);

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
  };

  const handleEnrollNow = async () => {
    try {
      // Check if user is already enrolled
      if (courseData.paymentStatus) {
        Alert.alert('Already Enrolled', 'You are already enrolled in this course!');
        return;
      }

      setIsEnrolling(true);
      setPaymentStatus('processing');

      // Check if we have required data
      if (!courseId || !token) {
        setPaymentStatus('failed');
        Alert.alert(
          'Authentication Required',
          'Please log in again to continue with the payment.',
          [
            {
              text: 'Login',
              onPress: () => {
                navigation.navigate('Login');
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
        return;
      }

      // Extract price from courseData.price (format: "₹99.00")
      const priceString = courseData.price.replace('₹', '').replace('.00', '');
      const priceInRupees = parseFloat(priceString) || 1;
      const priceInPaise = Math.round(priceInRupees * 100);

      const orderResult = await courseAPI.createCourseOrder(token, courseId, priceInPaise);

      if (!orderResult.success || !orderResult.data.success) {
        setPaymentStatus('failed');
        Alert.alert(
          'Order Creation Failed',
          orderResult.data?.message || 'Unable to create your order. Please try again.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                setPaymentStatus('idle');
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
        return;
      }

      const orderData = orderResult.data.data;

      // Validate order data
      if (!orderData.amount || !orderData.orderId) {
        setPaymentStatus('failed');
        Alert.alert('Error', 'Invalid order data received. Please try again.');
        return;
      }

      // Open Razorpay payment interface
      const paymentData = await handlePaymentWithRazorpay(orderData);

      if (!paymentData) {
        return; // Payment was cancelled or failed
      }

      // Validate payment data - check for both possible field name formats
      const paymentId = paymentData.razorpay_payment_id || paymentData.razorpayPaymentId;
      const signature = paymentData.razorpay_signature || paymentData.razorpaySignature;
      const orderId = paymentData.razorpay_order_id || paymentData.razorpayOrderId;

      if (!paymentId || !signature) {
        setPaymentStatus('failed');
        Alert.alert('Error', 'Invalid payment data received. Please contact support.');
        return;
      }

      const verificationResult = await courseAPI.verifyPayment(
        token,
        orderData.orderId,
        paymentId,
        signature,
        courseId // Pass courseId as subcourseId
      );

      if (verificationResult.success && verificationResult.data.success) {
        setPaymentStatus('success');

        // Update local state to reflect enrollment
        setCourseData(prevData => ({
          ...prevData,
          paymentStatus: true,
        }));

        // Show success message and navigate to MyCourses
        Alert.alert(
          'Success! 🎉',
          'Payment successful! You are now enrolled in the course.',
          [
            {
              text: 'Continue',
              onPress: () => {
                navigation.navigate('Home', { screen: 'Courses' });
              }
            }
          ]
        );
      } else {
        setPaymentStatus('failed');
        Alert.alert('Error', 'Payment verification failed. Please contact support.');
      }

    } catch (error) {
      setPaymentStatus('failed');

      // Handle specific Razorpay errors with better user experience
      if (error.message === 'PAYMENT_CANCELLED') {
        Alert.alert(
          'Payment Cancelled',
          'You cancelled the payment. No charges were made to your account.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                setRetryCount(prev => prev + 1);
                setPaymentStatus('idle');
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      } else if (error.message === 'PAYMENT_FAILED') {
        Alert.alert(
          'Payment Failed',
          'Your payment could not be processed. Please check your payment details and try again.',
          [
            {
              text: 'Retry Payment',
              onPress: () => {
                setPaymentStatus('idle');
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      } else if (error.message === 'PAYMENT_CONFIGURATION_ERROR') {
        Alert.alert(
          'Configuration Error',
          'There seems to be a configuration issue with the payment gateway. Our team has been notified.',
          [
            {
              text: 'OK',
              style: 'default'
            }
          ]
        );
      } else if (error.message === 'PAYMENT_NETWORK_ERROR') {
        Alert.alert(
          'Network Error',
          'Please check your internet connection and try again. If the problem persists, please contact support.',
          [
            {
              text: 'Retry',
              onPress: () => {
                setPaymentStatus('idle');
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      } else if (error.message && error.message.startsWith('PAYMENT_ERROR:')) {
        const errorMessage = error.message.replace('PAYMENT_ERROR: ', '');
        showCustomPaymentErrorAlert(
          'Payment Error',
          'We encountered an issue processing your payment. This might be due to invalid payment details or a temporary service issue.',
          'Try Again',
          'Cancel'
        );
      } else {
        Alert.alert(
          'Something went wrong',
          'We encountered an unexpected error. Please try again or contact support if the problem persists.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                setPaymentStatus('idle');
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  // Function to reset payment status
  const resetPaymentStatus = () => {
    setPaymentStatus('idle');
    setRetryCount(0);
  };

  // Function to check if retry is allowed
  const canRetry = () => {
    return retryCount < 3; // Allow maximum 3 retries
  };

  // Function to show custom payment error alert
  const showCustomPaymentErrorAlert = (title, message, primaryButton, secondaryButton) => {
    setCustomAlertData({
      title,
      message,
      primaryButton,
      secondaryButton,
      onPrimaryPress: () => {
        setRetryCount(prev => prev + 1);
        setPaymentStatus('idle');
        setShowCustomAlert(false);
      },
      onSecondaryPress: () => {
        setShowCustomAlert(false);
        // Cancel action - just close the modal
      }
    });
    setShowCustomAlert(true);
  };

  // Function to get user profile data for Razorpay prefill
  const getUserProfileData = () => {
    // You can get this from Redux store or API
    // For now, using placeholder data
    return {
      email: 'student@learningsaint.com',
      contact: '9876543210',
      name: 'Student Name'
    };
  };

  // Function to handle payment with direct Razorpay
  const handlePaymentWithRazorpay = async (orderData) => {
    if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
      Alert.alert('Error', 'Razorpay payment gateway is not available. Please try again later.');
      setPaymentStatus('failed');
      return null;
    }

    try {
      // Validate Razorpay key is available
      if (!RAZORPAY_KEY_ID) {
        Alert.alert('Error', 'Razorpay configuration not found. Please contact support.');
        setPaymentStatus('failed');
        return null;
      }

      const userProfile = getUserProfileData();

      // Calculate priceInPaise from courseData.price
      if (!courseData.price || typeof courseData.price !== 'string') {
        throw new Error('Invalid course price. Please refresh and try again.');
      }

      const priceString = courseData.price.replace('₹', '').replace('.00', '');
      const priceInRupees = parseFloat(priceString);

      if (isNaN(priceInRupees) || priceInRupees <= 0) {
        throw new Error('Invalid course price. Please contact support.');
      }

      const priceInPaise = Math.round(priceInRupees * 100);

      // Use the calculated price from frontend
      const finalAmount = priceInPaise;

      const razorpayOptions = {
        description: `Course: ${courseData.title}`,
        currency: 'INR',
        key: RAZORPAY_KEY_ID,
        amount: finalAmount,
        name: 'Learning Saint',
        order_id: orderData.orderId,
        prefill: {
          email: userProfile.email,
          contact: userProfile.contact,
          name: userProfile.name
        },
        theme: {
          color: '#FF6B35'
        }
      };

      // Validate Razorpay options
      if (!razorpayOptions.key || !razorpayOptions.amount || !razorpayOptions.order_id) {
        throw new Error('Invalid Razorpay options: missing key, amount, or order_id');
      }

      const paymentData = await RazorpayCheckout.open(razorpayOptions);
      return paymentData;
    } catch (razorpayError) {
      // Handle specific Razorpay errors with better user experience
      if (razorpayError.code === 'PAYMENT_CANCELLED' || razorpayError.message === 'PAYMENT_CANCELLED') {
        throw new Error('PAYMENT_CANCELLED');
      } else if (razorpayError.code === 'PAYMENT_FAILED' || razorpayError.message === 'PAYMENT_FAILED') {
        throw new Error('PAYMENT_FAILED');
      } else if (razorpayError.code === 'BAD_REQUEST_ERROR') {
        throw new Error('PAYMENT_ERROR: Invalid payment parameters. Please check your payment details and try again.');
      } else if (razorpayError.code === 'GATEWAY_ERROR') {
        throw new Error('PAYMENT_NETWORK_ERROR');
      } else if (razorpayError.code === 'NETWORK_ERROR') {
        throw new Error('PAYMENT_NETWORK_ERROR');
      } else if (razorpayError.message && razorpayError.message.includes('Invalid Razorpay configuration')) {
        throw new Error('PAYMENT_CONFIGURATION_ERROR');
      } else {
        // Provide a more user-friendly error message
        const userFriendlyMessage = razorpayError.description || razorpayError.message || 'Payment processing failed';
        throw new Error(`PAYMENT_ERROR: ${userFriendlyMessage}`);
      }
    }
  };

  const handleStudentIconClick = () => {
    navigation.navigate('Student', { subcourseId: courseId });
  };

  const handleStarIconClick = () => {
    // Use courseData._id if available, otherwise fall back to route params
    const subcourseIdToPass = courseData._id || courseId;
    navigation.navigate('Review', { subcourseId: subcourseIdToPass });
  };

  const handleLiveClick = () => {
    // Live click handler
  };

  const handleDownloadCertificate = async () => {
    try {
      // Check payment status from existing courseData
      if (courseData.paymentStatus === true) {
        navigation.navigate('DownloadCertificate', { courseId: courseId });
        return;
      } else {
        setShowDownloadModal(true);
        return;
      }
    } catch (error) {
      // On error, show the popup to be safe
      setShowDownloadModal(true);
    }
  };

  const onMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.event === 'fullscreen') {
      setIsFullScreen(data.value);
    }
  };

  const injectedJavaScript = `
    (function() {
      // Add CSS styles to hide native progress bar and create custom one
      const style = document.createElement('style');
      style.textContent = \`
        /* Hide native video progress bar */
        video::-webkit-media-controls-timeline {
          display: none !important;
        }
        video::-moz-range-track {
          display: none !important;
        }
        video::-ms-fill-lower,
        video::-ms-fill-upper {
          display: none !important;
        }
        
        /* Custom progress bar container */
        .custom-progress-container {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 20px;
          z-index: 1000;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 8px 0;
        }
        
        /* Custom progress bar track */
        .custom-progress-track {
          position: relative;
          width: 100%;
          height: 4px;
          background: #E0E0E0;
          border-radius: 2px;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
        }
        
        /* Custom progress bar fill */
        .custom-progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(to right, #F6B800, #FF8800);
          border-radius: 2px;
          transition: width 0.1s ease;
        }
        
        /* Custom progress bar thumb */
        .custom-progress-thumb {
          position: absolute;
          top: 50%;
          right: -8px;
          width: 16px;
          height: 16px;
          background: #FF8800;
          border: 2px solid #FFFFFF;
          border-radius: 50%;
          transform: translateY(-50%);
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          transition: all 0.1s ease;
        }
        
        /* Hover effect for thumb */
        .custom-progress-container:hover .custom-progress-thumb {
          transform: translateY(-50%) scale(1.2);
        }
        
        /* Additional control styling */
        video::-webkit-media-controls-panel {
          background: rgba(0,0,0,0.8) !important;
        }
        video::-webkit-media-controls-current-time-display,
        video::-webkit-media-controls-time-remaining-display {
          color: #FFFFFF !important;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
        }
        video::-webkit-media-controls-play-button,
        video::-webkit-media-controls-seek-back-button,
        video::-webkit-media-controls-seek-forward-button {
          background-color: #FF8800 !important;
          border-radius: 50% !important;
        }
        video::-webkit-media-controls-volume-slider {
          background: linear-gradient(to right, #F6B800, #FF8800) !important;
        }
        video::-webkit-media-controls-volume-slider::-webkit-slider-thumb {
          background: #FF8800 !important;
          border: 2px solid #FFFFFF !important;
        }
      \`;
      document.head.appendChild(style);
      
      // Wait for video to load and apply custom progress bar
      const applyVideoStyling = () => {
        const video = document.querySelector('video');
        if (video) {
          // Create custom progress bar container
          const progressContainer = document.createElement('div');
          progressContainer.className = 'custom-progress-container';
          
          // Create progress track
          const progressTrack = document.createElement('div');
          progressTrack.className = 'custom-progress-track';
          
          // Create progress fill
          const progressFill = document.createElement('div');
          progressFill.className = 'custom-progress-fill';
          
          // Create progress thumb
          const progressThumb = document.createElement('div');
          progressThumb.className = 'custom-progress-thumb';
          
          // Assemble the progress bar
          progressTrack.appendChild(progressFill);
          progressTrack.appendChild(progressThumb);
          progressContainer.appendChild(progressTrack);
          video.parentNode.appendChild(progressContainer);
          
          let isDragging = false;
          
          // Update progress based on video progress
          const updateProgress = () => {
            if (video.duration && !isNaN(video.duration) && !isDragging) {
              const progress = (video.currentTime / video.duration) * 100;
              progressFill.style.width = progress + '%';
            }
          };
          
          // Seek to position based on click/drag
          const seekToPosition = (event) => {
            if (!video.duration || isNaN(video.duration)) return;
            
            const rect = progressTrack.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
            const newTime = (percentage / 100) * video.duration;
            
            video.currentTime = newTime;
            progressFill.style.width = percentage + '%';
          };
          
          // Mouse events for seeking
          progressContainer.addEventListener('click', seekToPosition);
          
          // Touch events for mobile
          progressContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDragging = true;
            seekToPosition(e.touches[0]);
          });
          
          progressContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (isDragging) {
              seekToPosition(e.touches[0]);
            }
          });
          
          progressContainer.addEventListener('touchend', (e) => {
            e.preventDefault();
            isDragging = false;
          });
          
          // Mouse drag events
          progressContainer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;
            seekToPosition(e);
            
            const handleMouseMove = (e) => {
              if (isDragging) {
                seekToPosition(e);
              }
            };
            
            const handleMouseUp = () => {
              isDragging = false;
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          });
          
          // Video event listeners
          video.addEventListener('timeupdate', updateProgress);
          video.addEventListener('loadedmetadata', updateProgress);
          
          // Add fullscreen event listeners
          video.addEventListener('webkitfullscreenchange', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              event: 'fullscreen',
              value: document.webkitIsFullScreen
            }));
          });
          video.addEventListener('fullscreenchange', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              event: 'fullscreen',
              value: document.fullscreenElement !== null
            }));
          });
        }
      };
      
      // Apply styling when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyVideoStyling);
      } else {
        applyVideoStyling();
      }
      
      // Also try to apply styling after a short delay to catch dynamically loaded videos
      setTimeout(applyVideoStyling, 1000);
    })();
    true;
  `;

  const renderVideoPlayer = () => (
    <View style={[styles.videoContainer, isFullScreen && styles.fullScreenVideoContainer]}>
      {isVideoPlaying ? (
        <WebView
          ref={webViewRef}
          source={{ uri: courseData.introVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          onMessage={onMessage}
          injectedJavaScript={injectedJavaScript}
          renderLoading={() => <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>Loading Video...</Text>}
        />
      ) : (
        <View style={styles.videoThumbnail}>
          <Image
            source={require('../assests/images/Course.png')}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
          <View style={styles.thumbnailOverlay}>
            <Text style={styles.thumbnailText}>Video Preview</Text>
          </View>
        </View>
      )}
      {!isVideoPlaying && (
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayVideo}
        >
          <View style={styles.playIconContainer}>
            <View style={styles.playTriangle} />
          </View>
        </TouchableOpacity>
      )}
      {isFullScreen && (
        <TouchableOpacity
          style={styles.exitFullScreenButton}
          onPress={() => {
            setIsFullScreen(false);
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript(`
                document.exitFullscreen();
                true;
              `);
            }
          }}
        >
          <Text style={styles.exitFullScreenText}>Exit Full Screen</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCourseInfo = () => (
    <View style={[styles.courseInfoContainer, isFullScreen && { display: 'none' }]}>
      <View style={styles.engagementMetrics}>
        <TouchableOpacity style={styles.metricItem} onPress={handleStudentIconClick}>
          <Image source={StudentIcon} style={styles.metricIcon} />
          <Text style={styles.metricText}>
            {typeof courseData.enrollments === 'string' ? courseData.enrollments : '0'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.metricItem} onPress={handleStarIconClick}>
          <Image source={StarIcon} style={styles.metricIcon} />
          <Text style={styles.metricText}>
            {typeof courseData.rating === 'string' ? courseData.rating : '0'}
          </Text>
        </TouchableOpacity>
        {courseData.isBestSeller && (
          <LinearGradient
            colors={['#FF8800', '#FF6B00']}
            style={styles.bestSellerBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.bestSellerText}>Best Seller</Text>
          </LinearGradient>
        )}

        {liveTime && (
          <TouchableOpacity style={styles.liveBadge} onPress={handleLiveClick}>
            <Text style={styles.liveText}>
              Live In <Text style={styles.liveTimeText}>{liveTime}</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.courseTitle}>
        {typeof courseData.title === 'string' ? courseData.title : 'Course Title'}
      </Text>
      <Text style={styles.courseDescription}>
        {typeof courseData.description === 'string' ? courseData.description : 'No description available'}
      </Text>



      <View style={styles.courseStats}>
        <View style={styles.statItem}>
          <Icon name="time-outline" size={getFontSize(16)} color="#FF8800" style={styles.statIcon} />
          <Text style={styles.statText}>
            {typeof courseData.duration === 'string' ? courseData.duration : '0h 0min'}
          </Text>
        </View>
        <View style={styles.separator} />
        <Text style={styles.lessonsText}>
          {typeof courseData.totalLessons === 'number' ? courseData.totalLessons : 0} lessons
        </Text>
      </View>
    </View>
  );

  const renderTabs = () => {
    return (
      <View style={[styles.tabsContainer, isFullScreen && { display: 'none' }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lessons' && styles.activeTab]}
          onPress={() => setActiveTab('lessons')}
        >
          <Text style={[styles.tabText, activeTab === 'lessons' && styles.activeTabText]}>
            Lessons
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'downloads' && styles.activeTab
          ]}
          onPress={() => {
            setActiveTab('downloads');
          }}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'downloads' && styles.activeTabText
          ]}>
            Downloads
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLessons = () => {
    // Add extra safety check
    if (!courseData.lessons || !Array.isArray(courseData.lessons) || courseData.lessons.length === 0) {
      return (
        <View style={styles.lessonsContainer}>
          <View style={styles.emptyLessonsContainer}>
            <Text style={styles.emptyLessonsText}>No lessons available yet</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.lessonsContainer}>
        {courseData.lessons.map((lesson, index) => {
          // Extra safety checks for each property
          const lessonTitle = lesson && lesson.lessonName && typeof lesson.lessonName === 'string'
            ? lesson.lessonName
            : `Lesson ${index + 1}`;

          const lessonDuration = lesson && lesson.duration && typeof lesson.duration === 'string'
            ? lesson.duration
            : '0 mins';

          // Ensure thumbnail is valid
          const thumbnailSource = lesson && lesson.thumbnailImageUrl && typeof lesson.thumbnailImageUrl === 'string'
            ? { uri: lesson.thumbnailImageUrl }
            : require('../assests/images/Course.png');

          // Check if lesson should be locked
          const isFirstLesson = index === 0;
          const isLessonLocked = !courseData.paymentStatus ||
            (!isFirstLesson && !courseData.lessons[index - 1]?.isCompleted);

          return (
            <TouchableOpacity
              key={`lesson-${index}`}
              style={styles.lessonItem}
              onPress={() => {
                if (isLessonLocked) {
                  if (!courseData.paymentStatus) {
                    Alert.alert('Lesson Locked', 'Please enroll in the course first to access this lesson.');
                  } else {
                    Alert.alert('Lesson Locked', 'Please complete the previous lesson first to unlock this one.');
                  }
                  return;
                }

                if (courseData.paymentStatus) {
                  navigation.navigate('LessonVideo', { lessonId: lesson.lessonId });
                }
              }}
              disabled={isLessonLocked}
            >
              <Image
                source={thumbnailSource}
                style={styles.lessonThumbnail}
              />
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>
                  {lessonTitle}
                </Text>
                <Text style={styles.lessonDuration}>
                  {lessonDuration}
                </Text>
              </View>

              {/* Show lock icon for locked lessons */}
              {isLessonLocked && (
                <View style={styles.lockIconContainer}>
                  <Icon name="lock-closed" size={24} color="#999999" />
                </View>
              )}

              {/* Show completed badge for completed lessons */}
              {lesson.isCompleted && !isLessonLocked && (
                <View style={styles.completedBadge}>
                  <Icon name="checkmark-circle" size={24} color="#2285FA" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderDownloads = () => (
    <View style={styles.downloadsContainer}>
      <View style={styles.enabledDownloadsContainer}>
        <TouchableOpacity
          style={styles.downloadCertificateCard}
          onPress={handleDownloadCertificate}
        >
          <View style={styles.downloadCertificateLeft}>
            <Text style={styles.downloadCertificateTitle}>Download Module Certificate </Text>
          </View>
          <View style={styles.downloadCertificateRight}>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownloadCertificate}
              onPressIn={(e) => e.stopPropagation()}
            >
              <Icon name="download-outline" size={24} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        <Text style={styles.certificateText}>Certificate</Text>
      </View>

      {/* Popup Modal for incomplete course */}
      <Modal
        visible={showDownloadModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDownloadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Close Icon in top right corner */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDownloadModal(false)}
            >
              <Icon name="close" size={24} color="#FF8800" />
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <Icon name="warning" size={60} color="#FFFFFF" style={{ marginRight: getVerticalSize(12) }} />
            </View>

            <Text style={styles.modalMessage}>
              First you have to complete Your course to download Cirtificate
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { width: '100%', alignItems: 'center', justifyContent: 'center' }]}
              onPress={() => setShowDownloadModal(false)}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isFullScreen && styles.fullScreenContainer]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" hidden={isFullScreen} />
      {!isFullScreen && (
        <View style={styles.header}>
          <BackButton onPress={() => navigation.navigate('Home', { screen: 'Courses' })} />
          <Text style={styles.headerTitle}>
            {(() => {
              const title = typeof courseData.title === 'string' ? courseData.title : 'Course Title';
              const words = title.split(' ');
              return words.slice(0, 2).join(' ');
            })()}
          </Text>
          {courseData.isCompleted && (
            <LinearGradient
              colors={['#FF8800', '#FF6B00']}
              style={styles.headerCompletedBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.headerCompletedText}>Completed</Text>
            </LinearGradient>
          )}
        </View>
      )}

      <ScrollView
        style={[styles.scrollView, isFullScreen && { display: 'none' }]}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Platform.OS === 'android' 
              ? Math.max(insets.bottom, 10) + 100 
              : insets.bottom + 100
          }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
            title="Pull to refresh..."
            titleColor="#FF6B35"
          />
        }
      >
        {isLoadingCourse ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Loading course details...</Text>
          </View>
        ) : courseError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {courseError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCourseDetails}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {renderVideoPlayer()}
            {renderCourseInfo()}
            {renderTabs()}
            {activeTab === 'lessons' ? renderLessons() : renderDownloads()}
          </>
        )}
      </ScrollView>

      {!isFullScreen && !courseData.paymentStatus && (
        <View style={[
          styles.enrollButtonContainer,
          {
            paddingBottom: Platform.OS === 'android' 
              ? Math.max(insets.bottom, 10) + 20 
              : insets.bottom + 20,
            marginBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 10) : insets.bottom
          }
        ]}>
          {paymentStatus === 'failed' ? (
            <View style={styles.paymentFailedContainer}>
           
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  resetPaymentStatus();
                  handleEnrollNow();
                }}
              >
                <Text style={styles.retryButtonText}>Retry Payment</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.enrollButton, isEnrolling && styles.enrollButtonDisabled]}
              onPress={handleEnrollNow}
              disabled={isEnrolling}
            >
              {isEnrolling ? (
                <View style={styles.enrollButtonLoading}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.enrollButtonText}>Processing Payment...</Text>
                </View>
              ) : (
                <Text style={styles.enrollButtonText}>
                  Enroll  - {courseData.price}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Custom Payment Error Alert */}
      <Modal
        visible={showCustomAlert}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomAlert(false)}
      >
        <View style={styles.customAlertOverlay}>
          <View style={styles.customAlertContainer}>
            {/* Error Icon */}
            <View style={styles.customAlertIconContainer}>
              <View style={styles.customAlertIcon}>
                <Text style={styles.customAlertIconText}>⚠️</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.customAlertTitle}>{customAlertData.title}</Text>

            {/* Message */}
            <Text style={styles.customAlertMessage}>{customAlertData.message}</Text>

            {/* Buttons */}
            <View style={styles.customAlertButtonsContainer}>
              <TouchableOpacity
                style={[styles.customAlertButton, styles.customAlertSecondaryButton]}
                onPress={customAlertData.onSecondaryPress}
              >
                <Text style={styles.customAlertSecondaryButtonText}>
                  {customAlertData.secondaryButton}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.customAlertButton, styles.customAlertPrimaryButton]}
                onPress={customAlertData.onPrimaryPress}
              >
                <Text style={styles.customAlertPrimaryButtonText}>
                  {customAlertData.primaryButton}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fullScreenContainer: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getVerticalSize(20),
    paddingTop: Platform.OS === 'ios' ? getVerticalSize(15) : getVerticalSize(25),
    paddingBottom: getVerticalSize(15),
    marginTop: getVerticalSize(10),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    flex: 1,
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginHorizontal: getVerticalSize(10),
  },
  placeholder: {
    width: getFontSize(40),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  videoContainer: {
    width: '100%',
    height: getVerticalSize(250),
    position: 'relative',


  },
  fullScreenVideoContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,

  },
  webView: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -getFontSize(30) }, { translateY: -getFontSize(30) }],
  },
  playIconContainer: {
    width: getFontSize(60),
    height: getFontSize(60),
    borderRadius: getFontSize(30),
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: getFontSize(12),
    borderRightWidth: 0,
    borderBottomWidth: getFontSize(8),
    borderTopWidth: getFontSize(8),
    borderLeftColor: '#FFFFFF',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    marginLeft: getFontSize(2),
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailText: {
    color: '#FFFFFF',
    fontSize: getFontSize(18),
    fontWeight: 'bold',
  },
  exitFullScreenButton: {
    position: 'absolute',
    top: getVerticalSize(20),
    right: getVerticalSize(20),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: getVerticalSize(10),
    borderRadius: getFontSize(5),
  },
  exitFullScreenText: {
    color: '#FFFFFF',
    fontSize: getFontSize(14),
    fontWeight: '600',
  },
  courseInfoContainer: {
    padding: getVerticalSize(20),
    backgroundColor: '#FFFFFF',
  },
  courseTitle: {
    fontSize: getFontSize(24),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: getVerticalSize(10),
  },
  courseDescription: {
    fontSize: getFontSize(16),
    color: 'black',
    lineHeight: getFontSize(24),
    marginBottom: getVerticalSize(15),
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: getVerticalSize(15),
  },
  statIcon: {
    marginRight: getVerticalSize(5),
  },
  statText: {
    fontSize: getFontSize(14),
    color: '#666666',
  },
  separator: {
    width: 1,
    height: getFontSize(16),
    backgroundColor: '#E0E0E0',
    marginRight: getVerticalSize(15),
  },
  lessonsText: {
    fontSize: getFontSize(14),
    color: '#666666',
  },
  engagementMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getVerticalSize(15),
    flexWrap: 'nowrap',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: getVerticalSize(8),
    backgroundColor: '#006C990D',
    paddingHorizontal: getVerticalSize(8),
    paddingVertical: getVerticalSize(6),
    borderRadius: getVerticalSize(6),
  },
  metricIcon: {
    width: getFontSize(16),
    height: getFontSize(16),
    marginRight: getVerticalSize(5),
    resizeMode: 'contain',
  },
  metricText: {
    fontSize: getFontSize(14),
    color: '#666666',
  },
  bestSellerBadge: {
    paddingHorizontal: getVerticalSize(10),
    paddingVertical: getVerticalSize(5),
    borderRadius: getFontSize(14),
    marginRight: getVerticalSize(8),
    shadowColor: '#FF8800',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bestSellerText: {
    color: '#FFFFFF',
    fontSize: getFontSize(12),
    fontWeight: '600',
    textAlign: 'center',
  },
  liveBadge: {
    backgroundColor: 'transparent',
    paddingHorizontal: getVerticalSize(6),
    paddingVertical: getVerticalSize(5),
    marginRight: getVerticalSize(8),
  },
  liveText: {
    color: '#333333',
    fontSize: getFontSize(14),
    fontWeight: '500',
  },
  liveTimeText: {
    color: '#FF8800',
    fontSize: getFontSize(14),
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: getVerticalSize(20),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: getVerticalSize(15),
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
  },
  tabText: {
    fontSize: getFontSize(16),
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  lessonsContainer: {
    padding: getVerticalSize(20),
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getVerticalSize(15),
    padding: getVerticalSize(12),
    backgroundColor: '#F8F8F8',
    borderRadius: getFontSize(8),
  },
  lessonThumbnail: {
    width: getFontSize(60),
    height: getFontSize(40),
    borderRadius: getFontSize(6),
    marginRight: getVerticalSize(12),
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: getFontSize(16),
    fontWeight: '600',
    color: '#000000',
    marginBottom: getVerticalSize(4),
  },
  lessonDuration: {
    fontSize: getFontSize(14),
    color: '#666666',
  },
  lockIconContainer: {
    width: getFontSize(24),
    height: getFontSize(24),
    borderRadius: getFontSize(12),
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: getVerticalSize(8),
  },
  completedBadge: {
    width: getFontSize(24),
    height: getFontSize(24),
    borderRadius: getFontSize(12),
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: getVerticalSize(8),
  },
  downloadsContainer: {
    padding: getVerticalSize(20),
  },
  enabledDownloadsContainer: {
    paddingVertical: getVerticalSize(20),
  },
  downloadCertificateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: getFontSize(8),
    padding: getVerticalSize(16),
    marginBottom: getVerticalSize(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  downloadCertificateLeft: {
    flex: 1,
  },
  downloadCertificateTitle: {
    fontSize: getFontSize(16),
    fontWeight: '600',
    color: '#000000',
  },
  downloadCertificateRight: {
    marginLeft: getVerticalSize(15),
  },
  downloadButton: {
    padding: getVerticalSize(8),
  },
  certificateText: {
    fontSize: getFontSize(14),
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  enrollButtonContainer: {
    padding: getVerticalSize(20),
    paddingTop: getVerticalSize(15),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'relative',
    zIndex: 10,
  },
  enrollButton: {
    backgroundColor: '#FF8800',
    paddingVertical: getVerticalSize(16),
    borderRadius: getFontSize(25),
    alignItems: 'center',
  },
  enrollButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrollButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(18),
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: getVerticalSize(40),
  },
  loadingText: {
    fontSize: getFontSize(18),
    color: '#666666',
    marginTop: getVerticalSize(15),
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: getVerticalSize(20),
  },
  errorText: {
    fontSize: getFontSize(16),
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: getVerticalSize(20),
  },
  retryButton: {
    backgroundColor: '#FF8800',
    paddingVertical: getVerticalSize(12),
    paddingHorizontal: getVerticalSize(25),
    borderRadius: getFontSize(25),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(16),
    fontWeight: 'bold',
  },
  emptyLessonsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getVerticalSize(40),
  },
  emptyLessonsText: {
    fontSize: getFontSize(16),
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  enrollButtonDisabled: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    backgroundColor: '#FF8A00',
    borderRadius: getFontSize(12),
    padding: getVerticalSize(24),
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: getVerticalSize(-15),
    right: getVerticalSize(12),
    zIndex: 1,
    padding: getVerticalSize(8),
    borderRadius: getFontSize(20),
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getVerticalSize(20),
  },
  modalTitle: {
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalMessage: {
    fontSize: getFontSize(16),
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: getVerticalSize(24),
    lineHeight: getFontSize(22),
    fontWeight: '500',
  },
  modalButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: getVerticalSize(14),
    paddingHorizontal: getVerticalSize(40),
    borderRadius: getFontSize(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalButtonText: {
    color: '#FF8A00',
    fontSize: getFontSize(16),
    fontWeight: 'bold',
  },
  paymentFailedContainer: {
    alignItems: 'center',
    paddingVertical: getVerticalSize(20),
  },
  paymentFailedText: {
    fontSize: getFontSize(16),
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: getVerticalSize(15),
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: getVerticalSize(12),
    paddingHorizontal: getVerticalSize(25),
    borderRadius: getFontSize(25),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(16),
    fontWeight: 'bold',
  },
  headerCompletedBadge: {
    paddingHorizontal: getVerticalSize(16),
    paddingVertical: getVerticalSize(8),
    borderRadius: getFontSize(10),
    shadowColor: '#FF8800',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCompletedText: {
    color: '#FFFFFF',
    fontSize: getFontSize(14),
    fontWeight: '600',
    textAlign: 'center',
  },

  // Custom Alert Styles
  customAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getVerticalSize(20),
  },
  customAlertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: getFontSize(20),
    padding: getVerticalSize(30),
    alignItems: 'center',
    width: '100%',
    maxWidth: getVerticalSize(350),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  customAlertIconContainer: {
    marginBottom: getVerticalSize(20),
  },
  customAlertIcon: {
    width: getVerticalSize(60),
    height: getVerticalSize(60),
    borderRadius: getVerticalSize(30),
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  customAlertIconText: {
    fontSize: getFontSize(30),
  },
  customAlertTitle: {
    fontSize: getFontSize(20),
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: getVerticalSize(15),
  },
  customAlertMessage: {
    fontSize: getFontSize(16),
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: getFontSize(22),
    marginBottom: getVerticalSize(30),
  },
  customAlertButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: getVerticalSize(15),
  },
  customAlertButton: {
    flex: 1,
    paddingVertical: getVerticalSize(15),
    paddingHorizontal: getVerticalSize(20),
    borderRadius: getFontSize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  customAlertSecondaryButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  customAlertPrimaryButton: {
    backgroundColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  customAlertSecondaryButtonText: {
    color: '#7F8C8D',
    fontSize: getFontSize(16),
    fontWeight: '600',
  },
  customAlertPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(16),
    fontWeight: 'bold',
  },
});

export default EnrollScreen;