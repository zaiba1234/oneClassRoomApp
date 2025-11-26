
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
import { useAppSelector } from '../Redux/hooks';
import { getApiUrl } from '../API/config';
import RNFS from 'react-native-fs'; // Ensure this is imported at the top
import { Buffer } from 'buffer'; // Add Buffer polyfill for React Native
import BackButton from '../Component/BackButton';
import RazorpayCheckout from 'react-native-razorpay';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const DownloadCertificateScreen = () => {
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
      console.log('🔍 Testing downloads directory access...');
      
      // Try to create a test file
      const testFileName = `test_${Date.now()}.txt`;
      const testFilePath = `${RNFS.DownloadDirectoryPath}/${testFileName}`;
      
      console.log('📁 Test file path:', testFilePath);
      
      // Write a test file
      await RNFS.writeFile(testFilePath, 'test content', 'utf8');
      console.log('✅ Test file written successfully');
      
      // Check if file exists
      const fileExists = await RNFS.exists(testFilePath);
      console.log('📋 Test file exists:', fileExists);
      
      if (fileExists) {
        // Delete test file
        await RNFS.unlink(testFilePath);
        console.log('🗑️ Test file deleted successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Downloads access test failed:', error);
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
      console.log('📥 DownloadCertificate: Fetching certificate description...');
      setIsLoadingCertificate(true);
      
      const apiUrl = getApiUrl(`/api/user/course/get-certificateDesc/${courseId}`);
      console.log('🌐 DownloadCertificate: Certificate API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('📡 DownloadCertificate: Certificate API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📥 DownloadCertificate: Certificate data received:', result);
        
        if (result.success && result.data) {
          console.log('📊 DownloadCertificate: Setting certificate data:', result.data);
          console.log('💰 DownloadCertificate: Payment status - isPaymentDone:', result.data.isPaymentDone);
          console.log('🆓 DownloadCertificate: isCertificateFree flag:', result.data.isCertificateFree);
          console.log('🆓 DownloadCertificate: isCertificateFree type:', typeof result.data.isCertificateFree);
          setCertificateData(result.data);
        } else {
          console.log('❌ DownloadCertificate: API response not successful:', result);
          Alert.alert('Error', 'Failed to fetch certificate details');
        }
      } else {
        console.log('❌ DownloadCertificate: API call failed with status:', response.status);
        Alert.alert('Error', 'Failed to fetch certificate details');
      }
    } catch (error) {
      console.log('💥 DownloadCertificate: Fetch certificate description error:', error);
      Alert.alert('Error', 'Failed to fetch certificate details');
    } finally {
      console.log('🏁 DownloadCertificate: Certificate fetching completed');
      setIsLoadingCertificate(false);
    }
  };

  // Pull-to-refresh function
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

  // Function to request certificate payment
  const requestCertificatePayment = async () => {
    try {
      console.log('💳 Requesting certificate payment for courseId:', courseId);
      
      const apiUrl = getApiUrl('/api/user/certificate/request-subcourse-certificate-payment');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subcourseId: courseId
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Payment request successful:', result);
        return result;
      } else {
        console.log('❌ Payment request failed:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
        return null;
      }
    } catch (error) {
      console.log('💥 Payment request error:', error);
      return null;
    }
  };

  // Function to verify certificate payment
  const verifyCertificatePayment = async (paymentData) => {
    try {
      console.log('🔍 DownloadCertificate: Verifying certificate payment...');
      console.log('📤 DownloadCertificate: Payment details being sent:', paymentData);
      
      const apiUrl = getApiUrl('/api/user/certificate/verify-certificate-payment');
      console.log('🌐 DownloadCertificate: Verify API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      console.log('📡 DownloadCertificate: Verify API response status:', response.status);
      console.log('📡 DownloadCertificate: Verify API response headers:', response.headers);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📥 DownloadCertificate: Verify payment response:', result);
        console.log('✅ DownloadCertificate: Payment verification successful');
        return result;
      } else {
        console.log('❌ DownloadCertificate: Payment verification failed:', response.status);
        const errorText = await response.text();
        console.log('❌ DownloadCertificate: Error response:', errorText);
        return null;
      }
    } catch (error) {
      console.log('💥 DownloadCertificate: Payment verification error:', error);
      console.log('💥 DownloadCertificate: Error message:', error.message);
      return null;
    }
  };

  // Function to initiate Razorpay payment
  const initiateRazorpayPayment = async () => {
    try {
      console.log('🚀 DownloadCertificate: Starting Razorpay payment flow...');
      setIsProcessingPayment(true);
      
      // Request payment from backend
      console.log('💳 DownloadCertificate: Requesting payment from backend...');
      const paymentRequest = await requestCertificatePayment();
      console.log('📥 DownloadCertificate: Payment request response:', paymentRequest);
      
      if (!paymentRequest || !paymentRequest.success) {
        console.log('❌ DownloadCertificate: Payment request failed or returned invalid response');
        Alert.alert('Error', 'First you have to complete all lessons and enroll the payment for download.');
        return;
      }

      const paymentData = paymentRequest.data;
      console.log('📊 DownloadCertificate: Payment data received:', paymentData);
      
      // Extract the correct data from the API response
      const certificatePayment = paymentData.certificatePayment;
      const razorpayOrder = paymentData.razorpayOrder;
      
      console.log('📊 DownloadCertificate: Certificate payment:', certificatePayment);
      console.log('📊 DownloadCertificate: Razorpay order:', razorpayOrder);
      
      // Configure Razorpay options
      const options = {
        description: `Certificate for ${certificateData?.subcourseName || 'Course'}`,
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

      console.log('💳 DownloadCertificate: Razorpay Options:', options);

      // Open Razorpay checkout
      console.log('🚀 DownloadCertificate: Opening Razorpay checkout...');
      const razorpayResponse = await RazorpayCheckout.open(options);
      console.log('✅ DownloadCertificate: Payment successful:', razorpayResponse);

      // Verify payment with backend
      console.log('🔄 DownloadCertificate: Verifying payment with backend...');
      console.log('📤 DownloadCertificate: Payment result from Razorpay:', razorpayResponse);
      console.log('📤 DownloadCertificate: certificatePaymentId being sent:', certificatePayment._id);
      
      const verificationData = {
        certificatePaymentId: certificatePayment._id,
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature
      };

      console.log('📤 DownloadCertificate: Verification payload for backend:', verificationData);

      const verificationResult = await verifyCertificatePayment(verificationData);
      console.log('📥 DownloadCertificate: Verify API response:', verificationResult);
      
      if (verificationResult && verificationResult.success) {
        console.log('✅ DownloadCertificate: Payment verification successful, refreshing certificate data...');
        
        // Immediately refresh certificate data to get updated payment status
        await fetchCertificateDescription();
        
        Alert.alert(
          'Payment Successful! 🎉',
          'Your payment has been verified. You can now download the certificate.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('✅ DownloadCertificate: Payment completed, user can now download certificate');
              }
            }
          ]
        );
      } else {
        console.log('❌ DownloadCertificate: Payment verification failed:', verificationResult);
        console.log('❌ DownloadCertificate: Verification result success:', verificationResult?.success);
        console.log('❌ DownloadCertificate: Verification result data:', verificationResult?.data);
        Alert.alert('Payment Verification Failed', 'Please contact support if the amount was deducted.');
      }

    } catch (error) {
      console.log('💥 DownloadCertificate: Razorpay payment error:', error);
      console.log('💥 DownloadCertificate: Error code:', error.code);
      console.log('💥 DownloadCertificate: Error message:', error.message);
      
      if (error.code === 'RazorpayCheckoutCancel') {
        console.log('❌ DownloadCertificate: User cancelled payment');
        Alert.alert('Payment Cancelled', 'Payment was cancelled by user.');
      } else {
        console.log('❌ DownloadCertificate: Payment error occurred');
        Alert.alert('Payment Error', 'Something went wrong during payment. Please try again.');
      }
    } finally {
      console.log('🏁 DownloadCertificate: Payment flow completed, setting processing to false');
      setIsProcessingPayment(false);
    }
  };

  const handleDownload = async () => {
    try {
      if (!courseId) {
        Alert.alert('Error', 'Course ID not found');
        return;
      }

      // Check if certificate is free - if true, bypass payment
      const isCertificateFree = certificateData?.isCertificateFree === true || certificateData?.isCertificateFree === 'true';
      console.log('🆓 DownloadCertificate: isCertificateFree check:', isCertificateFree);
      console.log('🆓 DownloadCertificate: certificateData.isCertificateFree:', certificateData?.isCertificateFree);

      // If certificate is free, skip payment check and go directly to download
      if (!isCertificateFree) {
        // Check payment status only if certificate is not free
        if (!certificateData?.isPaymentDone) {
          console.log('💳 Payment not done, initiating payment flow...');
          await initiateRazorpayPayment();
          return;
        }
      } else {
        console.log('🆓 DownloadCertificate: Certificate is FREE, bypassing payment');
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
                  console.log('🔧 Opening app settings...');
                  Linking.openSettings();
                }
              },
              {
                text: 'Try Again',
                onPress: async () => {
                  console.log('🔄 Retrying permission request...');
                  const retryPermission = await requestStoragePermission();
                  if (retryPermission) {
                    console.log('✅ Permission granted on retry, proceeding with download...');
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
                  console.log('🔧 Opening app settings...');
                  Linking.openSettings();
                }
              },
              {
                text: 'Try Again',
                onPress: async () => {
                  console.log('🔄 Retrying permission request...');
                  const retryPermission = await requestStoragePermission();
                  if (retryPermission) {
                    console.log('✅ Permission granted on retry, proceeding with download...');
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
      console.log('🔍 Starting certificate download for courseId:', courseId);
      console.log('🔑 Token available:', !!token);

      // API endpoint using config file with subcourseId in URL
      const apiUrl = getApiUrl(`/api/user/certificate/download-certificate/${courseId}`);
      console.log('🌐 API URL:', apiUrl);
      
      // Make direct API call with proper headers
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      });
      
      console.log('📡 API Response Status:', response.status);
      console.log('📡 API Response Headers:', JSON.stringify([...response.headers.entries()], null, 2));
      
      if (response.ok) {
        console.log('✅ API call successful, processing PDF...');
        
        // Get the response as array buffer (works better in React Native)
        const arrayBuffer = await response.arrayBuffer();
        console.log('📄 ArrayBuffer received, size:', arrayBuffer.byteLength, 'bytes');
        
        // Convert array buffer to base64
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        console.log('🔢 Base64 data prepared, length:', base64Data.length);
        
        try {
          // First try to save to Downloads folder (accessible via file manager)
          const fileName = `certificate_${courseId}.pdf`;
          let filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
          let locationMessage = 'Downloads folder';
          
          console.log('📁 Trying Downloads directory first:', filePath);
          
          try {
            // Test if we can write to Downloads directory
            const canWriteToDownloads = await testDownloadsAccess();
            
            if (canWriteToDownloads) {
              // Write the PDF file to Downloads
              await RNFS.writeFile(filePath, base64Data, 'base64');
              console.log('✅ PDF saved successfully to Downloads:', filePath);
            } else {
              throw new Error('Cannot write to Downloads directory');
            }
          } catch (downloadsError) {
            console.log('📁 Downloads directory failed, trying app documents directory...');
            
            // Fallback to app documents directory
            filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
            locationMessage = 'App Documents folder';
            
            // Ensure directory exists
            const dirPath = (filePath || '').substring(0, (filePath || '').lastIndexOf('/'));
            const dirExists = await RNFS.exists(dirPath);
            if (!dirExists) {
              await RNFS.mkdir(dirPath);
              console.log('📁 Created directory:', dirPath);
            }
            
            // Write the PDF file
            await RNFS.writeFile(filePath, base64Data, 'base64');
            console.log('✅ PDF saved successfully to app documents:', filePath);
          }
          
          // Check if file exists
          const fileExists = await RNFS.exists(filePath);
          console.log('📋 File exists check:', fileExists);
          
          if (fileExists) {
            // Get file info
            const fileStats = await RNFS.stat(filePath);
            console.log('📊 File stats:', fileStats);
            
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
                      console.log('🔗 PDF opened successfully');
                    } catch (openError) {
                      console.log('📱 Could not open PDF directly, showing file path');
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
                      console.log('📤 File shared successfully');
                    } catch (shareError) {
                      console.log('📤 Could not share file directly');
                      Alert.alert(
                        'File Location',
                        `File saved to:\n${filePath}\n\nYou can find it in your file manager.`
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
          console.log('Error writing file:', writeError);
          console.log('Error details:', writeError.message);
          
          // Final fallback: try to save to app's cache directory
          try {
            const fallbackFileName = `certificate_${courseId}.pdf`;
            const fallbackFilePath = `${RNFS.CachesDirectoryPath}/${fallbackFileName}`;
            console.log('🔄 Final fallback: trying cache directory:', fallbackFilePath);
            await RNFS.writeFile(fallbackFilePath, base64Data, 'base64');
            
            Alert.alert(
              'Download Complete! 🎉',
              `Certificate saved as ${fallbackFileName}\nLocation: App Cache folder\n\nNote: This file may be temporary.`,
              [{ text: 'OK' }]
            );
          } catch (finalFallbackError) {
            console.log('All fallback methods failed:', finalFallbackError);
            Alert.alert(
              'Download Failed',
              'Could not save PDF to phone. Please check your storage permissions and try again.',
              [
                { text: 'OK' },
                {
                  text: 'Check Permissions',
                  onPress: () => {
                    const currentPerms = checkCurrentPermissions();
                    console.log('🔍 Current permissions:', currentPerms);
                  }
                }
              ]
            );
          }
        }
        
      } else {
        // Log error details for debugging but don't show in UI
        console.log('API call failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('Error response:', errorText);
        
        if (response.status === 401) {
          Alert.alert('Authentication Error', 'Please login again to download certificate');
        } else if (response.status === 403) {
          Alert.alert('Course Not Completed', 'First you have to complete all the lessons then download the certificate of subcourse');
        } else if (response.status === 404) {
          Alert.alert('Certificate Not Found', 'Certificate for this course is not available yet');
        } else {
          Alert.alert('Download Failed', `Error: ${response.status} - ${response.statusText}`);
        }
      }
    } catch (error) {
      // Log error details for debugging but don't show in UI
      console.log('Download error:', error);
      console.log('Error message:', error.message);
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
        <Text style={styles.headerTitle}>Download Certificates</Text>
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
          
          {/* Dynamic Subcourse Name */}
          {certificateData?.subcourseName && (
            <Text style={styles.subcourseNameText}>
              {certificateData.subcourseName}
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
                  : (certificateData?.isCertificateFree === true || certificateData?.isCertificateFree === 'true')
                    ? 'Download Certificate'
                    : certificateData?.isPaymentDone 
                      ? 'Download Certificate' 
                      : `Download Pay ₹${certificateData?.certificatePrice || 0}`
              }
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        

        

      </View>
    </SafeAreaView>
  );
};

export default DownloadCertificateScreen;

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
  scrollView: {
    // flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    // paddingBottom: getResponsiveSize(20),
  },
  congratulationsContainer: {
    alignItems: 'center',
  //  marginBottom:20,// Reduced from 30 to 10
  },
  congratulationsImage: {
    width: getResponsiveSize(200),
    height: getResponsiveSize(80),
   
  },
  congratulationsSubtext: {
    fontSize: getResponsiveSize(16),
    color: '#333',
    fontWeight: '500',
    marginTop: getResponsiveSize(-10),
    // textAlign: 'center',
  },
  subcourseNameText: {
    fontSize: getResponsiveSize(20),
    fontWeight: 'bold',
    color: '#333',
    
  },
  certificateContainer: {
    alignItems: 'center',
    marginVertical: getResponsiveSize(-20), // Added small margin to control gap
  },
  certificateImage: {
    overflow: 'hidden',
    borderRadius: getResponsiveSize(20),
    width: width - getResponsiveSize(10),
    height: getResponsiveSize(300),
  },
  descriptionContainer: {
    paddingHorizontal: getResponsiveSize(10),
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
});``