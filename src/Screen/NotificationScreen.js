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
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import NotificationIcon from '../Component/NotificationIcon';
import { useAppSelector } from '../Redux/hooks';
import notificationService from '../services/notificationService';

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
  // Get user token from Redux
  const { token } = useAppSelector((state) => state.user);
  
  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      if (!token) {
        setError('Please login to view notifications');
        setIsLoading(false);
        return;
      }

      const result = await notificationService.getNotifications(token, 1, 50);
      
      if (result) {
        setNotifications(result.notifications || []);
        setError(null);
      } else {
        setError('Failed to load notifications');
      }
    } catch (error) {
      console.error('💥 NotificationScreen: Error fetching notifications:', error);
      setError('Error loading notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      if (!token) return;
      
      const count = await notificationService.getUnreadCount(token);
      setUnreadCount(count);
    } catch (error) {
      console.error('💥 NotificationScreen: Error fetching unread count:', error);
    }
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchNotifications(),
      fetchUnreadCount()
    ]);
    setRefreshing(false);
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (!token) return;
      
      const success = await notificationService.markAllAsRead(token);
      if (success) {
        setUnreadCount(0);
        // Update local notifications to show as read
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        Alert.alert('Success', 'All notifications marked as read');
      }
    } catch (error) {
      console.error('💥 NotificationScreen: Error marking notifications as read:', error);
      Alert.alert('Error', 'Failed to mark notifications as read');
    }
  };

  // Handle notification tap
  const handleNotificationTap = (notification) => {
    try {
      
      const { data } = notification;
      
      // Handle different notification types
      switch (data?.type) {
        case 'live_lesson':
          if (data.lessonId) {
            navigation.navigate('LessonVideo', { lessonId: data.lessonId });
          }
          break;
        case 'buy_course':
          if (data.subcourseId) {
            navigation.navigate('Enroll', { courseId: data.subcourseId });
          }
          break;
        case 'request_internship_letter':
        case 'upload_internship_letter':
          navigation.navigate('Internship');
          break;
        default:
      }
    } catch (error) {
      console.error('💥 NotificationScreen: Error handling notification tap:', error);
    }
  };

  // Get icon configuration based on notification type
  const getIconConfig = (type) => {
    switch (type) {
      case 'live_lesson':
        return {
          leftColor: '#4A90E2',
          rightColor: '#FFB6C1',
          outlineColor: '#4A90E2',
        };
      case 'buy_course':
        return {
          leftColor: '#50C878',
          rightColor: '#FFB6C1',
          outlineColor: '#50C878',
        };
      case 'request_internship_letter':
        return {
          leftColor: '#FFD93D',
          rightColor: '#50C878',
          outlineColor: '#FFD93D',
        };
      case 'upload_internship_letter':
        return {
          leftColor: '#50C878',
          rightColor: '#FFD93D',
          outlineColor: '#50C878',
        };
      default:
        return {
          leftColor: '#CCCCCC',
          rightColor: '#50C878',
          outlineColor: '#CCCCCC',
        };
    }
  };

  // Format notification time
  const formatNotificationTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  // Load notifications when screen focuses
  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchNotifications();
        fetchUnreadCount();
      }
    }, [token])
  );

  // Initial load
  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setIsLoading(false);
      setError('Please login to view notifications');
    }
  }, [token]);

  const renderNotificationItem = (item) => {
    const iconConfig = getIconConfig(item.data?.type);
    const timeAgo = formatNotificationTime(item.createdAt || item.timestamp);
    
    return (
      <TouchableOpacity 
        key={item._id || item.id} 
        style={[
          styles.notificationCard, 
          !item.isRead && styles.unreadCard
        ]}
        onPress={() => handleNotificationTap(item)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.iconContainer}>
            <NotificationIcon
              leftColor={iconConfig.leftColor}
              rightColor={iconConfig.rightColor}
              outlineColor={iconConfig.outlineColor}
              size={getFontSize(48)}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, !item.isRead && styles.unreadText]}>
              {item.title}
            </Text>
            <Text style={styles.subtitle}>
              {item.body}
            </Text>
            <Text style={styles.timeText}>
              {timeAgo}
            </Text>
          </View>
          {!item.isRead && (
            <View style={styles.unreadDot} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
            title="Pull to refresh..."
            titleColor="#FF6B35"
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>You'll see your notifications here</Text>
          </View>
        ) : (
          notifications.map(renderNotificationItem)
        )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: getVerticalSize(12),
    paddingVertical: getVerticalSize(6),
    borderRadius: getFontSize(15),
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: getFontSize(12),
    fontWeight: '600',
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
  unreadCard: {
    backgroundColor: '#F8F9FF',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
  },
  unreadText: {
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: getFontSize(12),
    color: '#999999',
    marginTop: getVerticalSize(2),
  },
  unreadDot: {
    width: getFontSize(8),
    height: getFontSize(8),
    borderRadius: getFontSize(4),
    backgroundColor: '#FF6B35',
    marginLeft: getVerticalSize(8),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getVerticalSize(40),
  },
  loadingText: {
    fontSize: getFontSize(16),
    color: '#666666',
    marginTop: getVerticalSize(15),
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getVerticalSize(20),
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getVerticalSize(60),
  },
  emptyText: {
    fontSize: getFontSize(18),
    color: '#666666',
    textAlign: 'center',
    marginBottom: getVerticalSize(10),
  },
  emptySubtext: {
    fontSize: getFontSize(14),
    color: '#999999',
    textAlign: 'center',
  },
});

export default NotificationScreen;