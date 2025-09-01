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
import { useAppSelector } from '../Redux/hooks';
import { getApiUrl } from '../API/config';
import RNFS from 'react-native-fs'; // Ensure this is imported at the top
import { Buffer } from 'buffer'; // Add Buffer polyfill for React Native

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

  // Get courseId from route params (coming from EnrollScreen)
  const courseId = route.params?.courseId;

  // Function to check current permission status
  const checkCurrentPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        console.log('🔍 Checking current permission status...');
        
        if (Platform.Version >= 33) {
          const readMediaImages = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
          const readMediaVideo = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
          console.log('📱 Current Media Permissions - Images:', readMediaImages, 'Video:', readMediaVideo);
          return { readMediaImages, readMediaVideo };
        } else {
          const writeStorage = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
          const readStorage = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
          console.log('📱 Current Storage Permissions - Write:', writeStorage, 'Read:', readStorage);
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
      console.error('❌ Downloads access test failed:', error);
      return false;
    }
  };

  // Function to request storage permissions
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        console.log('📱 Checking platform: Android, Version:', Platform.Version);
        let granted = false;

        if (Platform.Version >= 33) {
          // Android 13+ requires READ_MEDIA_IMAGES and READ_MEDIA_VIDEO
          console.log('📱 Android 13+ detected, requesting media permissions...');
          
          // First check if permissions are already granted
          const hasImages = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
          const hasVideo = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
          
          console.log('📱 Current permissions - Images:', hasImages, 'Video:', hasVideo);
          
          if (hasImages && hasVideo) {
            console.log('✅ Media permissions already granted');
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
          
          console.log('📱 READ_MEDIA_IMAGES result:', readMediaImages);
          
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
          
          console.log('📱 READ_MEDIA_VIDEO result:', readMediaVideo);
          
          granted = (readMediaImages === PermissionsAndroid.RESULTS.GRANTED && 
                    readMediaVideo === PermissionsAndroid.RESULTS.GRANTED);
          
          console.log('📱 Final Media Permissions Result - Images:', readMediaImages, 'Video:', readMediaVideo, 'Granted:', granted);
          
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
                    console.log('🔧 Opening app settings...');
                    Linking.openSettings();
                  }
                }
              ]
            );
          }
          
        } else if (Platform.Version >= 29) {
          // Android 10-12
          console.log('📱 Android 10-12 detected, requesting storage permissions...');
          
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
          
          console.log('📱 Storage Permissions Result - Write:', writePermission, 'Read:', readPermission);
          
        } else {
          // Android 9 and below
          console.log('📱 Android 9 or below detected, requesting legacy storage permissions...');
          
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
          console.log('📱 Legacy Storage Permission Result:', writePermission);
        }

        if (granted) {
          console.log('✅ Storage permissions granted');
          return true;
        } else {
          console.log('❌ Storage permissions denied');
          return false;
        }
      } catch (err) {
        console.error('❌ Permission request error:', err.message);
        Alert.alert('Permission Error', 'An error occurred while requesting permissions. Please check logs and try again.');
        return false;
      }
    }
    console.log('📱 iOS detected, no permission required');
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

  const handleDownload = async () => {
    try {
      if (!courseId) {
        Alert.alert('Error', 'Course ID not found');
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
      console.log('🔍 Starting course certificate download for courseId:', courseId);
      console.log('🔑 Token available:', !!token);

      // API endpoint using config file with courseId in URL
      const apiUrl = getApiUrl(`/api/user/certificate/download-course-certificate/${courseId}`);
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
          // First try downloads directory
          const fileName = `course_certificate_${courseId}.pdf`;
          let filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
          
          console.log('📁 Trying downloads directory:', filePath);
          
          // Test if we can access downloads directory
          const downloadsAccessible = await testDownloadsAccess();
          
          if (!downloadsAccessible) {
            console.log('⚠️ Downloads directory not accessible, using app documents directory');
            filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
          }
          
          console.log('📁 Final file path:', filePath);
          
          // Ensure directory exists
          const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
          const dirExists = await RNFS.exists(dirPath);
          if (!dirExists) {
            await RNFS.mkdir(dirPath);
            console.log('📁 Created directory:', dirPath);
          }
          
          // Write the PDF file
          await RNFS.writeFile(filePath, base64Data, 'base64');
          console.log('✅ PDF saved successfully to:', filePath);
          
          // Check if file exists
          const fileExists = await RNFS.exists(filePath);
          console.log('📋 File exists check:', fileExists);
          
          if (fileExists) {
            // Get file info
            const fileStats = await RNFS.stat(filePath);
            console.log('📊 File stats:', fileStats);
            
            // Determine location message
            const locationMessage = filePath.includes('Download') ? 'Downloads folder' : 'App Documents folder';
            
            // Show success message with file location
            Alert.alert(
              'Download Complete! 🎉',
              `Certificate saved as ${fileName}\nLocation: ${locationMessage}`,
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
            console.log('🔄 Final fallback: trying cache directory:', fallbackFilePath);
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
                    console.log('🔍 Current permissions:', currentPerms);
                  }
                }
              ]
            );
          }
        }
        
      } else {
        console.error('❌ API call failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        if (response.status === 401) {
          Alert.alert('Authentication Error', 'Please login again to download certificate');
        } else if (response.status === 404) {
          Alert.alert('Certificate Not Found', 'Certificate for this course is not available yet');
        } else {
          Alert.alert('Download Failed', `Error: ${response.status} - ${response.statusText}`);
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}>
          <Icon name="chevron-back" size={getResponsiveSize(24)} color="#333" />
        </TouchableOpacity>
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
          style={[styles.downloadButton, isDownloading && styles.downloadButtonDisabled]}
          onPress={handleDownload}
          disabled={isDownloading}
        >
          <LinearGradient
            colors={['#FF8A00', '#FFB300']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.downloadButtonText}>
              {isDownloading ? 'Downloading...' : 'Download Certificate'}
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