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

import { useAppSelector } from '../Redux/hooks';
import { getApiUrl } from '../API/config';
import RNFS from 'react-native-fs'; // Ensure this is imported at the top
import { Buffer } from 'buffer'; // Add Buffer polyfill for React Native
import BackButton from '../Component/BackButton';

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
  const [isEligibleForCertificate, setIsEligibleForCertificate] = useState(true);
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'success', 'error', 'warning'
    buttons: []
  });

  // Get courseId from route params (coming from EnrollScreen)
  const courseId = route.params?.courseId;

  // Custom Alert Component
  const CustomAlert = () => (
    <Modal
      visible={customAlert.visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setCustomAlert(prev => ({ ...prev, visible: false }))}
    >
      <View style={styles.alertOverlay}>
        <View style={styles.alertContainer}>
          <View style={[styles.alertIcon, { backgroundColor: getAlertColor(customAlert.type) }]}>
            <Text style={styles.alertIconText}>
              {getAlertIcon(customAlert.type)}
            </Text>
          </View>
          <Text style={styles.alertTitle}>{customAlert.title}</Text>
          <Text style={styles.alertMessage}>{customAlert.message}</Text>
          <View style={styles.alertButtons}>
            {customAlert.buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.alertButton,
                  button.style === 'primary' && styles.alertButtonPrimary,
                  button.style === 'secondary' && styles.alertButtonSecondary
                ]}
                onPress={() => {
                  setCustomAlert(prev => ({ ...prev, visible: false }));
                  if (button.onPress) {
                    try {
                      button.onPress();
                    } catch (error) {
                      // Optionally, you can use a custom alert or logging mechanism here
                      setCustomAlert({
                        visible: true,
                        title: 'Error',
                        message: 'An error occurred while handling the alert button.',
                        type: 'error',
                        buttons: [{ text: 'OK', style: 'primary' }]
                      });
                    }
                  }
                }}
              >
                <Text style={[
                  styles.alertButtonText,
                  button.style === 'primary' && styles.alertButtonTextPrimary,
                  button.style === 'secondary' && styles.alertButtonTextSecondary
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

 
  const getAlertColor = (type) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      default: return '#2196F3';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  // Safe alert function
  const showCustomAlert = useCallback((title, message, type = 'info', buttons = []) => {
    try {
      setCustomAlert({
        visible: true,
        title: title || 'Alert',
        message: message || '',
        type,
        buttons: buttons.length > 0 ? buttons : [{ text: 'OK', style: 'primary' }]
      });
    } catch (error) {
      setCustomAlert({
        visible: true,
        title: title || 'Alert',
        message: message || '',
        type,
        buttons: buttons.length > 0 ? buttons : [{ text: 'OK', style: 'primary' }]
      });
    }
  }, []);

  // Function to check current permission status
  const checkCurrentPermissions = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return null;
    }

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
    
      return null;
    }
  }, []);

  // Function to test if we can actually write to downloads directory
  const testDownloadsAccess = useCallback(async () => {
    try {
      if (!RNFS?.DownloadDirectoryPath) {
        return false;
      }

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
  }, []);

  // Function to request storage permissions
  const requestStoragePermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need this permission
    }

    try {
      let granted = false;

      if (Platform.Version >= 33) {
        // First check if permissions are already granted
        const hasImages = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
        const hasVideo = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
        if (hasImages && hasVideo) {
          return true;
        }

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
          showCustomAlert(
            'Permission Required',
            'This app needs media access permissions to download certificates. Please:\n\n1. Go to Settings > Apps > LearningSaint > Permissions\n2. Enable "Photos and videos" permission\n3. Try downloading again',
            'warning',
            [
              { text: 'OK', style: 'secondary' },
              {
                text: 'Open Settings',
                style: 'primary',
                onPress: () => {
                  try {
                    Linking.openSettings();
                  } catch (error) {
                   null
                  }
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

      if (!granted) {
        showCustomAlert(
          'Permission Denied',
          'Storage permission is required to download certificates. Please grant permission and try again.',
          'error',
          [
            { text: 'OK', style: 'secondary' },
            {
              text: 'Open Settings',
              style: 'primary',
              onPress: () => {
                try {
                  Linking.openSettings();
                } catch (error) {
                  null
                }
              }
            }
          ]
        );
      }

      return granted;
    } catch (error) {
     
      showCustomAlert(
        'Permission Error',
        'An error occurred while requesting permissions. Please try again.',
        'error',
        [{ text: 'OK', style: 'primary' }]
      );
      return false;
    }
  }, [showCustomAlert]);

  // Fetch certificate description data when component mounts
  React.useEffect(() => {
    if (courseId && token) {
      fetchCertificateDescription();
    }
  }, [courseId, token]);

  // Function to fetch certificate description from API
  const fetchCertificateDescription = useCallback(async () => {
    if (!courseId || !token) {
     
      return;
    }

    try {
      setIsLoadingCertificate(true);

      const apiUrl = getApiUrl(`/api/user/course/get-certificateDesc/${courseId}`);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();

        if (result?.success && result?.data) {
          setCertificateData(result.data);
          setIsEligibleForCertificate(true);
        } else {
          // Check if it's a completion/enrollment issue
          if (result?.message?.includes('not completed or not enrolled')) {
            setIsEligibleForCertificate(false);
            showCustomAlert(
              'Certificate Not Available',
              'You need to complete the course first before downloading the certificate. Please finish all lessons and then try again.',
              'warning',
              [
                { text: 'OK', style: 'secondary' },
                {
                  text: 'Go to Course',
                  style: 'primary',
                  onPress: () => {
                    try {
                      navigation.navigate('Enroll', { courseId: courseId });
                    } catch (error) {
                      null
                    }
                  }
                }
              ]
            );
          } else {
            setIsEligibleForCertificate(false);
            showCustomAlert(
              'Error',
              result?.message || 'Failed to fetch certificate details',
              'error',
              [{ text: 'OK', style: 'primary' }]
            );
          }
        }
      } else {
        const errorResult = await response.json().catch(() => ({}));

        if (response.status === 401) {
          showCustomAlert(
            'Authentication Error',
            'Please login again to access certificate details',
            'error',
            [{ text: 'OK', style: 'primary' }]
          );
        } else if (response.status === 404) {
          showCustomAlert(
            'Certificate Not Found',
            'Certificate for this course is not available yet',
            'warning',
            [{ text: 'OK', style: 'primary' }]
          );
        } else {
          showCustomAlert(
            'Error',
            errorResult?.message || 'Failed to fetch certificate details',
            'error',
            [{ text: 'OK', style: 'primary' }]
          );
        }
      }
    } catch (error) {
      
      showCustomAlert(
        'Error',
        'Failed to fetch certificate details. Please check your internet connection and try again.',
        'error',
        [{ text: 'OK', style: 'primary' }]
      );
    } finally {
      setIsLoadingCertificate(false);
    }
  }, [courseId, token, navigation, showCustomAlert]);

  const handleDownload = useCallback(async () => {
    try {
      if (!courseId) {
        showCustomAlert(
          'Error',
          'Course ID not found. Please try again.',
          'error',
          [{ text: 'OK', style: 'primary' }]
        );
        return;
      }

      if (!isEligibleForCertificate) {
        showCustomAlert(
          'Certificate Not Available',
          'You need to complete the course first before downloading the certificate. Please finish all lessons and then try again.',
          'warning',
          [
            { text: 'OK', style: 'secondary' },
            {
              text: 'Go to Course',
              style: 'primary',
              onPress: () => {
                try {
                  navigation.navigate('Enroll', { courseId: courseId });
                } catch (error) {
                  showCustomAlert(
                    'Navigation Error',
                    error?.message || 'An error occurred while navigating to the course.',
                    'error',
                    [{ text: 'OK', style: 'primary' }]
                  );
                }
              }
            }
          ]
        );
        return;
      }

      // Request storage permission first
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        return;
      }

      setIsDownloading(true);
      const fileName = `certificate_${courseId}.pdf`;

      try {

        // API endpoint using config file with subcourseId in URL
        const apiUrl = getApiUrl(`/api/user/certificate/download-certificate/${courseId}`);

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
            // Try multiple download locations in order of preference
            let filePath = null;
            let locationMessage = '';

            // First try: External Downloads directory (most accessible)
            if (RNFS.DownloadDirectoryPath) {
              try {
                filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
                await RNFS.writeFile(filePath, base64Data, 'base64');
                const fileExists = await RNFS.exists(filePath);
                if (fileExists) {
                  locationMessage = 'Downloads folder (accessible via file manager)';
                } else {
                  filePath = null;
                }
              } catch (error) {
                filePath = null;
              }
            }

            // Second try: External Storage Downloads
            if (!filePath && RNFS.ExternalDirectoryPath) {
              try {
                filePath = `${RNFS.ExternalDirectoryPath}/Download/${fileName}`;
                const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
                const dirExists = await RNFS.exists(dirPath);
                if (!dirExists) {
                  await RNFS.mkdir(dirPath);
                }
                await RNFS.writeFile(filePath, base64Data, 'base64');
                const fileExists = await RNFS.exists(filePath);
                if (fileExists) {
                  locationMessage = 'External Storage/Download folder';
                } else {
                  filePath = null;
                }
              } catch (error) {
                filePath = null;
              }
            }

            // Third try: Documents directory
            if (!filePath && RNFS.DocumentDirectoryPath) {
              try {
                filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
                await RNFS.writeFile(filePath, base64Data, 'base64');
                const fileExists = await RNFS.exists(filePath);
                if (fileExists) {
                  locationMessage = 'Documents folder';
                } else {
                  filePath = null;
                }
              } catch (error) {
                filePath = null;
              }
            }

            if (filePath) {
              // Get file info
              const fileStats = await RNFS.stat(filePath);

              // Show success message with file location
              showCustomAlert(
                'Download Complete! 🎉',
                `Certificate saved as ${fileName}\nLocation: ${locationMessage}\n\nFile path: ${filePath}`,
                'success',
                [
                  { text: 'OK', style: 'primary' },
                  {
                    text: 'Open PDF',
                    style: 'secondary',
                    onPress: async () => {
                      try {
                        await Linking.openURL(`file://${filePath}`);
                      } catch (openError) {
                       
                        showCustomAlert(
                          'PDF Location',
                          `PDF saved to:\n${filePath}\n\nUse your file manager to open it.`,
                          'info',
                          [{ text: 'OK', style: 'primary' }]
                        );
                      }
                    }
                  }
                ]
              );
            } else {
              throw new Error('Could not save file to any accessible location');
            }
          } catch (writeError) {
           

            // Final fallback: try to save to app's cache directory
            try {
              const fallbackFileName = `certificate_${courseId}.pdf`;
              const fallbackFilePath = `${RNFS.CachesDirectoryPath}/${fallbackFileName}`;
              await RNFS.writeFile(fallbackFilePath, base64Data, 'base64');

              // Check if fallback file was created
              const fallbackExists = await RNFS.exists(fallbackFilePath);
              if (fallbackExists) {
                showCustomAlert(
                  'Download Complete! 🎉',
                  `Certificate saved as ${fallbackFileName}\nLocation: App Cache folder\n\nFile path: ${fallbackFilePath}\n\nNote: This file may not be easily accessible via file manager.`,
                  'success',
                  [
                    { text: 'OK', style: 'primary' },
                    {
                      text: 'Open PDF',
                      style: 'secondary',
                      onPress: async () => {
                        try {
                          await Linking.openURL(`file://${fallbackFilePath}`);
                        } catch (openError) {
                          showCustomAlert(
                            'PDF Location',
                            `PDF saved to:\n${fallbackFilePath}\n\nUse your file manager to open it.`,
                            'info',
                            [{ text: 'OK', style: 'primary' }]
                          );
                        }
                      }
                    }
                  ]
                );
              } else {
                throw new Error('Fallback file creation failed');
              }
            } catch (finalFallbackError) {
              showCustomAlert(
                'Download Failed',
                'Could not save PDF to any accessible location. Please check your storage permissions and try again.\n\nTroubleshooting:\n1. Check if you have enough storage space\n2. Grant storage permissions to the app\n3. Try restarting the app',
                'error',
                [
                  { text: 'OK', style: 'primary' },
                  {
                    text: 'Check Permissions',
                    style: 'secondary',
                    onPress: async () => {
                      try {
                        await checkCurrentPermissions();
                      } catch (error) {
                        showCustomAlert(
                          'Permission Error',
                          `Error checking permissions: ${error?.message || 'Unknown error'}`,
                          'error',
                          [{ text: 'OK', style: 'primary' }]
                        );
                      }
                    }
                  }
                ]
              );
            }
          }

        } else {
          const errorText = await response.text();

          // Try to parse error response as JSON
          let errorResult = {};
          try {
            errorResult = JSON.parse(errorText);
          } catch (parseError) {
            showCustomAlert(
              'Error',
              `Could not parse error response as JSON: ${parseError?.message || 'Unknown error'}`,
              'error',
              [{ text: 'OK', style: 'primary' }]
            );
          }

          if (response.status === 401) {
            showCustomAlert(
              'Authentication Error',
              'Please login again to download certificate',
              'error',
              [{ text: 'OK', style: 'primary' }]
            );
          } else if (response.status === 404) {
            showCustomAlert(
              'Certificate Not Found',
              'Certificate for this course is not available yet',
              'warning',
              [{ text: 'OK', style: 'primary' }]
            );
          } else if (errorResult?.message?.includes('not completed or not enrolled')) {
            showCustomAlert(
              'Certificate Not Available',
              'You need to complete the course first before downloading the certificate. Please finish all lessons and then try again.',
              'warning',
              [
                { text: 'OK', style: 'secondary' },
                {
                  text: 'Go to Course',
                  style: 'primary',
                  onPress: () => {
                    try {
                      navigation.navigate('Enroll', { courseId: courseId });
                    } catch (error) {
                      showCustomAlert(
                        'Navigation Error',
                        `Could not navigate to the course: ${error?.message || 'Unknown error'}`,
                        'error',
                        [{ text: 'OK', style: 'primary' }]
                      );
                    }
                  }
                }
              ]
            );
          } else {
            showCustomAlert(
              'Download Failed',
              errorResult?.message || `Error: ${response.status} - ${response.statusText}`,
              'error',
              [{ text: 'OK', style: 'primary' }]
            );
          }
        }
      } catch (error) {
        

        showCustomAlert(
          'Error',
          'Something went wrong while downloading. Please check your internet connection and try again.',
          'error',
          [{ text: 'OK', style: 'primary' }]
        );
      } finally {
        setIsDownloading(false);
      }
    } catch (error) {
    
      showCustomAlert(
        'Error',
        'An unexpected error occurred. Please try again.',
        'error',
        [{ text: 'OK', style: 'primary' }]
      );
    } finally {
      setIsDownloading(false);
    }
  }, [courseId, isEligibleForCertificate, requestStoragePermission, showCustomAlert, navigation, checkCurrentPermissions]);

  const handleBackPress = useCallback(() => {
    try {
      navigation.goBack();
    } catch (error) {
      showCustomAlert(
        'Navigation Error',
        error?.message || 'An error occurred while navigating back.',
        'error',
        [{ text: 'OK', style: 'primary' }]
      );
    }
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <CustomAlert />

      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={handleBackPress} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Congratulations Section */}
        <View style={styles.congratulationsContainer}>
          <Image
            source={require('../assests/images/conge.png')}
            style={styles.congratulationsImage}
            resizeMode="contain"
          />
          <Text style={styles.congratulationsSubtext}>For Completing Module</Text>
         
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
            (isDownloading || !isEligibleForCertificate) && styles.downloadButtonDisabled
          ]}
          onPress={handleDownload}
          disabled={isDownloading || !isEligibleForCertificate}
        >
          <LinearGradient
            colors={['#FFB300','#FF8A00']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.downloadButtonText}>
              {isDownloading ? 'Downloading...' :
                !isEligibleForCertificate ? 'Complete Course First' :
                  'Download Certificate'}
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
    width: getResponsiveSize(280),
    height: getResponsiveSize(120),
    marginBottom: getResponsiveSize(10),
  },
  congratulationsSubtext: {
    fontSize: getResponsiveSize(16),
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: getResponsiveSize(-20),
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
    paddingHorizontal: getResponsiveSize(20),
    marginTop: getResponsiveSize(-50),
    marginBottom: getResponsiveSize(5),
  },
  certificateImage: {
    width: '100%',
    height: getResponsiveSize(400),
    borderRadius: getResponsiveSize(50),
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
    // paddingTop: getResponsiveSize(-40),
    paddingBottom: getResponsiveSize(60),
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
  downloadStatusButton: {
    marginTop: getResponsiveSize(15),
    paddingVertical: getResponsiveSize(12),
    paddingHorizontal: getResponsiveSize(20),
    borderRadius: getResponsiveSize(8),
    borderWidth: 1,
    borderColor: '#FF8A00',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  downloadStatusButtonText: {
    color: '#FF8A00',
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
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
    alignItems: 'center',
    minWidth: getResponsiveSize(280),
    maxWidth: getResponsiveSize(320),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  alertIcon: {
    width: getResponsiveSize(60),
    height: getResponsiveSize(60),
    borderRadius: getResponsiveSize(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSize(16),
  },
  alertIconText: {
    fontSize: getResponsiveSize(30),
    color: '#fff',
    fontWeight: 'bold',
  },
  alertTitle: {
    fontSize: getResponsiveSize(20),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: getResponsiveSize(12),
  },
  alertMessage: {
    fontSize: getResponsiveSize(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: getResponsiveSize(22),
    marginBottom: getResponsiveSize(24),
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
    paddingHorizontal: getResponsiveSize(16),
    borderRadius: getResponsiveSize(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonPrimary: {
    backgroundColor: '#FF8A00',
  },
  alertButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF8A00',
  },
  alertButtonText: {
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
  },
  alertButtonTextPrimary: {
    color: '#fff',
  },
  alertButtonTextSecondary: {
    color: '#FF8A00',
  },
}); 