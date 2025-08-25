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
          <Text style={styles.downloadText}>Download Internship letter</Text>
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
              {isRequesting ? 'Requesting...' : 'Download for ₹99/-'}
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
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: getResponsiveSize(20),
  },
  congratulationsContainer: {
    alignItems: 'center',
    paddingTop: getResponsiveSize(30),
    paddingBottom: getResponsiveSize(20),
  },
  congratulationsText: {
    fontSize: getResponsiveSize(32),
    fontWeight: 'bold',
    color: '#2285FA',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: getResponsiveSize(8),
  },
  downloadText: {
    fontSize: getResponsiveSize(16),
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  certificateContainer: {
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(20),
    marginBottom: getResponsiveSize(25),
  },
  certificateImage: {
    width: width - getResponsiveSize(40),
    height: getResponsiveSize(400),
    borderRadius: getResponsiveSize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  descriptionContainer: {
    paddingHorizontal: getResponsiveSize(20),
    marginBottom: getResponsiveSize(20),
  },
  descriptionText: {
    fontSize: getResponsiveSize(16),
    color: '#333',
    lineHeight: getResponsiveSize(24),
    textAlign: 'left',
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