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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../Redux/hooks';
import { getApiUrl } from '../API/config';

const { width, height } = Dimensions.get('window');1

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

  // Get courseId from route params (coming from EnrollScreen)
  const courseId = route.params?.courseId;

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
      console.log('📚 DownloadCertificateScreen: Fetching certificate description for courseId:', courseId);
      
      const apiUrl = getApiUrl(`/api/user/course/get-certificateDesc/${courseId}`);
      console.log('🌐 DownloadCertificateScreen: API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ DownloadCertificateScreen: Certificate description fetched successfully:', result);
        
        if (result.success && result.data) {
          setCertificateData(result.data);
        }
      } else {
        console.log('❌ DownloadCertificateScreen: Failed to fetch certificate description:', response.status);
      }
    } catch (error) {
      console.error('💥 DownloadCertificateScreen: Error fetching certificate description:', error);
    } finally {
      setIsLoadingCertificate(false);
    }
  };

  const handleDownload = async () => {
    try {
      if (!courseId) {
        console.log(' No courseId received from EnrollScreen');
        return;
      }

      console.log(' Download button pressed for courseId:', courseId);
      setIsDownloading(true);

      // API endpoint using config file with subcourseId in URL
      const apiUrl = getApiUrl(`/api/user/certificate/download-certificate/${courseId}`);
      
      console.log(' API URL:', apiUrl);
      
      // Make the API call with GET method
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        console.log('✅ Certificate download successful');
        console.log('🎉 SUCCESS: Certificate downloaded successfully! 🎉');
        
        // For React Native, we'll handle the response based on content type
        const contentType = response.headers.get('content-type');
        console.log('📄 Content Type:', contentType);
        
        if (contentType && contentType.includes('application/pdf')) {
          // Handle PDF download
          const blob = await response.blob();
          console.log('📥 PDF certificate received, size:', blob.size);
          
          // Success message for PDF
          console.log('🎯 PDF Certificate Downloaded Successfully!');
          console.log('📊 File Size:', blob.size, 'bytes');
          console.log('📱 Ready for React Native file handling');
        } else {
          // Handle other content types
          const text = await response.text();
          console.log('📄 Response text:', text.substring(0, 100) + '...');
          console.log('📋 Non-PDF Certificate Downloaded Successfully!');
        }
        
        // Final success message
        console.log('🏆 CERTIFICATE DOWNLOAD COMPLETED SUCCESSFULLY! 🏆');
        console.log('🎓 User can now access their course completion certificate');
        
        // Show success alert to user
        Alert.alert(
          'Success!',
          'Certificate downloaded successfully!',
          [{ text: 'OK' }]
        );
        
        // Navigate to BadgeCourseScreen after successful download
        console.log('🚀 Navigating to BadgeCourseScreen after successful download');
        // navigation.navigate('BadgeCourse');
        
      } else {
        console.log('❌ Certificate download failed:', response.status, response.statusText);
        console.log('💥 ERROR: Failed to download certificate');
      }
    } catch (error) {
      console.error('💥 Error downloading certificate:', error);
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
              {isDownloading ? 'Downloading...' : 'Download'}
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