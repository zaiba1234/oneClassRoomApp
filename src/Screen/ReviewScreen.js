import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
} from 'react-native';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';
import BackButton from '../Component/BackButton';
import Icon from 'react-native-vector-icons/Ionicons';

// Import local assets
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
  
  // Custom alert state
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // info, success, error, warning, loading
    buttons: [],
    showSpinner: false,
  });
  
  // Get user data from Redux
  const { token } = useAppSelector((state) => state.user);
  
  // Get subcourseId from route params
  const subcourseId = route.params?.subcourseId;

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

  // Fetch ratings when component mounts
  useEffect(() => {
   
    
    if (subcourseId && token) {
      fetchRatings();
    } else {
      setError('Missing subcourse ID or authentication token');
      setIsLoading(false);
    }
  }, [subcourseId, token]);

  const fetchRatings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      
      const result = await courseAPI.getSubcourseRatings(token, subcourseId);
      
      
      // Handle different response structures
      if (result.success) {
        if (result.data && result.data.success) {
          // Standard success response
          if (Array.isArray(result.data.data)) {
            setReviews(result.data.data);
            // Show success message for loaded reviews
            if (result.data.data.length > 0) {
              showCustomAlert(
                'Reviews Loaded',
                `Successfully loaded ${result.data.data.length} review${result.data.data.length === 1 ? '' : 's'}!`,
                'success',
                [
                  {
                    text: 'Great!',
                    onPress: hideCustomAlert,
                    style: 'primary',
                  },
                ]
              );
            }
          } else {
            setReviews([]);
          }
        } else if (result.data && Array.isArray(result.data)) {
          // Direct array response
          setReviews(result.data);
        } else if (result.data && result.data.data && Array.isArray(result.data.data)) {
          // Nested data array response
          setReviews(result.data.data);
        } else {
          setError('Unexpected response format from server');
        }
      } else {
        setError(result.data?.message || 'Failed to fetch ratings');
      }
    } catch (error) {
      console.error('💥 ReviewScreen: Error fetching ratings:', error);
      setError(error.message || 'Network error occurred');
      showCustomAlert(
        'Error',
        error.message || 'Network error occurred. Please check your connection and try again.',
        'error',
        [
          {
            text: 'Retry',
            onPress: () => {
              hideCustomAlert();
              fetchRatings();
            },
            style: 'primary',
          },
          {
            text: 'Cancel',
            onPress: hideCustomAlert,
            style: 'secondary',
          },
        ]
      );
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

    // Empty stars - use empty star emoji
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Text key={`empty-${i}`} style={styles.emptyStarIcon}>
          ☆
        </Text>
      );
    }

    return stars;
  };

  const handleReviewPress = (review) => {
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
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              showCustomAlert(
                'Retry',
                'Would you like to try loading reviews again?',
                'info',
                [
                  {
                    text: 'Yes, Retry',
                    onPress: () => {
                      hideCustomAlert();
                      fetchRatings();
                    },
                    style: 'primary',
                  },
                  {
                    text: 'Cancel',
                    onPress: hideCustomAlert,
                    style: 'secondary',
                  },
                ]
              );
            }}
          >
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
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={() => {
              showCustomAlert(
                'Refresh Reviews',
                'Would you like to refresh and check for new reviews?',
                'info',
                [
                  {
                    text: 'Yes, Refresh',
                    onPress: () => {
                      hideCustomAlert();
                      fetchRatings();
                    },
                    style: 'primary',
                  },
                  {
                    text: 'Cancel',
                    onPress: hideCustomAlert,
                    style: 'secondary',
                  },
                ]
              );
            }}
          >
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
            <Icon name="close" size={getFontSize(20)} color="#fff" />
          </TouchableOpacity>

          {/* Icon */}
          <View style={[styles.alertIcon, { backgroundColor: getAlertColor(customAlert.type) + '20' }]}>
            {customAlert.showSpinner ? (
              <ActivityIndicator size="large" color={getAlertColor(customAlert.type)} />
            ) : (
              <Icon
                name={getAlertIcon(customAlert.type)}
                size={getFontSize(40)}
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      {renderContent()}

      {/* Custom Alert Modal */}
      <CustomAlert />
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
    paddingTop: Platform.OS === 'ios' ? getVerticalSize(50) : getVerticalSize(40),
    paddingBottom: getVerticalSize(15),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  headerTitle: {
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    flex: 1,
    marginTop: getVerticalSize(5),
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

  // Custom Alert Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getVerticalSize(20),
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: getFontSize(20),
    padding: getVerticalSize(25),
    width: '100%',
    maxWidth: getFontSize(400),
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: getVerticalSize(10),
    },
    shadowOpacity: 0.25,
    shadowRadius: getFontSize(20),
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: getVerticalSize(-10),
    right: getFontSize(8),
    width: getFontSize(32),
    height: getFontSize(32),
    borderRadius: getFontSize(16),
    backgroundColor: '#FF8800',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: getVerticalSize(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: getFontSize(4),
    elevation: 5,
  },
  alertIcon: {
    width: getFontSize(80),
    height: getFontSize(80),
    borderRadius: getFontSize(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getVerticalSize(20),
  },
  alertTitle: {
    fontSize: getFontSize(22),
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: getVerticalSize(12),
  },
  alertMessage: {
    fontSize: getFontSize(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: getFontSize(24),
    marginBottom: getVerticalSize(25),
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: getFontSize(12),
  },
  alertButton: {
    flex: 1,
    paddingVertical: getVerticalSize(14),
    paddingHorizontal: getFontSize(20),
    borderRadius: getFontSize(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getFontSize(48),
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
    fontSize: getFontSize(16),
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

export default ReviewScreen;