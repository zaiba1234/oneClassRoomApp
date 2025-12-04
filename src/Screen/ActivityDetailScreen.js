import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Image,
  Dimensions,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../Component/BackButton';
import LinearGradient from 'react-native-linear-gradient';
import { getApiUrl } from '../API/config';
import { useAppSelector } from '../Redux/hooks';
import { checkApiResponseForTokenError, handleTokenError } from '../utils/tokenErrorHandler';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375;
  return Math.round(size * scale);
};

const ActivityDetailScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { token } = useAppSelector((state) => state.user);
  
  // Get activity ID from route params
  const activityId = route.params?.activityId;

  // State for activity data
  const [activityData, setActivityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch activity details
  const fetchActivityDetails = async () => {
    if (!activityId) {
      setError('Activity ID is missing');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const apiUrl = getApiUrl(`/api/user/activites/get-activity/${activityId}`);
      console.log('📡 [ActivityDetail] Fetching activity details:', apiUrl);

      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });

      const result = await response.json();

      // Check for token errors
      if (checkApiResponseForTokenError({ status: response.status, data: result })) {
        console.log('🔐 [ActivityDetail] Token error detected');
        await handleTokenError(result, true);
        return;
      }

      if (response.ok && result.success) {
        console.log('✅ [ActivityDetail] Activity data fetched:', result.data);
        setActivityData(result.data);
      } else {
        const errorMessage = result.message || 'Failed to fetch activity details';
        console.log('❌ [ActivityDetail] Error:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('❌ [ActivityDetail] Fetch error:', error);
      setError(error.message || 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activityId) {
      fetchActivityDetails();
    } else {
      setError('Activity ID is missing');
      setIsLoading(false);
    }
  }, [activityId]);

  // Handle Get Now button press
  const handleGetNow = async () => {
    if (!activityData?.activityLink || activityData.activityLink === '#') {
      Alert.alert(
        'Coming Soon! 🚀',
        'We are working on adding the activity link. It will be available soon!',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      await Linking.openURL(activityData.activityLink);
    } catch (error) {
      Alert.alert(
        'Oops! 😔',
        'Unable to open the link at the moment. Please try again later.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={[
        styles.header,
        { paddingTop: Platform.OS === 'ios' ? insets.top + getResponsiveSize(10) : StatusBar.currentHeight + getResponsiveSize(0) }
      ]}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>
          {activityData?.activityTitle || 'Activity Details'}
        </Text>
      
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8800" />
          <Text style={styles.loadingText}>Loading activity details...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchActivityDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : activityData ? (
        <>
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Hero Image Banner - Direct on screen, no card */}
            {activityData.activityImage && (
              <View style={styles.bannerWrapper}>
                <View style={styles.bannerContainer}>
                  <Image
                    source={{ uri: activityData.activityImage }}
                    style={styles.heroImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            )}

            {/* Title - Direct on screen */}
            <Text style={styles.mainTitle}>
              {activityData.activityHeading || activityData.activityTitle || 'Activity Title'}
            </Text>

            {/* Description - Direct on screen */}
            {activityData.activityDescription && (
              <Text style={styles.description}>
                {activityData.activityDescription}
              </Text>
            )}

            {/* Spacer for button at bottom */}
            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Get Now Button - Fixed at bottom */}
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={styles.getNowButton}
              onPress={handleGetNow}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF8800', '#FFB800']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.getNowButtonText}>Get Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </SafeAreaView>
  );
};

export default ActivityDetailScreen;

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
    paddingBottom: getResponsiveSize(15),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: getResponsiveSize(18),
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: getResponsiveSize(10),
  },
  placeholder: {
    width: getResponsiveSize(40),
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getResponsiveSize(100),
  },
  bannerWrapper: {
    width: '100%',
    paddingHorizontal: getResponsiveSize(15),
    marginTop: getResponsiveSize(5),
  },
  bannerContainer: {
    width: '100%',
    height: getResponsiveSize(200),
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderRadius: getResponsiveSize(12),
  },
  heroImage: {
    bottom:20,
    width: '100%',
    height: '100%',
  },
  mainTitle: {
    fontSize: getResponsiveSize(24),
    fontWeight: '700',
    color: '#333',
    bottom:20,
    marginHorizontal: getResponsiveSize(20),
    
    lineHeight: getResponsiveSize(30),
  },
  heading: {
    fontSize: getResponsiveSize(20),
    fontWeight: '600',
    color: '#333',
   
    marginHorizontal: getResponsiveSize(20),
   
  },
  description: {
    fontSize: getResponsiveSize(16),
    color: '#666',
    lineHeight: getResponsiveSize(24),
    marginHorizontal: getResponsiveSize(20),
    marginTop: getResponsiveSize(8),
    marginBottom: getResponsiveSize(8),
  },
  bottomSpacer: {
    height: getResponsiveSize(20),
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: getResponsiveSize(20),
    paddingBottom: Platform.OS === 'ios' ? getResponsiveSize(20) : getResponsiveSize(20),
    paddingTop: getResponsiveSize(15),
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  getNowButton: {
    borderRadius: getResponsiveSize(12),
    overflow: 'hidden',
    shadowColor: '#FF8800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    paddingVertical: getResponsiveSize(16),
    paddingHorizontal: getResponsiveSize(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  getNowButtonText: {
    fontSize: getResponsiveSize(18),
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(50),
  },
  loadingText: {
    marginTop: getResponsiveSize(15),
    fontSize: getResponsiveSize(16),
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(50),
    paddingHorizontal: getResponsiveSize(20),
  },
  errorText: {
    fontSize: getResponsiveSize(16),
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: getResponsiveSize(20),
  },
  retryButton: {
    backgroundColor: '#FF8800',
    paddingVertical: getResponsiveSize(12),
    paddingHorizontal: getResponsiveSize(30),
    borderRadius: getResponsiveSize(25),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
  },
});

