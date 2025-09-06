import React, { useState, useEffect, useCallback } from 'react';
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
  Linking,
  Modal,
} from 'react-native';
import RNFS from 'react-native-fs';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import BackButton from '../Component/BackButton';
import { useAppSelector } from '../Redux/hooks';
import { getApiUrl, API_CONFIG } from '../API/config';
import { courseAPI } from '../API/courseAPI';
import { RAZORPAY_KEY_ID } from '../config/env';
import RazorpayCheckout from 'react-native-razorpay';

console.log('✅ InternshipLetterScreen: Direct Razorpay import successful');

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const InternshipLetterScreen = () => {
  console.log('🚀 InternshipLetterScreen: Component initialized');
  
  // Suppress all console errors to prevent red error warnings
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Only log to console, don't show red error warnings
    originalConsoleError(...args);
  };
  
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAppSelector((state) => state.user);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestData, setRequestData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPageRefreshing, setIsPageRefreshing] = useState(false);


  console.log('course price:', courseData);
  
  // Custom Alert State
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // info, success, error, warning
    buttons: [],
    showSpinner: false
  });
  
  console.log('🔍 InternshipLetterScreen: Initial state values:', {
    hasNavigation: !!navigation,
    hasRoute: !!route,
    hasToken: !!token,
    courseId: route.params?.courseId
  });
  
  // Direct Razorpay integration - no custom class needed

  // Get courseId from route params
  const courseId = route.params?.courseId;
  console.log('🔍 InternshipLetterScreen: courseId from route params:', courseId);

  // Get user data from Redux store at component level
  const userState = useAppSelector((state) => state.user);
  
  // Function to get user profile data (no hooks inside)
  const getUserProfileData = () => {
    console.log('👤 InternshipLetterScreen: getUserProfileData called');
    return {
      email: userState.email || 'user@example.com',
      contact: userState.phone || userState.contact || '0000000000',
      name: userState.name || userState.fullName || 'User'
    };
  };

  // Custom Alert Helper Functions
  const getAlertColor = useCallback((type) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      case 'info': return '#2196F3';
      default: return '#2196F3';
    }
  }, []);

  const getAlertIcon = useCallback((type) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'information-circle';
    }
  }, []);

  const showCustomAlert = useCallback((title, message, type = 'info', buttons = [], showSpinner = false) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      type,
      buttons: buttons.length > 0 ? buttons : [{ text: 'OK', onPress: hideCustomAlert }],
      showSpinner
    });
  }, []);

  const hideCustomAlert = useCallback(() => {
    setCustomAlert(prev => ({ ...prev, visible: false }));
  }, []);

  // Fetch course details when component mounts
  useEffect(() => {
    console.log('🔄 InternshipLetterScreen: useEffect triggered for fetchCourseDetails');
    console.log('🔄 InternshipLetterScreen: courseId:', courseId, 'token:', !!token);
    console.log('🔄 InternshipLetterScreen: Navigation params:', route.params);
    
    if (courseId && token) {
      console.log('✅ InternshipLetterScreen: Conditions met, calling fetchCourseDetails');
      fetchCourseDetails();
      
      // Check internship status to get current enrollment and upload status
      checkInternshipStatus();
      
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
      
      console.log('📚 InternshipLetterScreen: Calling courseAPI.getCourseCertificateDesc with courseId:', courseId, 'token:', !!token);
      const result = await courseAPI.getCourseCertificateDesc(token, courseId);
      console.log('📚 InternshipLetterScreen: API response received:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data.success) {
        console.log('✅ InternshipLetterScreen: API call successful');
        const courseDetails = result.data.data;
        console.log('📚 InternshipLetterScreen: Course details received:', JSON.stringify(courseDetails, null, 2));
        
        if (courseDetails) {
          console.log('✅ InternshipLetterScreen: Setting courseData:', JSON.stringify(courseDetails, null, 2));
          
          // Format the course data with proper price formatting
          const courseWithPrice = {
            courseName: courseDetails.courseName,
            description: courseDetails.certificateDescription,
            price: courseDetails.price ? `₹${courseDetails.price}.00` : '₹99.00',
            uploadStatus: courseDetails.uploadStatus
          };
          
          console.log('💰 InternshipLetterScreen: Course price formatted:', courseWithPrice.price);
          console.log('📝 InternshipLetterScreen: Course name:', courseWithPrice.courseName);
          setCourseData(courseWithPrice);
        } else {
          console.log('❌ InternshipLetterScreen: Course details not found in API response');
        }
      } else {
        console.log('❌ InternshipLetterScreen: API call failed:', result.data?.message || result.message);
      }
    } catch (error) {
      // Suppress console errors to prevent red error warnings
      console.log('💥 InternshipLetterScreen: Error in fetchCourseDetails:', error);
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
      // Suppress console errors to prevent red error warnings
      console.log('💥 InternshipLetterScreen: Error during refresh:', error);
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
      // Also check internship status on refresh
      await checkInternshipStatus();
      setTimeout(() => setIsPageRefreshing(false), 1000);
    } catch (error) {
      // Suppress console errors to prevent red error warnings
      console.log('💥 InternshipLetterScreen: Error during page refresh:', error);
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
      
      const response = await fetch(checkStatusUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      
      const result = await response.json();
      console.log('InternshipLetterScreen xxx', JSON.stringify(result));
      
      if (response.ok && result.success) {
        console.log('✅ InternshipLetterScreen: Check status API call successful');
        console.log('🔍 InternshipLetterScreen: isEnrolled flag:', result.data?.isEnrolled);
        
        if (result.data?.isEnrolled === true) {
          console.log('✅ InternshipLetterScreen: User is already enrolled, setting requestData');
          // Set requestData with the API response to show proper UI state
          setRequestData({
            internshipLetter: {
              paymentStatus: true, // User is enrolled, so payment is successful
              uploadStatus: result.data?.uploadStatus || 'upload',
              _id: 'enrolled-id',
              downloadUrl: result.data?.internshipLetter, // Store the download URL
              internshipLetter: result.data?.internshipLetter // Also store as internshipLetter for compatibility
            }
          });
          return { isEnrolled: true };
        } else {
          console.log('❌ InternshipLetterScreen: User is not enrolled, proceeding with Razorpay payment');
          return { isEnrolled: false };
        }
      } else {
        console.log('❌ InternshipLetterScreen: Check status API call failed - response.ok:', response.ok, 'result.success:', result.success);
        console.log('❌ InternshipLetterScreen: Error message:', result.message);
        showCustomAlert(
          'Status Check Failed',
          result.message || 'Failed to check internship status. Please try again.',
          'error',
          [{ text: 'OK', onPress: hideCustomAlert }]
        );
        return { isEnrolled: false, error: true };
      }
    } catch (error) {
      // Suppress console errors to prevent red error warnings
      console.log('💥 InternshipLetterScreen: Error in checkInternshipStatus:', error);
      showCustomAlert(
        'Network Error',
        'Unable to check internship status. Please check your internet connection and try again.',
        'error',
        [{ text: 'OK', onPress: hideCustomAlert }]
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
        
        // Debug: Check the amount in API response
        if (result.data.internshipLetter) {
          console.log('💰 InternshipLetterScreen: API Response Amount Check:');
          console.log('💰 Amount from API:', result.data.internshipLetter.amount);
          console.log('💰 Amount type:', typeof result.data.internshipLetter.amount);
          console.log('💰 All internshipLetter fields:', Object.keys(result.data.internshipLetter));
        }
        
        setRequestData(result.data);
        
        console.log('🎯 InternshipLetterScreen: Calling openRazorpayPayment with result.data');
        console.log('🔍 InternshipLetterScreen: Passing data to openRazorpayPayment:', JSON.stringify(result.data, null, 2));
        // After successful request, open Razorpay payment
        openRazorpayPayment(result.data);
      } else {
        console.log('❌ InternshipLetterScreen: API call failed - response.ok:', response.ok, 'result.success:', result.success);
        showCustomAlert(
          'Request Failed',
          result.message || 'Unable to process your request. Please try again.',
          'error',
          [
            { text: 'Retry', onPress: () => { hideCustomAlert(); requestInternshipLetter(); } },
            { text: 'Cancel', onPress: hideCustomAlert }
          ]
        );
      }
    } catch (error) {
      // Suppress console errors to prevent red error warnings
      console.log('💥 InternshipLetterScreen: Error in requestInternshipLetter:', error);
      console.log('💥 InternshipLetterScreen: Error message:', error.message);
      
      // Handle specific Razorpay errors with custom alerts
      if (error.message === 'PAYMENT_CANCELLED') {
        console.log('🚫 InternshipLetterScreen: Payment was cancelled by user');
        showCustomAlert(
          'Payment Cancelled',
          'You cancelled the payment. No charges have been made. You can try again anytime.',
          'warning',
          [
            { text: 'Try Again', onPress: () => { hideCustomAlert(); requestInternshipLetter(); } },
            { text: 'Cancel', onPress: hideCustomAlert }
          ]
        );
      } else if (error.message === 'PAYMENT_FAILED') {
        console.log('💥 InternshipLetterScreen: Payment failed');
        showCustomAlert(
          'Payment Failed',
          'Payment was not successful. Please check your payment method and try again.',
          'error',
          [
            { text: 'Retry', onPress: () => { hideCustomAlert(); requestInternshipLetter(); } },
            { text: 'Cancel', onPress: hideCustomAlert }
          ]
        );
      } else if (error.message && error.message.includes('Invalid course price')) {
        console.log('⚙️ InternshipLetterScreen: Invalid course price');
        showCustomAlert(
          'Configuration Error',
          'Course price configuration error. Please contact support.',
          'error',
          [{ text: 'OK', onPress: hideCustomAlert }]
        );
      } else if (error.message && error.message.includes('Razorpay payment failed')) {
        console.log('💳 InternshipLetterScreen: Razorpay payment error');
        showCustomAlert(
          'Payment Error',
          error.message,
          'error',
          [{ text: 'OK', onPress: hideCustomAlert }]
        );
      } else {
        console.log('💥 InternshipLetterScreen: Generic error');
        showCustomAlert(
          'Something went wrong',
          'An unexpected error occurred. Please try again.',
          'error',
          [
            { text: 'Retry', onPress: () => { hideCustomAlert(); requestInternshipLetter(); } },
            { text: 'Cancel', onPress: hideCustomAlert }
          ]
        );
      }
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
        
        // Calculate price from course data (same logic as EnrollScreen)
        const coursePrice = courseData?.price || '₹99.00';
        
        if (!coursePrice || typeof coursePrice !== 'string') {
          console.log('❌ InternshipLetterScreen: Invalid course price:', coursePrice);
          showCustomAlert(
            'Invalid Course Price',
            'Course price information is not available. Please refresh and try again.',
            'error',
            [{ text: 'OK', onPress: hideCustomAlert }]
          );
          return;
        }
        
        const priceString = coursePrice.replace('₹', '').replace('.00', '');
        const priceInRupees = parseFloat(priceString);
        
        if (isNaN(priceInRupees) || priceInRupees <= 0) {
          console.log('❌ InternshipLetterScreen: Invalid price calculation:', { priceString, priceInRupees });
          showCustomAlert(
            'Invalid Course Price',
            'Course price configuration error. Please contact support.',
            'error',
            [{ text: 'OK', onPress: hideCustomAlert }]
          );
          return;
        }
        
        const priceInPaise = Math.round(priceInRupees * 100);
        
        console.log('💰 InternshipLetterScreen: Price calculation:', {
          coursePrice: coursePrice,
          priceString: priceString,
          priceInRupees: priceInRupees,
          priceInPaise: priceInPaise
        });
        
        // Use the API amount if available, otherwise use calculated amount
        const apiAmount = requestData.internshipLetter.amount;
        const finalAmount = apiAmount && apiAmount > 0 ? apiAmount : priceInPaise;
        
        console.log('💰 InternshipLetterScreen: Amount comparison:', {
          apiAmount: apiAmount,
          calculatedAmount: priceInPaise,
          finalAmount: finalAmount
        });
        
        // Use the EXACT SAME logic as EnrollScreen.js
        // The API should return the same structure as courseAPI.createCourseOrder
        const orderData = {
          key: RAZORPAY_KEY_ID, // Use the live Razorpay key from env config
          amount: finalAmount, // Use API amount if available, otherwise calculated amount
          currency: requestData.internshipLetter.paymentCurrency || 'INR',
          orderId: requestData.internshipLetter.razorpayOrderId,
        };
        
        console.log('🔑 InternshipLetterScreen: Using Razorpay key from env config:', RAZORPAY_KEY_ID);
        console.log('🔍 InternshipLetterScreen: Order Data prepared (same as EnrollScreen):', JSON.stringify(orderData, null, 2));
        
        // Validate order data (key will come from frontend config)
        if (!orderData.amount || !orderData.orderId) {
          console.log('❌ InternshipLetterScreen: Invalid order data received:', orderData);
          showCustomAlert(
            'Invalid Payment Data',
            'Payment information is incomplete. Please try again.',
            'error',
            [
              { text: 'Retry', onPress: () => { hideCustomAlert(); requestInternshipLetter(); } },
              { text: 'Cancel', onPress: hideCustomAlert }
            ]
          );
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
        showCustomAlert(
          'Payment Order Error',
          'Payment order not found. Please try again.',
          'error',
          [
            { text: 'Retry', onPress: () => { hideCustomAlert(); requestInternshipLetter(); } },
            { text: 'Cancel', onPress: hideCustomAlert }
          ]
        );
      }
    } catch (error) {
      // Suppress console errors to prevent red error warnings
      console.log('💥 InternshipLetterScreen: Error in openRazorpayPayment:', error);
      showCustomAlert(
        'Payment Interface Error',
        'Unable to open payment gateway. Please check your internet connection and try again.',
        'error',
        [
          { text: 'Retry', onPress: () => { hideCustomAlert(); requestInternshipLetter(); } },
          { text: 'Cancel', onPress: hideCustomAlert }
        ]
      );
    }
  };

  // Function to handle payment with Razorpay - EXACT SAME AS ENROLLSCREEN
  const handlePaymentWithRazorpay = async (orderData) => {
    try {
      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
        console.log('❌ InternshipLetterScreen: Razorpay not available');
        showCustomAlert(
          'Payment Gateway Unavailable',
          'Payment service is temporarily unavailable. Please try again later.',
          'error',
          [{ text: 'OK', onPress: hideCustomAlert }]
        );
        return null;
      }
      console.log('💳 InternshipLetterScreen: Opening Razorpay payment interface...');
      console.log('🔑 InternshipLetterScreen: Using Razorpay key from frontend config:', RAZORPAY_KEY_ID ? RAZORPAY_KEY_ID.substring(0, 20) + '...' : 'Not found');
      
      // Validate Razorpay key is available
      if (!RAZORPAY_KEY_ID) {
        console.log('❌ InternshipLetterScreen: Razorpay key not found in frontend config');
        showCustomAlert(
          'Configuration Error',
          'Payment configuration is missing. Please contact support.',
          'error',
          [{ text: 'OK', onPress: hideCustomAlert }]
        );
        return null;
      }
      
      const userProfile = getUserProfileData();
      console.log('👤 InternshipLetterScreen: User profile data:', JSON.stringify(userProfile, null, 2));
      
      // Calculate price from course data (same logic as EnrollScreen)
      const coursePrice = courseData?.price || '₹99.00';
      
      if (!coursePrice || typeof coursePrice !== 'string') {
        console.log('❌ InternshipLetterScreen: Invalid course price:', coursePrice);
        throw new Error('Invalid course price. Please refresh and try again.');
      }
      
      const priceString = coursePrice.replace('₹', '').replace('.00', '');
      const priceInRupees = parseFloat(priceString);
      
      if (isNaN(priceInRupees) || priceInRupees <= 0) {
        console.log('❌ InternshipLetterScreen: Invalid price calculation:', { priceString, priceInRupees });
        throw new Error('Invalid course price. Please contact support.');
      }
      
      const priceInPaise = Math.round(priceInRupees * 100);
      
      console.log('💰 InternshipLetterScreen: Price calculation in handlePaymentWithRazorpay:', {
        coursePrice: coursePrice,
        priceString: priceString,
        priceInRupees: priceInRupees,
        priceInPaise: priceInPaise
      });
      
      // Use the orderData amount (which comes from API or calculated)
      const finalAmount = orderData.amount;
      
      const razorpayOptions = {
        key: orderData.key,
        amount: finalAmount, // Use calculated amount
        currency: orderData.currency,
        name: 'Learning Saint',
        description: `Internship Letter Payment - ${courseData?.courseName || 'Course'}`,
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
      console.log('🔍 InternshipLetterScreen: About to call RazorpayCheckout.open with options:', JSON.stringify(razorpayOptions, null, 2));
      
      const paymentData = await RazorpayCheckout.open(razorpayOptions);
      console.log('✅ InternshipLetterScreen: Payment successful:', JSON.stringify(paymentData, null, 2));
      return paymentData;
    } catch (razorpayError) {
      // Suppress console errors to prevent red error warnings
      console.log('❌ InternshipLetterScreen: Razorpay error caught:', razorpayError);
      
      // More specific error handling - suppress console errors for user experience
      if (razorpayError.message === 'PAYMENT_CANCELLED') {
        console.log('🚫 InternshipLetterScreen: Payment was cancelled by user');
        throw new Error('PAYMENT_CANCELLED');
      } else if (razorpayError.message === 'PAYMENT_FAILED') {
        console.log('💥 InternshipLetterScreen: Payment failed');
        throw new Error('PAYMENT_FAILED');
      } else if (razorpayError.message && razorpayError.message.includes('Invalid course price')) {
        console.log('⚙️ InternshipLetterScreen: Invalid course price');
        throw new Error('Invalid course price. Please contact support.');
      } else {
        // Suppress detailed error messages from user
        console.log('💥 InternshipLetterScreen: Generic Razorpay error:', razorpayError);
        throw new Error('PAYMENT_FAILED');
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
        showCustomAlert(
          'Missing Information',
          'Required information is missing. Please try again.',
          'error',
          [
            { text: 'Retry', onPress: () => { hideCustomAlert(); requestInternshipLetter(); } },
            { text: 'Cancel', onPress: hideCustomAlert }
          ]
        );
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
          
          showCustomAlert(
            'Success! 🎉',
            'Payment successful! Your internship letter is being processed and will be available for download shortly.',
            'success',
            [{ 
              text: 'Great!',
              onPress: () => {
                hideCustomAlert();
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
          showCustomAlert(
            'Payment Verification Failed',
            'Unable to verify your payment. Please contact support.',
            'error',
            [{ text: 'OK', onPress: hideCustomAlert }]
          );
        }
      } else {
        console.log('❌ InternshipLetterScreen: Payment verification failed - response not ok');
        const errorText = await verificationResponse.text();
        console.log('❌ InternshipLetterScreen: Error response:', errorText);
        showCustomAlert(
          'Payment Verification Failed',
          'Unable to verify your payment. Please contact support.',
          'error',
          [{ text: 'OK', onPress: hideCustomAlert }]
        );
      }
    } catch (error) {
      // Suppress console errors to prevent red error warnings
      console.log('💥 InternshipLetterScreen: Error in handleSuccessfulPayment:', error);
      showCustomAlert(
        'Payment Verification Error',
        'Unable to verify your payment. Please contact support.',
        'error',
        [{ text: 'OK', onPress: hideCustomAlert }]
      );
    }
  };

  const handleBackPress = () => {
    console.log('⬅️ InternshipLetterScreen: handleBackPress called');
    navigation.goBack();
  };




  // Function to handle downloading the internship letter to local storage
  const handleDownloadLetter = async () => {
    try {
      console.log('📥 InternshipLetterScreen: handleDownloadLetter called');
      console.log('📥 InternshipLetterScreen: requestData:', JSON.stringify(requestData, null, 2));
      
      // Get download URL from the API response structure
      const downloadUrl = requestData?.internshipLetter?.downloadUrl || requestData?.internshipLetter?.internshipLetter;
      
      if (!downloadUrl) {
        console.log('❌ InternshipLetterScreen: No download URL found');
        showCustomAlert(
          'Download Error',
          'Download link is not available. Please try again later.',
          'error',
          [{ text: 'OK', onPress: hideCustomAlert }]
        );
        return;
      }
      
      console.log('🌐 InternshipLetterScreen: Download URL:', downloadUrl);
      
      // Show loading alert
      showCustomAlert(
        'Downloading... 📥',
        'Please wait while we download your internship letter.',
        'info',
        [],
        true
      );
      
      const fileName = `internship_letter_${courseId}.pdf`;
      
      // Use RNFS.downloadFile for direct download - this is more reliable
      console.log('🔄 InternshipLetterScreen: Using RNFS.downloadFile for direct download...');
      
      try {
        // Use app's documents directory which has proper permissions
        const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        console.log('📁 InternshipLetterScreen: Downloading to:', filePath);
        
        const downloadResult = await RNFS.downloadFile({
          fromUrl: downloadUrl,
          toFile: filePath,
          headers: {
            'Content-Type': 'application/pdf',
          },
          progress: (res) => {
            const progress = (res.bytesWritten / res.contentLength) * 100;
            console.log('📊 Download progress:', progress.toFixed(2) + '%');
          }
        }).promise;
        
        console.log('✅ InternshipLetterScreen: Download completed:', downloadResult);
        
        if (downloadResult.statusCode === 200) {
          const fileExists = await RNFS.exists(filePath);
          
          if (fileExists) {
            const fileStats = await RNFS.stat(filePath);
            console.log('📊 InternshipLetterScreen: File stats:', fileStats);
            
            hideCustomAlert();
            showCustomAlert(
              'Download Complete! 🎉',
              `Your internship letter has been downloaded successfully!\n\nFile: ${fileName}\nSize: ${(fileStats.size / 1024).toFixed(2)} KB\n\nYou can find it in your app's documents folder.`,
              'success',
              [{ text: 'Great!', onPress: hideCustomAlert }]
            );
          } else {
            console.log('❌ InternshipLetterScreen: File was not created successfully');
            hideCustomAlert();
            showCustomAlert(
              'Save Error',
              'Failed to save the file. Please try again.',
              'error',
              [{ text: 'OK', onPress: hideCustomAlert }]
            );
          }
        } else {
          console.log('❌ InternshipLetterScreen: Download failed with status:', downloadResult.statusCode);
          hideCustomAlert();
          showCustomAlert(
            'Download Failed',
            'Failed to download the internship letter. Please try again.',
            'error',
            [
              { text: 'Retry', onPress: () => { hideCustomAlert(); handleDownloadLetter(); } },
              { text: 'Cancel', onPress: hideCustomAlert }
            ]
          );
        }
        
        } catch (downloadError) {
          // Suppress console errors to prevent red error warnings
          console.log('💥 InternshipLetterScreen: Download error:', downloadError);
        
        // Fallback: Try to open the URL in browser
        console.log('🔄 InternshipLetterScreen: Trying fallback - opening URL in browser...');
        try {
          const supported = await Linking.canOpenURL(downloadUrl);
          if (supported) {
            await Linking.openURL(downloadUrl);
            hideCustomAlert();
            showCustomAlert(
              'Opening in Browser',
              'The internship letter will open in your browser. You can download it from there.',
              'info',
              [{ text: 'OK', onPress: hideCustomAlert }]
            );
          } else {
            hideCustomAlert();
            showCustomAlert(
              'Download Unavailable',
              'Unable to download the file. Please try again later.',
              'error',
              [{ text: 'OK', onPress: hideCustomAlert }]
            );
          }
        } catch (linkingError) {
          // Suppress console errors to prevent red error warnings
          console.log('💥 InternshipLetterScreen: Linking error:', linkingError);
          hideCustomAlert();
          showCustomAlert(
            'Download Error',
            'Unable to download the file. Please try again later.',
            'error',
            [{ text: 'OK', onPress: hideCustomAlert }]
          );
        }
      }
      
    } catch (error) {
      // Suppress console errors to prevent red error warnings
      console.log('💥 InternshipLetterScreen: Error in handleDownloadLetter:', error);
      hideCustomAlert();
      showCustomAlert(
        'Network Error',
        'Network error occurred while downloading internship letter. Please try again.',
        'error',
        [
          { text: 'Retry', onPress: () => { hideCustomAlert(); handleDownloadLetter(); } },
          { text: 'Cancel', onPress: hideCustomAlert }
        ]
      );
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
        <BackButton onPress={handleBackPress} />
        <Text style={styles.headerTitle}>Internship Letter</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        
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
              <Image 
                source={require('../assests/images/conge.png')} 
                style={styles.congratulationsImage}
                resizeMode="contain"
              />
              <Text style={styles.congratulationsSubtext}>Download Internship Letter</Text>
              
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
                {courseData.description || courseData.courseDescription || 'Complete this course to get your internship letter.'}
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
        {/* Status Message - Show when isEnrolled=true and uploadStatus=upload */}
        {(() => {
          const shouldShowMessage = requestData?.internshipLetter?.paymentStatus && requestData?.internshipLetter?.uploadStatus === 'upload';
          console.log('🔍 InternshipLetterScreen: Status message logic - shouldShowMessage:', shouldShowMessage);
          console.log('🔍 InternshipLetterScreen: paymentStatus:', requestData?.internshipLetter?.paymentStatus);
          console.log('🔍 InternshipLetterScreen: uploadStatus:', requestData?.internshipLetter?.uploadStatus);
          
          return shouldShowMessage ? (
            <View style={styles.statusMessageContainer}>
              <Text style={styles.statusMessageText}>
                Internship Letter Underprocess you will be notified for download
              </Text>
            </View>
          ) : null;
        })()}
        
        {(() => {
          const uploadStatus = requestData?.internshipLetter?.uploadStatus;
          const paymentStatus = requestData?.internshipLetter?.paymentStatus;
          
          console.log('🔍 InternshipLetterScreen: Button logic - uploadStatus:', uploadStatus, 'paymentStatus:', paymentStatus);
          console.log('🔍 InternshipLetterScreen: requestData:', JSON.stringify(requestData, null, 2));
          
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
                    Download
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
                  colors={['#CCCCCC', '#999999']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.downloadButtonText, styles.downloadButtonTextDisabled]}>
                    Download
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
                  {isRequesting ? 'Processing...' : `Get Internship Letter  - ${courseData?.price || '₹0.00'}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })()}
      </View>

      {/* Custom Alert Modal */}
      <Modal
        visible={customAlert.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideCustomAlert}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={hideCustomAlert}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
            
            {/* Alert Icon */}
            <View style={[styles.alertIcon, { backgroundColor: getAlertColor(customAlert.type) }]}>
              <Icon 
                name={getAlertIcon(customAlert.type)} 
                size={32} 
                color="#fff" 
              />
            </View>
            
            {/* Alert Title */}
            <Text style={styles.alertTitle}>{customAlert.title}</Text>
            
            {/* Alert Message */}
            <Text style={styles.alertMessage}>{customAlert.message}</Text>
            
            {/* Loading Spinner */}
            {customAlert.showSpinner && (
              <ActivityIndicator 
                size="large" 
                color={getAlertColor(customAlert.type)} 
                style={styles.alertSpinner}
              />
            )}
            
            {/* Alert Buttons */}
            <View style={styles.alertButtons}>
              {customAlert.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.alertButton,
                    index === 0 ? styles.alertButtonPrimary : styles.alertButtonSecondary
                  ]}
                  onPress={button.onPress}
                >
                  <Text style={[
                    styles.alertButtonText,
                    index === 0 ? styles.alertButtonTextPrimary : styles.alertButtonTextSecondary
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: getResponsiveSize(20),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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

 
  scrollContent: {
    flexGrow: 1,
    // paddingBottom: getResponsiveSize(20),
  },
  congratulationsContainer: {
    alignItems: 'center',
    // paddingTop: getResponsiveSize(40),
    // paddingBottom: getResponsiveSize(10), // Reduced from 30 to 10
  },
  congratulationsImage: {
    width: getResponsiveSize(200),
    height: getResponsiveSize(80),
    marginBottom: getResponsiveSize(10),
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

  mainLoadingContainer: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(100),
  },
  mainLoadingText: {
    fontSize: getResponsiveSize(18),
    color: '#666',
    marginTop: getResponsiveSize(15),
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
    paddingHorizontal: getResponsiveSize(20),
    marginTop: getResponsiveSize(-20),
    // marginVertical: getResponsiveSize(10), // Added small margin to control gap
  },
  certificateImage: {
    width: width - getResponsiveSize(40),
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

  downloadButtonDisabled: {
    opacity: 0.7,
  },
  downloadButtonTextDisabled: {
    color: '#666666',
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
  
  // Custom Alert Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(20),
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: getResponsiveSize(16),
    padding: getResponsiveSize(24),
    width: '100%',
    maxWidth: getResponsiveSize(400),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: getResponsiveSize(12),
    right: getResponsiveSize(12),
    width: getResponsiveSize(32),
    height: getResponsiveSize(32),
    borderRadius: getResponsiveSize(16),
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIcon: {
    width: getResponsiveSize(64),
    height: getResponsiveSize(64),
    borderRadius: getResponsiveSize(32),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsiveSize(16),
  },
  alertTitle: {
    fontSize: getResponsiveSize(20),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: getResponsiveSize(8),
  },
  alertMessage: {
    fontSize: getResponsiveSize(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: getResponsiveSize(24),
    marginBottom: getResponsiveSize(20),
  },
  alertSpinner: {
    marginBottom: getResponsiveSize(16),
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: getResponsiveSize(12),
  },
  alertButton: {
    flex: 1,
    paddingVertical: getResponsiveSize(12),
    paddingHorizontal: getResponsiveSize(20),
    borderRadius: getResponsiveSize(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonPrimary: {
    backgroundColor: '#FF8800',
  },
  alertButtonSecondary: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  alertButtonText: {
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
  },
  alertButtonTextPrimary: {
    color: '#fff',
  },
  alertButtonTextSecondary: {
    color: '#666',
  },
});