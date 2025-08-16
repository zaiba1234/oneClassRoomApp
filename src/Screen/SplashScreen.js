import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const logoAnimation = useRef(new Animated.Value(-200)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

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

    // Navigate to OnBoard after animation
    const timer = setTimeout(() => {
      navigation.replace('OnBoard');
    }, 3000); // 3 seconds total

    return () => clearTimeout(timer);
  }, [navigation, logoAnimation, opacityAnimation]);

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
});

export default SplashScreen;
