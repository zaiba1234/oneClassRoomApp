import React, { useState, useCallback } from 'react';
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
  Modal,
  ActivityIndicator,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import BackButton from '../Component/BackButton';
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

  // Custom alert state
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // info, success, error, warning, loading
    buttons: [],
    showSpinner: false,
  });

  // Get courseId from route params (coming from EnrollScreen)
  const courseId = route.params?.courseId;

  // Helper functions for custom alert
  const getAlertColor = useCallback((type) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      case 'loading': return '#2196F3';
      default: return '#2196F3';
    }
  }, []);

  const getAlertIcon = useCallback((type) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      case 'loading': return 'refresh';
      default: return 'information-circle';
    }
  }, []);

  const showCustomAlert = useCallback((title, message, type = 'info', buttons = [], showSpinner = false) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      type,
      buttons,
      showSpinner,
    });
  }, []);

  const hideCustomAlert = useCallback(() => {
    setCustomAlert(prev => ({ ...prev, visible: false }));
  }, []);

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
      const apiUrl = getApiUrl(`/api/user/certificate/download-course-certificate/${courseId}`);
      
      // Make direct API call with proper headers
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      });
      
      
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
                {
                  text: 'Done',
                  onPress: hideCustomAlert,
                  style: 'primary',
                },
                { 
                  text: 'View PDF', 
                  onPress: async () => {
                    hideCustomAlert();
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

  // Custom Alert Component
  const CustomAlert = () => (
    <Modal
      visible={customAlert.visible}
      transparent={true}
      animationType="fade"
      onRequestClose={hideCustomAlert}
    >
      <View style={styles.alertOverlay}>
        <View style={styles.alertContainer}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={hideCustomAlert}
            activeOpacity={0.7}
          >
            <Icon name="close" size={getResponsiveSize(20)} color="#fff" />
          </TouchableOpacity>

          {/* Icon */}
          <View style={[styles.alertIcon, { backgroundColor: getAlertColor(customAlert.type) + '20' }]}>
            {customAlert.showSpinner ? (
              <ActivityIndicator size="large" color={getAlertColor(customAlert.type)} />
            ) : (
              <Icon
                name={getAlertIcon(customAlert.type)}
                size={getResponsiveSize(40)}
                color={getAlertColor(customAlert.type)}
              />
            )}
          </View>

          {/* Title */}
          <Text style={styles.alertTitle}>{customAlert.title}</Text>

          {/* Message */}
          <Text style={styles.alertMessage}>{customAlert.message}</Text>

          {/* Buttons */}
          {customAlert.buttons.length > 0 && (
            <View style={styles.alertButtons}>
              {customAlert.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.alertButton,
                    button.style === 'primary' && styles.alertButtonPrimary,
                    button.style === 'secondary' && styles.alertButtonSecondary,
                    button.style === 'danger' && styles.alertButtonDanger,
                  ]}
                  onPress={button.onPress}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.alertButtonText,
                      button.style === 'primary' && styles.alertButtonTextPrimary,
                      button.style === 'secondary' && styles.alertButtonTextSecondary,
                      button.style === 'danger' && styles.alertButtonTextDanger,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={handleBackPress} />
        <Text style={styles.headerTitle}>Download Certificate </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent} >
        {/* Congratulations Section */}
        <View style={styles.congratulationsContainer}>
          <Image 
            source={require('../assests/images/conge.png')} 
            style={styles.congratulationsImage}
            resizeMode="contain"
          />
          
          <Text style={styles.congratulationsMessage}>
            You have successfully completed the course!
          </Text>
         
          {/* Dynamic Subcourse Name */}
      
          {certificateData?.subcourseName && (
            <Text style={styles.subcourseNameText}>
              {certificateData.subcourseName}
            </Text>
          )}
        </View>

        {/* Certificate Image */}
        <View style={styles.certificateContainer}>
          <View style={styles.certificateImageWrapper}>
            <Image 
              source={require('../assests/images/DownloadCertificate.png')} 
              style={styles.certificateImage}
              resizeMode="contain"
            />
          </View>
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
          disabled={isDownloading}>
          <LinearGradient
            colors={['#FF8A00', '#FFB300']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>
            <Text style={styles.downloadButtonText}>
              {isDownloading ? 'Downloading...' : 'Download Certificate'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Custom Alert Modal */}
      <CustomAlert />
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
    marginTop: getResponsiveSize(30),
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
  congratulationsMessage: {
    fontSize: getResponsiveSize(18),
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: getResponsiveSize(15),
    lineHeight: getResponsiveSize(24),
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
    marginTop: getResponsiveSize(-40), // Move image up more
    paddingHorizontal: getResponsiveSize(20), // Add left-right padding
  },
  certificateImageWrapper: {
    width: width - getResponsiveSize(40), // Reduce width to account for padding
    height: getResponsiveSize(450),
    borderRadius: getResponsiveSize(15), // Add rounded corners
    overflow: 'hidden', // This is important for rounded corners to work
  },
  certificateImage: {
    width: '100%',
    height: '100%',
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
    borderRadius: getResponsiveSize(20),
    padding: getResponsiveSize(25),
    width: '100%',
    maxWidth: getResponsiveSize(400),
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: getResponsiveSize(10),
    },
    shadowOpacity: 0.25,
    shadowRadius: getResponsiveSize(20),
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: getResponsiveSize(-10),
    right: getResponsiveSize(8),
    width: getResponsiveSize(32),
    height: getResponsiveSize(32),
    borderRadius: getResponsiveSize(16),
    backgroundColor: '#FF8800',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: getResponsiveSize(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: getResponsiveSize(4),
    elevation: 5,
  },
  alertIcon: {
    width: getResponsiveSize(80),
    height: getResponsiveSize(80),
    borderRadius: getResponsiveSize(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSize(20),
  },
  alertTitle: {
    fontSize: getResponsiveSize(22),
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: getResponsiveSize(12),
  },
  alertMessage: {
    fontSize: getResponsiveSize(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: getResponsiveSize(24),
    marginBottom: getResponsiveSize(25),
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: getResponsiveSize(12),
  },
  alertButton: {
    flex: 1,
    paddingVertical: getResponsiveSize(14),
    paddingHorizontal: getResponsiveSize(20),
    borderRadius: getResponsiveSize(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getResponsiveSize(48),
  },
  alertButtonPrimary: {
    backgroundColor: '#2196F3',
  },
  alertButtonSecondary: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  alertButtonDanger: {
    backgroundColor: '#F44336',
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
  alertButtonTextDanger: {
    color: '#fff',
  },
});