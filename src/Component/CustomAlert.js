import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';

// Import logo
const LogoImage = require('../assests/images/logo.jpeg');

const { width, height } = Dimensions.get('window');

const CustomAlert = ({
  visible,
  title,
  message,
  type = 'info', // 'success', 'error', 'warning', 'info'
  showCancel = false,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  autoClose = false,
  autoCloseDelay = 3000,
  showIcon = true,
  icon,
}) => {
  console.log('🔔 CustomAlert: Rendering with visible:', visible, 'title:', title);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close if enabled
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      // Hide animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleClose();
  };

  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✓',
          iconColor: '#28a745',
          gradientColors: ['#28a745', '#20c997'],
          titleColor: '#155724',
          messageColor: '#155724',
        };
      case 'error':
        return {
          icon: '✕',
          iconColor: '#dc3545',
          gradientColors: ['#dc3545', '#e74c3c'],
          titleColor: '#721c24',
          messageColor: '#721c24',
        };
      case 'warning':
        return {
          icon: '⚠',
          iconColor: '#ffc107',
          gradientColors: ['#ffc107', '#ffb300'],
          titleColor: '#856404',
          messageColor: '#856404',
        };
      case 'info':
      default:
        return {
          icon: 'ℹ',
          iconColor: '#FF8800',
          gradientColors: ['#FF8800', '#FFB800'],
          titleColor: '#2C3E50',
          messageColor: '#7F8C8D',
        };
    }
  };

  const config = getAlertConfig();

  if (!visible) return null;

  return (
    <Modal
      isVisible={visible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={300}
      animationOutTiming={200}
      backdropOpacity={0.6}
      backdropColor="#000000"
      onBackdropPress={null}
      onBackButtonPress={null}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      style={styles.modal}
    >
      <Animated.View
        style={[
          styles.alertContainer,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Header with gradient background */}
        <LinearGradient
          colors={config.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          {/* Logo */}
          {showIcon && (
            <View style={styles.iconContainer}>
              <Image 
                source={LogoImage} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          )}
        </LinearGradient>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Title */}
          {title && (
            <Text style={[styles.title, { color: config.titleColor }]}>
              {title}
            </Text>
          )}
          
          {/* Message */}
          {message && (
            <ScrollView 
              style={styles.messageScrollContainer}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              <Text style={[styles.message, { color: config.messageColor }]}>
                {message}
              </Text>
            </ScrollView>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                !showCancel && styles.fullWidthButton,
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={config.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmButtonGradient}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
    overflow: 'hidden',
  },
  headerGradient: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingTop: 25,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 28,
  },
  messageScrollContainer: {
    maxHeight: 200,
    marginBottom: 25,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  button: {
    flex: 1,
    minHeight: 50,
    borderRadius: 15,
    overflow: 'hidden',
  },
  fullWidthButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CustomAlert;