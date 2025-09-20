import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import BackButton from '../Component/BackButton';
import { useAppSelector } from '../Redux/hooks';
import { getApiUrl } from '../API/config';
import RNFS from 'react-native-fs'; // Ensure this is imported at the top
import { Buffer } from 'buffer'; // Add Buffer polyfill for React Native
import RazorpayCheckout from 'react-native-razorpay';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const CourseCertificateDownload = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAppSelector((state) => state.user);
  const [isDownloading, setIsDownloading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [isLoadingCertificate, setIsLoadingCertificate] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Get courseId from route params (coming from EnrollScreen)
  const courseId = route.params?.courseId;

  // Function to check current permission status
  const checkCurrentPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        
        if (Platform.Version >= 33) {
          const readMediaImages = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
          const readMediaVideo = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
          return { readMediaImages, readMediaVideo };
        } else {
          const writeStorage = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
          const readStorage = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
          return { writeStorage, readStorage };
        }
      } catch (error) {
        console.error('❌ Error checking permissions:', error);
        return null;
      }
    }
    return null;
  };

  // Function to test if we can actually write to downloads directory
  const testDownloadsAccess = async () => {
    try {
      
      // Try to create a test file
      const testFileName = `test_${Date.now()}.txt`;
      const testFilePath = `${RNFS.DownloadDirectoryPath}/${testFileName}`;
      
      
      // Write a test file
      await RNFS.writeFile(testFilePath, 'test content', 'utf8');
      
      // Check if file exists
      const fileExists = await RNFS.exists(testFilePath);
      
      if (fileExists) {
        // Delete test file
        await RNFS.unlink(testFilePath);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Downloads access test failed:', error);
      return false;
    }
  };

  // Function to request storage permissions
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        let granted = false;

        if (Platform.Version >= 33) {
          // Android 13+ requires READ_MEDIA_IMAGES and READ_MEDIA_VIDEO
          
          // First check if permissions are already granted
          const hasImages = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
          const hasVideo = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
          
          
          if (hasImages && hasVideo) {
            return true;
          }
          
          // Request READ_MEDIA_IMAGES permission
          const readMediaImages = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Media Access Permission',
              message: 'App needs access to media to download certificates. Please grant this permission.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'Grant',
            }
          );
          
          
          // Request READ_MEDIA_VIDEO permission
          const readMediaVideo = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            {
              title: 'Media Access Permission',
              message: 'App needs access to media to download certificates. Please grant this permission.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'Grant',
            }
          );
          
          
          granted = (readMediaImages === PermissionsAndroid.RESULTS.GRANTED && 
                    readMediaVideo === PermissionsAndroid.RESULTS.GRANTED);
          
          
          if (!granted) {
            // Show detailed explanation for Android 13+
            Alert.alert(
              'Permission Required for Android 13+',
              'This app needs media access permissions to download certificates. Please:\n\n1. Go to Settings > Apps > LearningSaint > Permissions\n2. Enable "Photos and videos" permission\n3. Try downloading again',
              [
                { text: 'OK' },
                { 
                  text: 'Open Settings', 
                  onPress: () => {
                    Linking.openSettings();
                  }
                }
              ]
            );
          }
          
        } else if (Platform.Version >= 29) {
          // Android 10-12
          
          const writePermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to storage to download certificates',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          
          const readPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to storage to download certificates',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          
          granted = (writePermission === PermissionsAndroid.RESULTS.GRANTED && 
                    readPermission === PermissionsAndroid.RESULTS.GRANTED);
          
          
        } else {
          // Android 9 and below
          
          const writePermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to storage to download certificates',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          
          granted = writePermission === PermissionsAndroid.RESULTS.GRANTED;
        }

        if (granted) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        console.error('❌ Permission request error:', err.message);
        Alert.alert('Permission Error', 'An error occurred while requesting permissions. Please check logs and try again.');
        return false;
      }
    }
    return true; // iOS doesn't need this permission
  };

  // Fetch certificate description data when component mounts
  React.useEffect(() => {
    if (courseId && token) {
      fetchCertificateDescription();
    }
  }, [courseId, token]);

  // Function to fetch certificate description from API
  const fetchCertificateDescription = async () => {
    try {
      console.log('📥 CourseCertificateDownload: Fetching certificate description...');
      setIsLoadingCertificate(true);
      
      const apiUrl = getApiUrl(`/api/user/course/get-CoursecertificateDesc/${courseId}`);
      console.log('🌐 CourseCertificateDownload: Certificate API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('📡 CourseCertificateDownload: Certificate API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📥 CourseCertificateDownload: Certificate data received:', result);
        
        if (result.success && result.data) {
          console.log('📊 CourseCertificateDownload: Setting certificate data:', result.data);
          console.log('💰 CourseCertificateDownload: Payment status - isPaymentDone:', result.data.isPaymentDone);
          setCertificateData(result.data);
        } else {
          console.log('❌ CourseCertificateDownload: API response not successful:', result);
          Alert.alert('Error', 'Failed to fetch certificate details');
        }
      } else {
        console.log('❌ CourseCertificateDownload: API call failed with status:', response.status);
        Alert.alert('Error', 'Failed to fetch certificate details');
      }
    } catch (error) {
      console.log('💥 CourseCertificateDownload: Fetch certificate description error:', error);
      Alert.alert('Error', 'Failed to fetch certificate details');
    } finally {
      console.log('🏁 CourseCertificateDownload: Certificate fetching completed');
      setIsLoadingCertificate(false);
    }
  };

  // Function to request course certificate payment
  const requestCourseCertificatePayment = async () => {
    try {
      console.log('💳 CourseCertificateDownload: Requesting course certificate payment for courseId:', courseId);
      
      const apiUrl = getApiUrl('/api/user/certificate/request-main-course-certificate-payment');
      
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
        console.log('✅ CourseCertificateDownload: Payment request successful:', result);
        return result;
      } else {
        console.log('❌ CourseCertificateDownload: Payment request failed:', response.status);
        const errorText = await response.text();
        console.log('❌ CourseCertificateDownload: Error response:', errorText);
        return null;
      }
    } catch (error) {
      console.log('💥 CourseCertificateDownload: Payment request error:', error);
      return null;
    }
  };

  // Function to verify course certificate payment
  const verifyCourseCertificatePayment = async (paymentData) => {
    try {
      console.log('🔍 CourseCertificateDownload: Verifying course certificate payment...');
      console.log('📤 CourseCertificateDownload: Payment details being sent:', paymentData);
      
      const apiUrl = getApiUrl('/api/user/certificate/verify-certificate-payment');
      console.log('🌐 CourseCertificateDownload: Verify API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      console.log('📡 CourseCertificateDownload: Verify API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📥 CourseCertificateDownload: Verify payment response:', result);
        console.log('✅ CourseCertificateDownload: Payment verification successful');
        return result;
      } else {
        console.log('❌ CourseCertificateDownload: Payment verification failed:', response.status);
        const errorText = await response.text();
        console.log('❌ CourseCertificateDownload: Error response:', errorText);
        return null;
      }
    } catch (error) {
      console.log('💥 CourseCertificateDownload: Payment verification error:', error);
      return null;
    }
  };

  // Function to initiate Razorpay payment
  const initiateRazorpayPayment = async () => {
    try {
      console.log('🚀 CourseCertificateDownload: Starting Razorpay payment flow...');
      setIsProcessingPayment(true);
      
      // Request payment from backend
      console.log('💳 CourseCertificateDownload: Requesting payment from backend...');
      const paymentRequest = await requestCourseCertificatePayment();
      console.log('📥 CourseCertificateDownload: Payment request response:', paymentRequest);
      
      if (!paymentRequest || !paymentRequest.success) {
        console.log('❌ CourseCertificateDownload: Payment request failed or returned invalid response');
        Alert.alert('Error', 'First you have to complete all lessons and enroll the payment for download.');
        return;
      }

      const paymentData = paymentRequest.data;
      console.log('📊 CourseCertificateDownload: Payment data received:', paymentData);
      
      // Extract the correct data from the API response
      const certificatePayment = paymentData.certificatePayment;
      const razorpayOrder = paymentData.razorpayOrder;
      
      console.log('📊 CourseCertificateDownload: Certificate payment:', certificatePayment);
      console.log('📊 CourseCertificateDownload: Razorpay order:', razorpayOrder);
      
      // Configure Razorpay options
      const options = {
        description: `Certificate for ${certificateData?.courseName || 'Course'}`,
        image: 'https://your-logo-url.com/logo.png',
        currency: 'INR',
        key: 'rzp_live_ZumwCLoX1AZdm9', // Your Razorpay key
        amount: razorpayOrder.amount,
        name: 'LearningSaint',
        order_id: certificatePayment.razorpayOrderId,
        prefill: {
          email: 'user@example.com',
          contact: '9999999999',
          name: 'User Name'
        },
        theme: { color: '#FF8800' }
      };

      console.log('💳 CourseCertificateDownload: Razorpay Options:', options);

      // Open Razorpay checkout
      console.log('🚀 CourseCertificateDownload: Opening Razorpay checkout...');
      const razorpayResponse = await RazorpayCheckout.open(options);
      console.log('✅ CourseCertificateDownload: Payment successful:', razorpayResponse);

      // Verify payment with backend
      console.log('🔄 CourseCertificateDownload: Verifying payment with backend...');
      console.log('📤 CourseCertificateDownload: Payment result from Razorpay:', razorpayResponse);
      console.log('📤 CourseCertificateDownload: certificatePaymentId being sent:', certificatePayment._id);
      
      const verificationData = {
        certificatePaymentId: certificatePayment._id,
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature
      };

      console.log('📤 CourseCertificateDownload: Verification payload for backend:', verificationData);

      const verificationResult = await verifyCourseCertificatePayment(verificationData);
      console.log('📥 CourseCertificateDownload: Verify API response:', verificationResult);
      
      if (verificationResult && verificationResult.success) {
        console.log('✅ CourseCertificateDownload: Payment verification successful, refreshing certificate data...');
        
        // Immediately refresh certificate data to get updated payment status
        await fetchCertificateDescription();
        
        Alert.alert(
          'Payment Successful! 🎉',
          'Your payment has been verified. You can now download the certificate.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('✅ CourseCertificateDownload: Payment completed, user can now download certificate');
              }
            }
          ]
        );
      } else {
        console.log('❌ CourseCertificateDownload: Payment verification failed:', verificationResult);
        Alert.alert('Payment Verification Failed', 'Please contact support if the amount was deducted.');
      }

    } catch (error) {
      console.log('💥 CourseCertificateDownload: Razorpay payment error:', error);
      console.log('💥 CourseCertificateDownload: Error code:', error.code);
      console.log('💥 CourseCertificateDownload: Error message:', error.message);
      
      if (error.code === 'RazorpayCheckoutCancel') {
        console.log('❌ CourseCertificateDownload: User cancelled payment');
        Alert.alert('Payment Cancelled', 'Payment was cancelled by user.');
      } else {
        console.log('❌ CourseCertificateDownload: Payment error occurred');
        Alert.alert('Payment Error', 'Something went wrong during payment. Please try again.');
      }
    } finally {
      console.log('🏁 CourseCertificateDownload: Payment flow completed, setting processing to false');
      setIsProcessingPayment(false);
    }
  };

  const handleDownload = async () => {
    try {
      if (!courseId) {
        Alert.alert('Error', 'Course ID not found');
        return;
      }

      // Check payment status first
      if (!certificateData?.isPaymentDone) {
        console.log('💳 CourseCertificateDownload: Payment not done, initiating payment flow...');
        await initiateRazorpayPayment();
        return;
      }

      // Request storage permission first
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        // Show comprehensive permission help for Android 13+
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          Alert.alert(
            'Permission Required for Android 13+',
            'This app needs media access permissions to download certificates. Please follow these steps:\n\n1. Go to Settings > Apps > LearningSaint > Permissions\n2. Enable "Photos and videos" permission\n3. Also enable "Storage" permission if available\n4. Return to app and try again',
            [
              { text: 'OK' },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  Linking.openSettings();
                }
              },
              {
                text: 'Try Again',
                onPress: async () => {
                  const retryPermission = await requestStoragePermission();
                  if (retryPermission) {
                    handleDownload(); // Recursive call to retry download
                  }
                }
              }
            ]
          );
        } else {
          // For older Android versions
          Alert.alert(
            'Permission Required',
            'Storage permission is required to download certificates. Please grant permission and try again.',
            [
              { text: 'OK' },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  Linking.openSettings();
                }
              },
              {
                text: 'Try Again',
                onPress: async () => {
                  const retryPermission = await requestStoragePermission();
                  if (retryPermission) {
                    handleDownload(); // Recursive call to retry download
                  }
                }
              }
            ]
          );
        }
        return;
      }

      setIsDownloading(true);

      // API endpoint using config file with courseId in URL
      const apiUrl = getApiUrl(`/api/user/certificate/download-main-course-certificate/${courseId}`);
      
      console.log('🌐 CourseCertificateDownload: Download API URL:', apiUrl);
      console.log('🔑 CourseCertificateDownload: Using token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      console.log('📋 CourseCertificateDownload: Course ID:', courseId);
      
      // Make direct API call with proper headers
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      });
      
      console.log('📡 CourseCertificateDownload: Download response status:', response.status);
      console.log('📡 CourseCertificateDownload: Download response headers:', response.headers);
      
      
      if (response.ok) {
        
        // Get the response as array buffer (works better in React Native)
        const arrayBuffer = await response.arrayBuffer();
        
        // Convert array buffer to base64
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        
        try {
          // First try to save to Downloads folder (accessible via file manager)
          const fileName = `course_certificate_${courseId}.pdf`;
          let filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
          let locationMessage = 'Downloads folder';
          
          try {
            // Test if we can write to Downloads directory
            const canWriteToDownloads = await testDownloadsAccess();
            
            if (canWriteToDownloads) {
              // Write the PDF file to Downloads
              await RNFS.writeFile(filePath, base64Data, 'base64');
            } else {
              throw new Error('Cannot write to Downloads directory');
            }
          } catch (downloadsError) {
            // Fallback to app documents directory
            filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
            locationMessage = 'App Documents folder';
            
            // Ensure directory exists
            const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
            const dirExists = await RNFS.exists(dirPath);
            if (!dirExists) {
              await RNFS.mkdir(dirPath);
            }
            
            // Write the PDF file
            await RNFS.writeFile(filePath, base64Data, 'base64');
          }
          
          // Check if file exists
          const fileExists = await RNFS.exists(filePath);
          
          if (fileExists) {
            // Get file info
            const fileStats = await RNFS.stat(filePath);
            
            // Show success message with file location
            Alert.alert(
              'Download Complete! 🎉',
              `Certificate saved as ${fileName}\nLocation: ${locationMessage}\n\nYou can find it in your file manager.`,
              [
                { text: 'OK' },
                { 
                  text: 'Open PDF', 
                  onPress: async () => {
                    try {
                      // Try to open the PDF with a PDF viewer app
                      await Linking.openURL(`file://${filePath}`);
                    } catch (openError) {
                      Alert.alert(
                        'PDF Location',
                        `PDF saved to:\n${filePath}\n\nUse your file manager to open it.`
                      );
                    }
                  }
                },
                {
                  text: 'Share File',
                  onPress: async () => {
                    try {
                      // Try to share the file
                      await Linking.openURL(`file://${filePath}`);
                    } catch (shareError) {
                      Alert.alert(
                        'File Location',
                        `PDF saved to:\n${filePath}\n\nYou can find it in your file manager.`
                      );
                    }
                  }
                }
              ]
            );
          } else {
            throw new Error('File was not created successfully');
          }
          
        } catch (writeError) {
          console.error('❌ Error writing file:', writeError);
          console.error('❌ Error details:', writeError.message);
          
          // Final fallback: try to save to app's cache directory
          try {
            const fallbackFileName = `course_certificate_${courseId}.pdf`;
            const fallbackFilePath = `${RNFS.CachesDirectoryPath}/${fallbackFileName}`;
            await RNFS.writeFile(fallbackFilePath, base64Data, 'base64');
            
            Alert.alert(
              'Download Complete! 🎉',
              `Certificate saved as ${fallbackFileName}\nLocation: App Cache folder\n\nNote: This file may be temporary.`,
              [{ text: 'OK' }]
            );
          } catch (finalFallbackError) {
            console.error('❌ All fallback methods failed:', finalFallbackError);
            Alert.alert(
              'Download Failed',
              'Could not save PDF to phone. Please check your storage permissions and try again.',
              [
                { text: 'OK' },
                {
                  text: 'Check Permissions',
                  onPress: () => {
                    const currentPerms = checkCurrentPermissions();
                  }
                }
              ]
            );
          }
        }
        
      } else {
        console.error('❌ CourseCertificateDownload: API call failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ CourseCertificateDownload: Error response body:', errorText);
        
        if (response.status === 401) {
          console.log('🔐 CourseCertificateDownload: Authentication error - token may be invalid or expired');
          Alert.alert('Authentication Error', 'Please login again to download certificate');
        } else if (response.status === 403) {
          console.log('🚫 CourseCertificateDownload: Forbidden error - user may not have permission to download this certificate');
          Alert.alert(
            'Access Denied', 
            'You do not have permission to download this certificate. Please ensure:\n\n1. You have completed the course\n2. You have made the required payment\n3. The certificate is available for download'
          );
        } else if (response.status === 404) {
          console.log('📄 CourseCertificateDownload: Certificate not found');
          Alert.alert('Certificate Not Found', 'Certificate for this course is not available yet');
        } else {
          console.log('❌ CourseCertificateDownload: Unknown error occurred');
          Alert.alert('Download Failed', `Error: ${response.status} - ${response.statusText}\n\nResponse: ${errorText}`);
        }
      }
      
    } catch (error) {
      console.error('💥 Download error:', error);
      console.error('💥 Error message:', error.message);
      Alert.alert('Error', 'Something went wrong while downloading. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={handleBackPress} />
        <Text style={styles.headerTitle}>Download Certificate</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent} >
        {/* Congratulations Section */}
        <View style={styles.congratulationsContainer}>
          <Text style={styles.congratulationsText}>Congratulations</Text>
          <Text style={styles.congratulationsSubtext}>For Completing Course</Text>
          
          {/* Dynamic Course Name */}
          {(certificateData?.courseName || certificateData?.subcourseName) && (
            <Text style={styles.subcourseNameText}>
              {certificateData.courseName || certificateData.subcourseName}
            </Text>
          )}
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
            {isLoadingCertificate ? 'Loading certificate details...' : 
             certificateData?.certificateDescription || 
             'In this course you will learn how to build a space to a 3-dimensional product. There are 24 premium learning videos for you.'}
          </Text>
        </View>
      </ScrollView>

      {/* Download Button */}
      <View style={styles.downloadButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.downloadButton, 
            (isDownloading || isProcessingPayment) && styles.downloadButtonDisabled
          ]}
          onPress={handleDownload}
          disabled={isDownloading || isProcessingPayment}
        >
          <LinearGradient
            colors={['#FF8A00', '#FFB300']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.downloadButtonText}>
              {isProcessingPayment 
                ? 'Processing Payment...' 
                : isDownloading 
                  ? 'Downloading...' 
                  : certificateData?.isPaymentDone 
                    ? 'Download Certificate' 
                    : `Download Pay ₹${certificateData?.price || 0}`
              }
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CourseCertificateDownload;

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
    fontWeight: '500',
    textAlign: 'center',
  },
  subcourseNameText: {
    fontSize: getResponsiveSize(20),
    fontWeight: 'bold',
    color: '#333',
    marginTop: getResponsiveSize(10),
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