import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';

// Import local assets
const ArrowIcon = require('../assests/images/Arrow.png');
const DefaultAvatar = require('../assests/images/John.png');

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

// Responsive scaling factors
const scale = width / 375; // Base width for iPhone 8
const verticalScale = height / 812; // Base height for iPhone 8

// Responsive font sizes
const getFontSize = (size) => size * scale;
const getVerticalSize = (size) => size * verticalScale;

const ReviewScreen = ({ navigation, route }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get user data from Redux
  const { token } = useAppSelector((state) => state.user);
  
  // Get subcourseId from route params
  const subcourseId = route.params?.subcourseId;

  // Fetch ratings when component mounts
  useEffect(() => {
   
    
    if (subcourseId && token) {
      fetchRatings();
    } else {
      console.log('❌ ReviewScreen: Missing required data - subcourseId:', subcourseId, 'token:', !!token);
      setError('Missing subcourse ID or authentication token');
      setIsLoading(false);
    }
  }, [subcourseId, token]);

  const fetchRatings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 ReviewScreen: Fetching ratings for subcourseId:', subcourseId);
      console.log('🔑 ReviewScreen: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      
      const result = await courseAPI.getSubcourseRatings(token, subcourseId);
      
      console.log('📡 ReviewScreen: API result:', result);
      
      // Handle different response structures
      if (result.success) {
        if (result.data && result.data.success) {
          // Standard success response
          console.log('✅ ReviewScreen: Ratings fetched successfully:', result.data.data);
          if (Array.isArray(result.data.data)) {
            setReviews(result.data.data);
          } else {
            console.log('⚠️ ReviewScreen: Ratings data is not an array:', result.data.data);
            setReviews([]);
          }
        } else if (result.data && Array.isArray(result.data)) {
          // Direct array response
          console.log('✅ ReviewScreen: Ratings fetched successfully (direct array):', result.data);
          setReviews(result.data);
        } else if (result.data && result.data.data && Array.isArray(result.data.data)) {
          // Nested data array response
          console.log('✅ ReviewScreen: Ratings fetched successfully (nested data):', result.data.data);
          setReviews(result.data.data);
        } else {
          console.log('❌ ReviewScreen: Unexpected response structure:', result.data);
          setError('Unexpected response format from server');
        }
      } else {
        console.log('❌ ReviewScreen: Failed to fetch ratings:', result.data?.message);
        console.log('❌ ReviewScreen: Full result:', result);
        setError(result.data?.message || 'Failed to fetch ratings');
      }
    } catch (error) {
      console.error('💥 ReviewScreen: Error fetching ratings:', error);
      setError(error.message || 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Text key={`full-${i}`} style={styles.starIcon}>
          ⭐
        </Text>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <Text key="half" style={styles.starIcon}>
          ⭐
        </Text>
      );
    }

    // Empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Text key={`empty-${i}`} style={styles.emptyStarIcon}>
          ⭐
        </Text>
      );
    }

    return stars;
  };

  const handleReviewPress = (review) => {
    console.log('Review clicked:', review.fullName);
    // Navigate to review detail screen if needed
    // navigation.navigate('ReviewDetail', { review });
  };

  const renderReviewItem = (review) => (
    <TouchableOpacity
      key={review.userId}
      style={styles.reviewItem}
      onPress={() => handleReviewPress(review)}
    >
      <Image 
        source={review.profileImageUrl ? { uri: review.profileImageUrl } : DefaultAvatar} 
        style={styles.reviewAvatar} 
      />
      <View style={styles.reviewContent}>
        <View style={styles.nameAndStarsRow}>
          <Text style={styles.reviewName}>{review.fullName || 'Anonymous'}</Text>
          <View style={styles.starContainer}>
            {renderStars(review.rating)}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRatings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (reviews.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No reviews available yet</Text>
          <Text style={styles.emptySubText}>Be the first to review this course!</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchRatings}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollViewContent}
      >
        {reviews.map(renderReviewItem)}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={ArrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getVerticalSize(20),
    paddingTop: Platform.OS === 'ios' ? getVerticalSize(10) : getVerticalSize(20),
    paddingBottom: getVerticalSize(15),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: getVerticalSize(8),
  },
  backIcon: {
    width: getFontSize(24),
    height: getFontSize(24),
    resizeMode: 'contain',
  },
  headerTitle: {
    marginTop:20,
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  placeholder: {
    width: getFontSize(40),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getVerticalSize(20),
  },
  loadingText: {
    fontSize: getFontSize(16),
    color: '#666666',
    marginTop: getVerticalSize(10),
  },
  errorText: {
    fontSize: getFontSize(16),
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: getVerticalSize(20),
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: getVerticalSize(12),
    paddingHorizontal: getVerticalSize(25),
    borderRadius: getFontSize(25),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(16),
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: getFontSize(18),
    color: '#666666',
    textAlign: 'center',
    marginBottom: getVerticalSize(10),
  },
  emptySubText: {
    fontSize: getFontSize(14),
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: getVerticalSize(20),
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: getFontSize(15),
    padding: getVerticalSize(15),
    marginBottom: getVerticalSize(10),
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewAvatar: {
    width: getFontSize(50),
    height: getFontSize(50),
    borderRadius: getFontSize(25),
    marginRight: getVerticalSize(15),
  },
  reviewContent: {
    flex: 1,
  },
  nameAndStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewName: {
    fontSize: getFontSize(16),
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: getFontSize(16),
    color: '#FFD700',
    marginLeft: getVerticalSize(2),
  },
  emptyStarIcon: {
    fontSize: getFontSize(16),
    color: '#D3D3D3',
    marginLeft: getVerticalSize(2),
  },
  refreshButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: getVerticalSize(12),
    paddingHorizontal: getVerticalSize(25),
    borderRadius: getFontSize(25),
    marginTop: getVerticalSize(20),
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(16),
    fontWeight: 'bold',
  },
});

export default ReviewScreen;