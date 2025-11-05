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
import BackButton from '../Component/BackButton';

// Import local assets
const ArrowIcon = require('../assests/images/Arrow.png');
const LearningSaintLogo = require('../assests/images/Learningsaintlogo.png');

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
  const handleNotificationTap = async (notification) => {
    try {
      console.log('🔔 NotificationScreen: Notification tapped:', notification);
      
      // Mark notification as read
      if (notification._id && token) {
        try {
          await notificationService.markAsRead(token, notification._id);
          // Update local state
          setNotifications(prev => prev.map(notif => 
            notif._id === notification._id ? { ...notif, isRead: true } : notif
          ));
          // Update unread count
          if (!notification.isRead) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        } catch (error) {
          console.error('💥 NotificationScreen: Error marking notification as read:', error);
        }
      }
      
      // Extract notification data - handle different notification structures
      // Notification from API has structure: { _id, title, body, data: { type, ... }, ... }
      // We need to extract type from notification.data
      const notificationData = notification.data || {};
      const notificationType = notificationData?.type || notification.type || null;
      
      console.log('🔔 NotificationScreen: Full notification object:', JSON.stringify(notification, null, 2));
      console.log('🔔 NotificationScreen: Notification type:', notificationType);
      console.log('🔔 NotificationScreen: Notification data:', notificationData);
      
      // If no type found, don't navigate - stay on notification screen
      if (!notificationType) {
        console.log('⚠️ NotificationScreen: No notification type found, staying on notification screen');
        return;
      }
      
      // Handle different notification types
      switch (notificationType) {
        case 'live_lesson':
        case 'lesson_live': // Backend sends this type
          const lessonId = notificationData.lessonId || notificationData.lesson_id;
          if (lessonId) {
            console.log('🔔 NotificationScreen: Navigating to LessonVideo with lessonId:', lessonId);
            navigation.navigate('LessonVideo', { lessonId: lessonId, isLive: true });
          } else {
            console.log('⚠️ NotificationScreen: lessonId not found for live lesson');
            // Stay on notification screen if lessonId not found
          }
          break;
        case 'buy_course':
        case 'course':
        case 'courseNotification':
          const subcourseId = notificationData.subcourseId || notificationData.subcourse_id || notificationData.courseId || notificationData.course_id;
          if (subcourseId) {
            console.log('🔔 NotificationScreen: Navigating to Enroll with courseId:', subcourseId);
            navigation.navigate('Enroll', { courseId: subcourseId });
          } else {
            console.log('⚠️ NotificationScreen: subcourseId not found for course notification');
            // Stay on notification screen if subcourseId not found
          }
          break;
        case 'request_internship_letter':
        case 'upload_internship_letter':
        case 'internship_letter_uploaded':
        case 'internship_letter_payment':
        case 'internship_letter_payment_completed':
        case 'internship':
        case 'internshipNotification':
          // Extract courseId from notification data
          const internshipCourseId = notificationData.courseId || notificationData.course_id || notificationData.subcourseId || notificationData.subcourse_id;
          if (internshipCourseId) {
            console.log('🔔 NotificationScreen: Navigating to Internship screen with courseId:', internshipCourseId);
            navigation.navigate('Internship', { courseId: internshipCourseId });
          } else {
            console.log('⚠️ NotificationScreen: courseId not found for internship notification, navigating without courseId');
            navigation.navigate('Internship');
          }
          break;
        default:
          console.log('🔔 NotificationScreen: Unknown notification type, staying on notification screen');
          // Stay on notification screen for unknown types
      }
    } catch (error) {
      console.error('💥 NotificationScreen: Error handling notification tap:', error);
      // On error, stay on notification screen instead of navigating away
    }
  };

  // Handle Continue button for live lesson and internship notifications
  const handleContinueButton = async (notification) => {
    try {
      console.log('🔔 NotificationScreen: Continue button pressed for notification:', notification);
      
      const { data } = notification;
      const notificationType = data?.type || notification.type;
      
      // Check if it's a live lesson notification
      if (notificationType === 'lesson_live' || notificationType === 'live_lesson') {
        let lessonId = data?.lessonId;
        
        // If lessonId is not in data, try to enrich the notification
        if (!lessonId) {
          console.log('🔔 NotificationScreen: lessonId not found, enriching notification...');
          const enrichedNotification = await notificationService.enrichNotificationDataWithLessonId(notification);
          const enrichedData = enrichedNotification?.data || enrichedNotification?.notification?.data || {};
          lessonId = enrichedData.lessonId || enrichedNotification.lessonId || data?.lessonId;
        }
        
        if (lessonId) {
          console.log('🔔 NotificationScreen: Navigating to LessonVideo with lessonId:', lessonId);
          navigation.navigate('LessonVideo', { lessonId: lessonId, isLive: true });
        } else {
          console.error('❌ NotificationScreen: lessonId not found for live lesson notification');
          Alert.alert('Error', 'Unable to find lesson information. Please try again.');
        }
      }
      // Check if it's an internship notification
      else if (
        notificationType === 'request_internship_letter' || 
        notificationType === 'upload_internship_letter' ||
        notificationType === 'internship_letter_uploaded' ||
        notificationType === 'internship_letter_payment' ||
        notificationType === 'internship_letter_payment_completed'
      ) {
        // Extract courseId from notification data
        const { data } = notification;
        const internshipCourseId = data?.courseId || data?.course_id || data?.subcourseId || data?.subcourse_id;
        if (internshipCourseId) {
          console.log('🔔 NotificationScreen: Navigating to Internship screen with courseId:', internshipCourseId);
          navigation.navigate('Internship', { courseId: internshipCourseId });
        } else {
          console.log('⚠️ NotificationScreen: courseId not found for internship notification, navigating without courseId');
          navigation.navigate('Internship');
        }
      }
    } catch (error) {
      console.error('❌ NotificationScreen: Error handling continue button:', error);
      Alert.alert('Error', 'Failed to open. Please try again.');
    }
  };

  // Check if notification is a live lesson
  const isLiveLessonNotification = (notification) => {
    const notificationType = notification?.data?.type || notification?.type;
    return notificationType === 'lesson_live' || notificationType === 'live_lesson';
  };

  // Check if notification is an internship-related notification
  const isInternshipNotification = (notification) => {
    const notificationType = notification?.data?.type || notification?.type;
    return (
      notificationType === 'request_internship_letter' || 
      notificationType === 'upload_internship_letter' ||
      notificationType === 'internship_letter_uploaded' ||
      notificationType === 'internship_letter_payment' ||
      notificationType === 'internship_letter_payment_completed'
    );
  };

  // Check if notification should show Continue button
  const shouldShowContinueButton = (notification) => {
    return isLiveLessonNotification(notification) || isInternshipNotification(notification);
  };

  // Get icon configuration based on notification type
  const getIconConfig = (type) => {
    switch (type) {
      case 'live_lesson':
      case 'lesson_live': // Backend sends this type
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
      case 'internship_letter_payment':
        return {
          leftColor: '#FFD93D',
          rightColor: '#50C878',
          outlineColor: '#FFD93D',
        };
      case 'upload_internship_letter':
      case 'internship_letter_uploaded':
      case 'internship_letter_payment_completed':
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

  // Note: WebSocket listeners removed - using Firebase push notifications only
  // Firebase notifications are handled automatically by the notification service
  useEffect(() => {
    if (!token) return;

    console.log('🔔 NotificationScreen: Using Firebase push notifications only (WebSocket removed)');
    
    // Firebase notifications are handled automatically by the notification service
    // No need for manual listeners - notifications will be received and stored automatically
  }, [token]);

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
    const notificationType = item.data?.type || item.type;
    const iconConfig = getIconConfig(notificationType);
    const timeAgo = formatNotificationTime(item.createdAt || item.timestamp);
    const isLiveLesson = isLiveLessonNotification(item);
    const isInternship = isInternshipNotification(item);
    const showContinueButton = shouldShowContinueButton(item);
    
    // Debug logging for internship notifications
    if (notificationType && notificationType.includes('internship')) {
      console.log('🔔 NotificationScreen: Internship notification detected:', {
        type: notificationType,
        isInternship: isInternship,
        showContinueButton: showContinueButton,
        hasData: !!item.data,
        dataType: item.data?.type
      });
    }
    
    return (
      <View
        key={item._id || item.id}
        style={[
          styles.notificationCard,
          !item.isRead && styles.unreadCard,
          isLiveLesson && styles.liveLessonCard,
          isInternship && styles.internshipCard
        ]}
      >
        <TouchableOpacity
          style={styles.notificationContent}
          onPress={() => handleNotificationTap(item)}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <View style={styles.logoCircle}>
              <Image 
                source={LearningSaintLogo} 
                style={styles.logoInCircle}
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, !item.isRead && styles.unreadText]} numberOfLines={1}>
                {item.title}
              </Text>
              {!item.isRead && !showContinueButton && (
                <View style={styles.unreadDot} />
              )}
            </View>
            <Text style={styles.subtitle} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={styles.timeText}>
              {timeAgo}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Continue button for live lesson and internship notifications */}
        {showContinueButton && (
          <View style={styles.continueButtonContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => handleContinueButton(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => {
          console.log('🔙 [NotificationScreen] Back button pressed');
          navigation.goBack();
        }} />
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
    paddingHorizontal: getVerticalSize(20),
    paddingTop: Platform.OS === 'ios' ? getVerticalSize(50) : getVerticalSize(20),
    paddingBottom: getVerticalSize(10),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 10,
  },
  backButton: {
    padding: getVerticalSize(8),
  },
  
  headerTitle: {
    fontSize: getFontSize(20),
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
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
    paddingTop: getVerticalSize(20),
    paddingBottom: getVerticalSize(32),
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: getFontSize(12),
    marginBottom: getVerticalSize(10),
    padding: getVerticalSize(10),
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledCard: {
    opacity: 0.6,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: getVerticalSize(12),
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logoCircle: {
    width: getFontSize(44),
    height: getFontSize(44),
    borderRadius: getFontSize(22),
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  logoInCircle: {
    width: getFontSize(32),
    height: getFontSize(32),
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getVerticalSize(4),
  },
  title: {
    fontSize: getFontSize(15),
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    lineHeight: getFontSize(20),
  },
  subtitle: {
    fontSize: getFontSize(13),
    color: '#4A4A4A',
    lineHeight: getFontSize(18),
    marginTop: getVerticalSize(2),
    marginBottom: getVerticalSize(2),
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
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  unreadText: {
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: getFontSize(11),
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: getVerticalSize(2),
  },
  unreadDot: {
    width: getFontSize(8),
    height: getFontSize(8),
    borderRadius: getFontSize(4),
    backgroundColor: '#FF6B35',
    marginLeft: getVerticalSize(8),
  },
  liveLessonCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
    backgroundColor: '#F8FBFF',
  },
  internshipCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD93D',
    backgroundColor: '#FFFEF8',
  },
  continueButtonContainer: {
    marginTop: getVerticalSize(6),
    paddingTop: getVerticalSize(6),
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    alignItems: 'flex-end',
  },
  continueButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: getVerticalSize(14),
    paddingVertical: getVerticalSize(6),
    borderRadius: getFontSize(14),
    minWidth: getFontSize(70),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(11),
    fontWeight: '700',
    letterSpacing: 0.3,
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