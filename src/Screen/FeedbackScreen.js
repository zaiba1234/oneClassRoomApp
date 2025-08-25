import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { courseAPI } from '../API/courseAPI';
import { useAppSelector } from '../Redux/hooks';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const FeedbackScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [rating, setRating] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get subcourseId from route params
  const subcourseId = route.params?.subcourseId;
  
  // Get token from Redux
  const { token } = useAppSelector((state) => state.user);

  // Debug logging
  console.log('🔍 FeedbackScreen: Route params received:', route.params);
  console.log('🔍 FeedbackScreen: subcourseId:', subcourseId);
  console.log('🔍 FeedbackScreen: token available:', !!token);

  const handleStarPress = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleContinue = async () => {
    try {
      console.log('🚀 FeedbackScreen: Continue button pressed with rating:', rating);
      console.log('🆔 FeedbackScreen: Subcourse ID:', subcourseId);
      console.log('🔍 FeedbackScreen: Route params full:', JSON.stringify(route.params, null, 2));
      
      // Try to get subcourseId from different sources
      let finalSubcourseId = subcourseId;
      
      if (!finalSubcourseId) {
        console.log('⚠️ FeedbackScreen: subcourseId is undefined, trying to get from navigation state...');
        // Try to get from navigation state or go back to get the ID
        Alert.alert(
          'Missing Course ID',
          'Course information not found. Please go back and try again.',
          [
            {
              text: 'Go Back',
              onPress: () => navigation.goBack()
            }
          ]
        );
        return;
      }
      
      if (!token) {
        console.log('❌ FeedbackScreen: No token available');
        Alert.alert('Error', 'Please login again to submit rating.');
        return;
      }
      
      setIsSubmitting(true);
      
      // Call the rating API
      console.log('📡 FeedbackScreen: Calling submitRating API...');
      console.log('📡 FeedbackScreen: API call details:');
      console.log('  - Token:', token ? token.substring(0, 30) + '...' : 'No token');
      console.log('  - SubcourseId:', finalSubcourseId);
      console.log('  - Rating:', rating);
      
      const result = await courseAPI.submitRating(token, finalSubcourseId, rating);
      
      console.log('📡 FeedbackScreen: API response:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data.success) {
        console.log('✅ FeedbackScreen: Rating submitted successfully!');
        Alert.alert(
          'Success! 🎉',
          'Thank you for your feedback!',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate back to EnrollScreen with completed flag
                console.log('🚀 FeedbackScreen: Navigating back to EnrollScreen with completed flag...');
                navigation.navigate('Enroll', { 
                  courseId: finalSubcourseId,
                  isCompleted: true, // Pass completed flag
                  fromFeedback: true // Indicate coming from feedback
                });
              }
            }
          ]
        );
      } else {
        console.log('❌ FeedbackScreen: Failed to submit rating:', result.data?.message);
        Alert.alert('Error', result.data?.message || 'Failed to submit rating. Please try again.');
      }
      
    } catch (error) {
      console.error('💥 FeedbackScreen: Error submitting rating:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    console.log('⏭️ FeedbackScreen: Skip button pressed');
    // Navigate back to EnrollScreen with completed flag (even when skipping)
    navigation.navigate('Enroll', { 
      courseId: subcourseId,
      isCompleted: true, // Pass completed flag
      fromFeedback: true // Indicate coming from feedback
    });
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            style={styles.starButton}
            onPress={() => handleStarPress(star)}
          >
            <Icon
              name={star <= rating ? "star" : "star-outline"}
              size={getResponsiveSize(28)}
              color={star <= rating ? "#FF8800" : "#FF8800"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Skip Button */}
      <View style={styles.skipButtonContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Top Section - White Background */}
      <View style={styles.topSection}>
        {/* Top Illustration */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={require('../assests/images/Experience.png')} 
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.subtitle}>Give us a shout!</Text>
          <Text style={styles.title}>Your Experience</Text>
        </View>
      </View>

      {/* Bottom Section - Linear Gradient Background */}
      <LinearGradient
        colors={['#FFFFFF', '#FF8800']}
        style={styles.gradientSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Star Rating */}
        <View style={styles.ratingContainer}>
          {renderStars()}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, isSubmitting && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={isSubmitting}
          >
            <Text style={styles.continueButtonText}>
              {isSubmitting ? 'Submitting...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

export default FeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButtonContainer: {
    position: 'absolute',
    top: getResponsiveSize(60),
    right: getResponsiveSize(20),
    zIndex: 10,
  },
  skipButtonText: {
    color: '#FF8800',
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
  },
  topSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: getResponsiveSize(100),
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientSection: {
    flex: 1,
    paddingTop: getResponsiveSize(100),
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsiveSize(40),
    paddingHorizontal: getResponsiveSize(20),
  },
  illustration: {
    width: getResponsiveSize(280),
    height: getResponsiveSize(220),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSize(40),
    paddingHorizontal: getResponsiveSize(20),
  },
  subtitle: {
    fontSize: getResponsiveSize(14),
    color: '#000000',
    marginBottom: getResponsiveSize(8),
    textAlign: 'center',
    fontWeight: '400',
  },
  title: {
    fontSize: getResponsiveSize(24),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSize(60),
    paddingHorizontal: getResponsiveSize(20),
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsiveSize(8),
  },
  starButton: {
    padding: getResponsiveSize(4),
  },
  buttonContainer: {
    marginTop: '5%',
    paddingHorizontal: getResponsiveSize(20),
    paddingVertical: getResponsiveSize(40),
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: getResponsiveSize(16),
    paddingVertical: getResponsiveSize(18),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    color: '#FF8800',
    fontSize: getResponsiveSize(18),
    fontWeight: 'bold',
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    borderRadius: getResponsiveSize(16),
    paddingVertical: getResponsiveSize(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
});