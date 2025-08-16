import React from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import BrilliantFont from '../Component/BrilliantFont';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const BadgeCourseScreen = () => {
  const navigation = useNavigation();

  const handleContinue = () => {
    console.log('Continue button pressed');
    navigation.navigate('Feedback');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Congratulations Text */}
      <View style={styles.congratulationsContainer}>
        <BrilliantFont
          variant="BOLD_ITALIC"
          size="XXXLARGE"
          weight="BOLD"
          color="#006C99"
          textAlign="center"
          fontStyle="italic"
        >
          Congratulations
        </BrilliantFont>
      </View>

      {/* Badge Icon */}
      <View style={styles.badgeContainer}>
        <Image 
          source={require('../assests/images/BadgeIcon.png')} 
          style={styles.badgeIcon}
          resizeMode="contain"
        />
      </View>

      {/* Course Information */}
      <View style={styles.courseInfoContainer}>
        <Text style={styles.courseTitle}>Product Design</Text>
        <Text style={styles.courseStatus}>Course Completed Successfully</Text>
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <LinearGradient
            colors={['#FF8A00', '#FFB300']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BadgeCourseScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(20),
  },
  congratulationsContainer: {
    marginBottom: getResponsiveSize(40),
  },
  badgeContainer: {
    marginBottom: getResponsiveSize(40),
    alignItems: 'center',
  },
  badgeIcon: {
    width: getResponsiveSize(200),
    height: getResponsiveSize(230),
  },
  courseInfoContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSize(50),
  },
  courseTitle: {
    fontSize: getResponsiveSize(18),
    color: '#FF8800',
    fontWeight: '600',
    marginBottom: getResponsiveSize(8),
    textAlign: 'center',
  },
  courseStatus: {
    fontSize: getResponsiveSize(24),
    color: '#006C99',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: getResponsiveSize(20),
  },
  continueButton: {
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
  continueButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(18),
    fontWeight: 'bold',
  },
});