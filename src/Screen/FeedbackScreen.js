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
import BackButton from '../Component/BackButton';
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
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get subcourseId from route params
  const subcourseId = route.params?.subcourseId;
  
  // Get token from Redux
  const { token } = useAppSelector((state) => state.user);

  // Debug logging

  const handleStarPress = (selectedRating) => {
    // If clicking the same star that's already selected, deselect it
    if (rating === selectedRating) {
      setRating(0);
    } else {
      setRating(selectedRating);
    }
  };

  const handleContinue = async () => {
    try {
      
      // Try to get subcourseId from different sources
      let finalSubcourseId = subcourseId;
      
      if (!finalSubcourseId) {
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
        Alert.alert('Error', 'Please login again to submit rating.');
        return;
      }
      
      setIsSubmitting(true);
      
      // Call the rating API
      
      const result = await courseAPI.submitRating(token, finalSubcourseId, rating);
      
      
      if (result.success && result.data.success) {
        Alert.alert(
          'Success! 🎉',
          'Thank you for your feedback!',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate back to EnrollScreen with completed flag
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
        Alert.alert('Error', result.data?.message || 'Failed to submit rating. Please try again.');
      }
      
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
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
              color={star <= rating ? "#FF8800" : "#CCCCCC"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header with Back Button and Skip Button */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.skipButtonContainer}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
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
            style={[styles.continueButton, (isSubmitting || rating === 0) && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={isSubmitting || rating === 0}
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
  header: {
    position: 'absolute',
    top: getResponsiveSize(50),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(20),
    zIndex: 10,
  },
  skipButtonContainer: {
    // Removed absolute positioning since it's now in header
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