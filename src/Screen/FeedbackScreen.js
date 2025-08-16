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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const FeedbackScreen = () => {
  const navigation = useNavigation();
  const [rating, setRating] = useState(1);

  const handleStarPress = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleContinue = () => {
    console.log('Continue button pressed with rating:', rating);
    navigation.navigate('CourseDetail');
  };

  const handleSkip = () => {
    console.log('Skip button pressed');
    navigation.navigate('CourseDetail');
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
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
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
});