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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../Redux/hooks';
import { getApiUrl } from '../API/config';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const InternshipLetterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAppSelector((state) => state.user);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestData, setRequestData] = useState(null);

  // Get courseId from route params (coming from SubCourseScreen)
  const courseId = route.params?.courseId;

  // Fetch internship letter request data when component mounts
  useEffect(() => {
    if (courseId && token) {
      requestInternshipLetter();
    }
  }, [courseId, token]);

  // Function to request internship letter from API
  const requestInternshipLetter = async () => {
    try {
      setIsRequesting(true);
      console.log('📜 InternshipLetterScreen: Requesting internship letter for courseId:', courseId);
      
      const apiUrl = getApiUrl('/api/user/internshipLetter/request-InternshipLetter');
      console.log('🌐 InternshipLetterScreen: API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: courseId
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ InternshipLetterScreen: Internship letter request successful:', result);
        
        if (result.success && result.data) {
          setRequestData(result.data);
          // After successful request, open Razorpay payment
          openRazorpayPayment(result.data);
        }
      } else {
        const errorResult = await response.json();
        console.log('❌ InternshipLetterScreen: Failed to request internship letter:', response.status);
        console.log('❌ InternshipLetterScreen: Error message:', errorResult.message);
        
        // Show error message to user
        Alert.alert(
          'Request Failed',
          errorResult.message || 'Failed to request internship letter',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('💥 InternshipLetterScreen: Error requesting internship letter:', error);
      Alert.alert(
        'Error',
        'Network error occurred while requesting internship letter',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRequesting(false);
    }
  };

  // Function to open Razorpay payment interface
  const openRazorpayPayment = async (requestData) => {
    try {
      console.log('💳 InternshipLetterScreen: Opening Razorpay payment interface...');
      
      // Create order for internship letter payment
      const orderUrl = getApiUrl('/api/user/internshipLetter/create-order');
      console.log('🌐 InternshipLetterScreen: Order API URL:', orderUrl);
      
      const orderResponse = await fetch(orderUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: courseId,
          amount: 9900, // ₹99.00 in paise
          currency: 'INR'
        }),
      });
      
      if (orderResponse.ok) {
        const orderResult = await orderResponse.json();
        console.log('✅ InternshipLetterScreen: Order created successfully:', orderResult);
        
        if (orderResult.success && orderResult.data) {
          const orderData = orderResult.data;
          
          // Open Razorpay payment interface
          const paymentData = await handlePaymentWithRazorpay(orderData);
          
          if (paymentData) {
            console.log('🎉 InternshipLetterScreen: Payment successful:', paymentData);
            // Handle successful payment
            handleSuccessfulPayment(paymentData, orderData.orderId);
          }
        }
      } else {
        const errorResult = await orderResponse.json();
        console.log('❌ InternshipLetterScreen: Failed to create order:', errorResult.message);
        Alert.alert('Error', 'Failed to create payment order. Please try again.');
      }
    } catch (error) {
      console.error('💥 InternshipLetterScreen: Error opening Razorpay payment:', error);
      Alert.alert('Error', 'Failed to open payment interface. Please try again.');
    }
  };

  // Function to handle payment with Razorpay
  const handlePaymentWithRazorpay = async (orderData) => {
    try {
      console.log('💳 InternshipLetterScreen: Processing Razorpay payment...');
      
      // Use the existing Razorpay implementation from HomeScreen
      // This will open the Razorpay payment interface
      const paymentData = await new Promise((resolve, reject) => {
        // Store the options and callbacks globally so WebView can access them
        global.razorpayOptions = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Learning Saint',
          description: 'Internship Letter Payment',
          order_id: orderData.orderId,
          prefill: {
            email: 'student@learningsaint.com',
            contact: '9876543210',
            name: 'Student Name'
          },
          theme: {
            color: '#FF6B35'
          },
          modal: {
            ondismiss: () => {
              console.log('🔒 InternshipLetterScreen: Razorpay modal dismissed');
              reject(new Error('PAYMENT_CANCELLED'));
            }
          }
        };
        
        global.razorpayResolve = resolve;
        global.razorpayReject = reject;
        
        // Navigate to Razorpay payment screen
        navigation.navigate('RazorpayPayment', { options: global.razorpayOptions });
      });
      
      return paymentData;
    } catch (error) {
      console.log('❌ InternshipLetterScreen: Razorpay error:', error);
      if (error.message === 'PAYMENT_CANCELLED') {
        Alert.alert('Payment Cancelled', 'You cancelled the payment. You can try again anytime.');
      } else {
        Alert.alert('Payment Failed', 'Payment was not successful. Please try again.');
      }
      return null;
    }
  };

  // Function to handle successful payment
  const handleSuccessfulPayment = async (paymentData, orderId) => {
    try {
      console.log('🎉 InternshipLetterScreen: Handling successful payment...');
      
      // Verify payment with backend
      const verificationUrl = getApiUrl('/api/user/internshipLetter/verify-payment');
      console.log('🌐 InternshipLetterScreen: Verification API URL:', verificationUrl);
      
      const verificationResponse = await fetch(verificationUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          paymentId: paymentData.razorpay_payment_id || paymentData.razorpayPaymentId,
          signature: paymentData.razorpay_signature || paymentData.razorpaySignature,
          courseId: courseId
        }),
      });
      
      if (verificationResponse.ok) {
        const verificationResult = await verificationResponse.json();
        console.log('✅ InternshipLetterScreen: Payment verified successfully:', verificationResult);
        
        if (verificationResult.success) {
          Alert.alert(
            'Success! 🎉',
            'Payment successful! Your internship letter will be available shortly.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Error', 'Payment verification failed. Please contact support.');
        }
      } else {
        console.log('❌ InternshipLetterScreen: Payment verification failed');
        Alert.alert('Error', 'Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('💥 InternshipLetterScreen: Error verifying payment:', error);
      Alert.alert('Error', 'Failed to verify payment. Please contact support.');
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDownload = () => {
    console.log('Download button pressed');
    // Add your download logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Icon name="chevron-back" size={getResponsiveSize(24)} color="#FF8800" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Internship Letter</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Congratulations Section */}
        <View style={styles.congratulationsContainer}>
          <Text style={styles.congratulationsText}>Congratulations</Text>
          <Text style={styles.congratulationsSubtext}>For Completing Course</Text>
          
          {/* Dynamic Course Name - can be added later if needed */}
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
      </ScrollView>

      {/* Download Button */}
      <View style={styles.downloadButtonContainer}>
        <TouchableOpacity 
          style={[styles.downloadButton, isRequesting && styles.downloadButtonDisabled]}
          onPress={requestInternshipLetter}
          disabled={isRequesting}
        >
          <LinearGradient
            colors={['#FF8A00', '#FFB300']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
                      <Text style={styles.downloadButtonText}>
            {isRequesting ? 'Processing...' : 'Get Internship Letter for ₹99/-'}
          </Text>
          </LinearGradient>
        </TouchableOpacity>
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
  downloadButtonDisabled: {
    opacity: 0.7,
  },
});