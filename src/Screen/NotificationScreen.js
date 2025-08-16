import React from 'react';
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
} from 'react-native';
import NotificationIcon from '../Component/NotificationIcon';

// Import local assets
const ArrowIcon = require('../assests/images/Arrow.png');

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

// Responsive scaling factors
const scale = width / 375; // Base width for iPhone 8
const verticalScale = height / 812; // Base height for iPhone 8

// Responsive font sizes
const getFontSize = (size) => size * scale;
const getVerticalSize = (size) => size * verticalScale;

const NotificationScreen = ({ navigation }) => {
  // Mock notification data with custom icon configurations
  const notifications = [
    {
      id: 1,
      title: 'Introduction to 3D',
      subtitle: 'Live Now',
      iconConfig: {
        leftColor: '#4A90E2', // Light blue
        rightColor: '#FFB6C1', // Light peach
        outlineColor: '#4A90E2', // Light blue outline
      },
      action: 'Join Now',
      isLive: true,
    },
    {
      id: 2,
      title: 'Enrolled Successfully',
      subtitle: 'Introduction to 3D',
      iconConfig: {
        leftColor: '#50C878', // Light teal
        rightColor: '#FFB6C1', // Light peach
        outlineColor: '#50C878', // Light teal outline
      },
    },
    {
      id: 3,
      title: 'Introduction to 3D Modeling Basics',
      subtitle: 'Live In - 02:32:46',
      iconConfig: {
        leftColor: '#FFB6C1', // Light peach
        rightColor: '#50C878', // Light teal
        outlineColor: '#FFB6C1', // Light pink outline
      },
      isCountdown: true,
    },
    {
      id: 4,
      title: 'Advanced 3D Modeling Techniques',
      subtitle: '45 minutes',
      iconConfig: {
        leftColor: '#FFD93D', // Light yellow
        rightColor: '#50C878', // Light teal
        outlineColor: '#FFD93D', // Light yellow outline
      },
    },
    {
      id: 5,
      title: 'Lighting and Texturing in 3D',
      subtitle: '30 minutes',
      iconConfig: {
        leftColor: '#50C878', // Light teal
        rightColor: '#FFB6C1', // Light peach
        outlineColor: '#50C878', // Light teal outline
      },
    },
    {
      id: 6,
      title: 'Animating 3D Objects',
      subtitle: '50 minutes',
      iconConfig: {
        leftColor: '#50C878', // Light teal
        rightColor: '#FFD93D', // Light yellow
        outlineColor: '#50C878', // Light teal outline
      },
    },
    {
      id: 7,
      title: 'Exporting and Sharing',
      subtitle: 'Coming Soon',
      iconConfig: {
        leftColor: '#CCCCCC', // Light grey
        rightColor: '#50C878', // Light teal
        outlineColor: '#CCCCCC', // Light grey outline
      },
      isDisabled: true,
    },
  ];

  const renderNotificationItem = (item) => (
    <View key={item.id} style={[styles.notificationCard, item.isDisabled && styles.disabledCard]}>
      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          <NotificationIcon
            leftColor={item.iconConfig.leftColor}
            rightColor={item.iconConfig.rightColor}
            outlineColor={item.iconConfig.outlineColor}
            size={getFontSize(48)}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, item.isDisabled && styles.disabledText]}>
            {item.title}
          </Text>
          <Text style={[
            styles.subtitle,
            item.isCountdown && styles.countdownText,
            item.isDisabled && styles.disabledText
          ]}>
            {item.subtitle}
          </Text>
        </View>
        {item.action && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              console.log('Join Now button pressed from notification');
              // Navigation removed - button is now just visual
            }}
          >
            <Text style={styles.actionButtonText}>{item.action}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={ArrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {notifications.map(renderNotificationItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getVerticalSize(20),
    paddingTop: Platform.OS === 'ios' ? getVerticalSize(50) : getVerticalSize(20),
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
    fontSize: getFontSize(20),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  placeholder: {
    width: getFontSize(40),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: getVerticalSize(16),
    paddingTop: getVerticalSize(16),
    paddingBottom: getVerticalSize(32),
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: getFontSize(12),
    marginBottom: getVerticalSize(12),
    padding: getVerticalSize(16),
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledCard: {
    opacity: 0.6,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: getVerticalSize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: getFontSize(16),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: getVerticalSize(4),
  },
  subtitle: {
    fontSize: getFontSize(14),
    color: '#666666',
  },
  countdownText: {
    color: '#FF4444',
    fontWeight: '500',
  },
  disabledText: {
    color: '#999999',
  },
  actionButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: getVerticalSize(16),
    paddingVertical: getVerticalSize(8),
    borderRadius: getFontSize(20),
    marginLeft: getVerticalSize(12),
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(14),
    fontWeight: '600',
  },
});

export default NotificationScreen;