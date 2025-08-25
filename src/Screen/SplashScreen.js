import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import { loadUserFromStorage, validateStoredToken } from '../Redux/userSlice';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.user);
  
  const logoAnimation = useRef(new Animated.Value(-200)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load user data from storage when component mounts
    const initializeApp = async () => {
      console.log('🚀 SplashScreen: Initializing app...');
      
      // First load user data from storage
      await dispatch(loadUserFromStorage());
      
      // Then validate the stored token if we have one
      await dispatch(validateStoredToken());
    };
    
    initializeApp();
  }, [dispatch]);

  useEffect(() => {
    // Animate logo from top to center
    Animated.parallel([
      Animated.timing(logoAnimation, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate based on authentication status after animation
    const timer = setTimeout(() => {
      if (isLoading) {
        // Still loading, wait a bit more
        console.log('⏳ SplashScreen: Still loading user data, waiting...');
        return;
      }
      
      if (isAuthenticated) {
        console.log('✅ SplashScreen: User is authenticated, navigating to Home');
        navigation.replace('Home');
      } else {
        console.log('❌ SplashScreen: User is not authenticated, navigating to OnBoard');
        navigation.replace('OnBoard');
      }
    }, 3000); // 3 seconds total

    return () => clearTimeout(timer);
  }, [navigation, logoAnimation, opacityAnimation, isAuthenticated, isLoading]);

  // Additional effect to handle navigation when authentication status changes
  useEffect(() => {
    if (!isLoading && isAuthenticated !== undefined) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          console.log('✅ SplashScreen: User authenticated, navigating to Home');
          navigation.replace('Home');
        } else {
          console.log('❌ SplashScreen: User not authenticated, navigating to OnBoard');
          navigation.replace('OnBoard');
        }
      }, 500); // Small delay to ensure smooth transition
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, navigation]);

  // Show loading message if still initializing
  const showLoadingMessage = isLoading || isAuthenticated === undefined;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0)', '#FFB800']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ translateY: logoAnimation }],
              opacity: opacityAnimation,
            },
          ]}
        >
          <Image
            source={require('../assests/images/Learningsaintlogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          {showLoadingMessage && (
            <Text style={styles.loadingText}>Initializing...</Text>
          )}
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.6,
    height: height * 0.3,
    maxWidth: 280,
    maxHeight: 200,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default SplashScreen;
