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
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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


const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const InternshipLetterScreen = () => {
  const insets = useSafeAreaInsets();
  
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


  
  // Custom Alert State
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // info, success, error, warning
    buttons: [],
    showSpinner: false
  });
  
  
  // Direct Razorpay integration - no custom class needed

  // Get courseId from route params
  const courseId = route.params?.courseId;

  // Get user data from Redux store at component level
  const userState = useAppSelector((state) => state.user);
  
  // Function to get user profile data (no hooks inside)
  const getUserProfileData = () => {
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
    if (courseId && token) {
      fetchCourseDetails();
      
      // Check internship status to get current enrollment and upload status
      checkInternshipStatus();
      
      // Check if we have uploadStatus from navigation params
      if (route.params?.uploadStatus) {
        // Create a mock requestData structure with the uploadStatus
        const mockData = {
          internshipLetter: {
            uploadStatus: route.params.uploadStatus,
            paymentStatus: true,
            _id: 'temp-id'
          }
        };
        setRequestData(mockData);
      }
    }
  }, [courseId, token, route.params]);

  // Separate useEffect to handle navigation params changes
  useEffect(() => {
    if (route.params?.uploadStatus) {
      const mockData = {
        internshipLetter: {
          uploadStatus: route.params.uploadStatus,
          paymentStatus: true,
          _id: 'temp-id'
        }
      };
      setRequestData(mockData);
    }
  }, [route.params?.uploadStatus]);

  // Monitor courseData changes
  useEffect(() => {
    if (courseData) {
    }
  }, [courseData]);

  // Test price formatting logic
  useEffect(() => {
    const testPrice = 88;
    const formattedPrice = testPrice ? `₹${testPrice}.00` : '₹99.00';
  }, []);

  // Function to fetch course details
  const fetchCourseDetails = async () => {
    try {
      setIsLoadingCourse(true);
      
      const result = await courseAPI.getCourseCertificateDesc(token, courseId);
      
      if (result.success && result.data.success) {
        const courseDetails = result.data.data;
        
        if (courseDetails) {
          // Format the course data with proper price formatting
          const courseWithPrice = {
            courseName: courseDetails.courseName,
            description: courseDetails.certificateDescription,
            price: courseDetails.price ? `₹${courseDetails.price}.00` : '₹99.00',
            uploadStatus: courseDetails.uploadStatus
          };
          
          setCourseData(courseWithPrice);
        }
      } else {
        showCustomAlert(
          'Failed to Load Course Details',
          result.data?.message || 'Unable to load course information. Please try again.',
          'error',
          [
            { text: 'Retry', onPress: () => { hideCustomAlert(); fetchCourseDetails(); } },
            { text: 'Cancel', onPress: hideCustomAlert }
          ]
        );
      }
    } catch (error) {
      // Suppress console errors to prevent red error warnings
      showCustomAlert(
        'Network Error',
        'Unable to load course details. Please check your internet connection and try again.',
        'error',
        [
          { text: 'Retry', onPress: () => { hideCustomAlert(); fetchCourseDetails(); } },
          { text: 'Cancel', onPress: hideCustomAlert }
        ]
      );
    } finally {
      setIsLoadingCourse(false);
    }
  };

  // Function to handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchCourseDetails();
    } catch (error) {
      // Suppress console errors to prevent red error warnings
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to handle page refresh (full page reload)
  const handlePageRefresh = async () => {
    setIsPageRefreshing(true);
    try {
      await fetchCourseDetails();
      // Also check internship status on refresh
      await checkInternshipStatus();
      setTimeout(() => setIsPageRefreshing(false), 1000);
    } catch (error) {
      // Suppress console errors to prevent red error warnings
      setIsPageRefreshing(false);
    }
  };


  // Function to check internship status before proceeding with payment
  const checkInternshipStatus = async () => {
    try {
      // Build the check status API URL with courseId as query parameter
      const checkStatusUrl = getApiUrl(`/api/user/internshipLetter/check-internshipStatus/${courseId}`);
      
      const response = await fetch(checkStatusUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        if (result.data?.isEnrolled === true) {
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
          return { isEnrolled: false };
        }
      } else {
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
    try {
      setIsRequesting(true);
      
      // First, check internship status
      const statusCheck = await checkInternshipStatus();
      
      if (statusCheck.error) {
        return;
      }
      
      if (statusCheck.isEnrolled) {
        return;
      }
      
      // If not enrolled, proceed with Razorpay payment
      const apiUrl = getApiUrl('/api/user/internshipLetter/request-InternshipLetter');
      
      const requestBody = {
        courseId: courseId
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success && result.data) {
        setRequestData(result.data);
        
        // After successful request, open Razorpay payment
        openRazorpayPayment(result.data);
      } else {
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
      
      // Handle specific Razorpay errors with custom alerts
      if (error.message === 'PAYMENT_CANCELLED') {
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
        showCustomAlert(
          'Configuration Error',
          'Course price configuration error. Please contact support.',
          'error',
          [{ text: 'OK', onPress: hideCustomAlert }]
        );
      } else if (error.message && error.message.includes('Razorpay payment failed')) {
        showCustomAlert(
          'Payment Error',
          error.message,
          'error',
          [{ text: 'OK', onPress: hideCustomAlert }]
        );
      } else {
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
      setIsRequesting(false);
    }
  };

  // Function to open Razorpay payment interface - EXACT SAME AS ENROLLSCREEN
  const openRazorpayPayment = async (requestData) => {
    try {
      if (requestData.internshipLetter && requestData.internshipLetter.razorpayOrderId) {
        // Calculate price from course data (same logic as EnrollScreen)
        const coursePrice = courseData?.price || '₹99.00';
        
        if (!coursePrice || typeof coursePrice !== 'string') {
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
          showCustomAlert(
            'Invalid Course Price',
            'Course price configuration error. Please contact support.',
            'error',
            [{ text: 'OK', onPress: hideCustomAlert }]
          );
          return;
        }
        
        const priceInPaise = Math.round(priceInRupees * 100);
        
        // Use the API amount if available, otherwise use calculated amount
        const apiAmount = requestData.internshipLetter.amount;
        const finalAmount = apiAmount && apiAmount > 0 ? apiAmount : priceInPaise;
        
        // Use the EXACT SAME logic as EnrollScreen.js
        // The API should return the same structure as courseAPI.createCourseOrder
        const orderData = {
          key: RAZORPAY_KEY_ID, // Use the live Razorpay key from env config
          amount: finalAmount, // Use API amount if available, otherwise calculated amount
          currency: requestData.internshipLetter.paymentCurrency || 'INR',
          orderId: requestData.internshipLetter.razorpayOrderId,
        };
        
        // Validate order data (key will come from frontend config)
        if (!orderData.amount || !orderData.orderId) {
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
        const paymentData = await handlePaymentWithRazorpay(orderData);
        
        if (!paymentData) {
          return; // Payment was cancelled or failed
        }
        
        // Handle successful payment
        await handleSuccessfulPayment(paymentData, requestData.internshipLetter.razorpayOrderId, requestData);
        
      } else {
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
        showCustomAlert(
          'Payment Gateway Unavailable',
          'Payment service is temporarily unavailable. Please try again later.',
          'error',
          [{ text: 'OK', onPress: hideCustomAlert }]
        );
        return null;
      }
      
      // Validate Razorpay key is available
      if (!RAZORPAY_KEY_ID) {
        showCustomAlert(
          'Configuration Error',
          'Payment configuration is missing. Please contact support.',
          'error',
          [{ text: 'OK', onPress: hideCustomAlert }]
        );
        return null;
      }
      
      const userProfile = getUserProfileData();
      
      // Calculate price from course data (same logic as EnrollScreen)
      const coursePrice = courseData?.price || '₹99.00';
      
      if (!coursePrice || typeof coursePrice !== 'string') {
        throw new Error('Invalid course price. Please refresh and try again.');
      }
      
      const priceString = coursePrice.replace('₹', '').replace('.00', '');
      const priceInRupees = parseFloat(priceString);
      
      if (isNaN(priceInRupees) || priceInRupees <= 0) {
        throw new Error('Invalid course price. Please contact support.');
      }
      
      const priceInPaise = Math.round(priceInRupees * 100);
      
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
          }
        }
      };
      
      const paymentData = await RazorpayCheckout.open(razorpayOptions);
      return paymentData;
    } catch (razorpayError) {
      // Suppress console errors to prevent red error warnings
      
      // More specific error handling - suppress console errors for user experience
      if (razorpayError.message === 'PAYMENT_CANCELLED') {
        throw new Error('PAYMENT_CANCELLED');
      } else if (razorpayError.message === 'PAYMENT_FAILED') {
        throw new Error('PAYMENT_FAILED');
      } else if (razorpayError.message && razorpayError.message.includes('Invalid course price')) {
        throw new Error('Invalid course price. Please contact support.');
      } else {
        // Suppress detailed error messages from user
        throw new Error('PAYMENT_FAILED');
      }
    }
  };

  // Function to handle successful payment
  const handleSuccessfulPayment = async (paymentData, orderId, internshipLetterData = null) => {
    try {
      // Use passed data or fallback to requestData
      const dataToUse = internshipLetterData || requestData;
      
      // Verify payment with backend using the correct structure
      const verificationUrl = getApiUrl('/api/user/internshipLetter/verify-payment');
      
      // Validate required data
      const internshipLetterId = dataToUse?.internshipLetter?._id;
      if (!internshipLetterId) {
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
      
      const verificationResponse = await fetch(verificationUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationBody),
      });
      
      if (verificationResponse.ok) {
        const verificationResult = await verificationResponse.json();
        
        if (verificationResult.success) {
          // Update requestData with the latest information from verification response
          if (verificationResult.data) {
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
                // Extract uploadStatus from the verification response
                const uploadStatus = verificationResult.data?.uploadStatus || 'upload';
                
                navigation.navigate('Internship', { 
                  courseId: courseId,
                  uploadStatus: uploadStatus
                });
              }
            }]
          );
        } else {
          showCustomAlert(
            'Payment Verification Failed',
            'Unable to verify your payment. Please contact support.',
            'error',
            [{ text: 'OK', onPress: hideCustomAlert }]
          );
        }
      } else {
        const errorText = await verificationResponse.text();
        showCustomAlert(
          'Payment Verification Failed',
          'Unable to verify your payment. Please contact support.',
          'error',
          [{ text: 'OK', onPress: hideCustomAlert }]
        );
      }
    } catch (error) {
      // Suppress console errors to prevent red error warnings
      showCustomAlert(
        'Payment Verification Error',
        'Unable to verify your payment. Please contact support.',
        'error',
        [{ text: 'OK', onPress: hideCustomAlert }]
      );
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };




  // Function to handle downloading the internship letter to local storage
  const handleDownloadLetter = async () => {
    try {
      // Get download URL from the API response structure
      const downloadUrl = requestData?.internshipLetter?.downloadUrl || requestData?.internshipLetter?.internshipLetter;
      
      if (!downloadUrl) {
        showCustomAlert(
          'Download Error',
          'Download link is not available. Please try again later.',
          'error',
          [{ text: 'OK', onPress: hideCustomAlert }]
        );
        return;
      }
      
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
      try {
        // Use app's documents directory which has proper permissions
        const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        
        const downloadResult = await RNFS.downloadFile({
          fromUrl: downloadUrl,
          toFile: filePath,
          headers: {
            'Content-Type': 'application/pdf',
          },
          progress: (res) => {
            const progress = (res.bytesWritten / res.contentLength) * 100;
          }
        }).promise;
        
        if (downloadResult.statusCode === 200) {
          const fileExists = await RNFS.exists(filePath);
          
          if (fileExists) {
            const fileStats = await RNFS.stat(filePath);
            
            hideCustomAlert();
            showCustomAlert(
              'Download Complete! 🎉',
              `Your internship letter has been downloaded successfully!\n\nFile: ${fileName}\nSize: ${(fileStats.size / 1024).toFixed(2)} KB\n\nYou can find it in your app's documents folder.`,
              'success',
              [{ text: 'Great!', onPress: hideCustomAlert }]
            );
          } else {
            hideCustomAlert();
            showCustomAlert(
              'Save Error',
              'Failed to save the file. Please try again.',
              'error',
              [{ text: 'OK', onPress: hideCustomAlert }]
            );
          }
        } else {
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
        
        // Fallback: Try to open the URL in browser
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom + 100, 100) : insets.bottom + 100 }
        ]}
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
                source={require('../assests/images/conge.jpeg')} 
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
          
          // If payment is successful and letter is uploaded, show enabled download button
          if (paymentStatus && uploadStatus === 'uploaded') {
            return (
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={() => {
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
                  {isRequesting ? 'Processing...' : `Get Internship Letter - ${courseData?.price || '₹00.00'}`}
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
    height: getResponsiveSize(90),
    // marginBottom: getResponsiveSize(10),
  },
  congratulationsSubtext: {
    bottom:20,
    // backgroundColor:'red',
    fontSize: getResponsiveSize(16),
    color: '#333',
    fontWeight: '400',
    textAlign: 'center',
    // marginBottom: getResponsiveSize(10),
  },
  courseNameText: {
    fontSize: getResponsiveSize(20),
    color: '#FF8800',
    fontWeight: '600',
    textAlign: 'center',
    bottom:20,
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
    width: width - getResponsiveSize(20),
    height: getResponsiveSize(300),
  },
  descriptionContainer: {
  bottom:25,
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
    marginBottom: Platform.OS === 'android' ? 20 : 0, // Add extra margin for Android
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