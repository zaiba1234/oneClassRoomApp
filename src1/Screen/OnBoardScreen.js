import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const OnBoardScreen = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Animation values
  const titleAnimation = useRef(new Animated.Value(50)).current;
  const descriptionAnimation = useRef(new Animated.Value(50)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  const slides = [
    {
      id: 1,
      image: require('../assests/images/Onboard2.png'),
      title: 'Explore the Features',
      description: 'Dive into the various features of our platform, designed to enhance your learning experience.',
      buttonText: 'Next',
    },
    {
      id: 2,
      image: require('../assests/images/Onboard3.png'),
      title: 'Join the Community',
      description: 'Connect with fellow learners and professionals, sharing insights and resources to boost your knowledge.',
      buttonText: 'Next',
    },
    {
      id: 3,
      image: require('../assests/images/Onboard1.png'),
      title: 'Start Your Journey',
      description: 'Begin your educational path today with easy access to a wealth of information and tutorials.',
      buttonText: 'Get Started',
    },
    
   
  ];

  // Animate text when slide changes
  useEffect(() => {
    // Reset animation values
    titleAnimation.setValue(50);
    descriptionAnimation.setValue(50);
    opacityAnimation.setValue(0);

    // Start animations
    Animated.parallel([
      Animated.timing(titleAnimation, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(descriptionAnimation, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const currentSlide = slides[currentIndex];

  return (
    <LinearGradient
      colors={['#FFE0B2', '#FFFFFF', '#FFE4B5']}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
      
      {/* Skip Button - Only show on first screen */}
      {currentIndex === 0 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={currentSlide.image} 
            style={styles.image} 
            resizeMode="contain" 
          />
        </View>

        {/* Text Content with Animation */}
        <View style={styles.textContainer}>
          <Animated.Text 
            style={[
              styles.title,
              {
                transform: [{ translateY: titleAnimation }],
                opacity: opacityAnimation,
              },
            ]}
          >
            {currentSlide.title}
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.description,
              {
                transform: [{ translateY: descriptionAnimation }],
                opacity: opacityAnimation,
              },
            ]}
          >
            {currentSlide.description}
          </Animated.Text>
        </View>

        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity style={styles.buttonContainer} onPress={handleNext}>
          <LinearGradient
            colors={['#FFB800','#FF9038', ]}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>{currentSlide.buttonText}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 50,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    width: width * 0.7,
    height: height * 0.35,
    maxWidth: 300,
    maxHeight: 300,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF6B35',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FF9038',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnBoardScreen;