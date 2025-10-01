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
  Platform,
  RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);

  // Get courseId from route params (coming from EnrollScreen)
  const courseId = route.params?.courseId;

  // Function to check current permission status - Simplified for Google Play compliance
  const checkCurrentPermissions = async () => {
    // For all platforms, downloads to Downloads folder don't require media permissions
    console.log('📱 No media permissions needed for certificate downloads');
    return { hasPermission: true };
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
      return false;
    }
  };

  // Function to request storage permissions - Simplified for Google Play compliance
  const requestStoragePermission = async () => {
    // For all platforms, downloads to Downloads folder don't require media permissions
    console.log('📱 No permissions needed for certificate downloads');
    return true;
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
      setIsLoadingCertificate(true);
      
      const apiUrl = getApiUrl(`/api/user/course/get-CoursecertificateDesc/${courseId}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          setCertificateData(result.data);
        } else {
          Alert.alert('Error', 'Failed to fetch certificate details');
        }
      } else {
        Alert.alert('Error', 'Failed to fetch certificate details');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch certificate details');
    } finally {
      setIsLoadingCertificate(false);
    }
  };

  // Function to handle pull-to-refresh
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchCertificateDescription();
    } catch (error) {
      // Handle refresh error silently
    } finally {
      setRefreshing(false);
    }
  };

  // Function to request course certificate payment
  const requestCourseCertificatePayment = async () => {
    try {
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
        return result;
      } else {
        const errorText = await response.text();
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  // Function to verify course certificate payment
  const verifyCourseCertificatePayment = async (paymentData) => {
    try {
      const apiUrl = getApiUrl('/api/user/certificate/verify-certificate-payment');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorText = await response.text();
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  // Function to initiate Razorpay payment
  const initiateRazorpayPayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Request payment from backend
      const paymentRequest = await requestCourseCertificatePayment();
      
      if (!paymentRequest || !paymentRequest.success) {
        Alert.alert('Error', 'First you have to complete all lessons and enroll the payment for download.');
        return;
      }

      const paymentData = paymentRequest.data;
      
      // Extract the correct data from the API response
      const certificatePayment = paymentData.certificatePayment;
      const razorpayOrder = paymentData.razorpayOrder;
      
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

      // Open Razorpay checkout
      const razorpayResponse = await RazorpayCheckout.open(options);

      // Verify payment with backend
      const verificationData = {
        certificatePaymentId: certificatePayment._id,
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature
      };

      const verificationResult = await verifyCourseCertificatePayment(verificationData);
      
      if (verificationResult && verificationResult.success) {
        // Immediately refresh certificate data to get updated payment status
        await fetchCertificateDescription();
        
        Alert.alert(
          'Payment Successful! 🎉',
          'Your payment has been verified. You can now download the certificate.',
          [
            {
              text: 'OK',
              onPress: () => {
              }
            }
          ]
        );
      } else {
        Alert.alert('Payment Verification Failed', 'Please contact support if the amount was deducted.');
      }

    } catch (error) {
      if (error.code === 'RazorpayCheckoutCancel') {
        Alert.alert('Payment Cancelled', 'Payment was cancelled by user.');
      } else {
        Alert.alert('Payment Error', 'Something went wrong during payment. Please try again.');
      }
    } finally {
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
      console.log('🔑 CourseCertificateDownload: Using token:', token ? `${(token || '').substring(0, 20)}...` : 'NO TOKEN');
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
            const dirPath = (filePath || '').substring(0, (filePath || '').lastIndexOf('/'));
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
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF8A00']}
            tintColor="#FF8A00"
            title="Pull to refresh..."
            titleColor="#FF8A00"
          />
        }
      >
        {/* Congratulations Section */}
        <View style={styles.congratulationsContainer}>
          <Image 
            source={require('../assests/images/conge.jpeg')} 
            style={styles.congratulationsImage}
            resizeMode="contain"
          />
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
    paddingTop: getResponsiveSize(25),
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
  congratulationsImage: {
    width: getResponsiveSize(200),
    height: getResponsiveSize(80),
    marginBottom: getResponsiveSize(10),
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