import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../Redux/hooks';
import { useFocusEffect } from '@react-navigation/native';
import notificationService from '../services/notificationService';

/**
 * Beautiful Notification Badge Component
 * 
 * Usage Examples:
 * 
 * // Modern style (default for HomeScreen)
 * <NotificationBadge 
 *   size={26} 
 *   color="#FF8800" 
 *   iconName="notifications"
 *   badgeColor="#FF4444"
 *   variant="modern"
 * />
 * 
 * // Filled style
 * <NotificationBadge 
 *   size={24} 
 *   color="#2196F3" 
 *   iconName="notifications"
 *   badgeColor="#E91E63"
 *   variant="filled"
 * />
 * 
 * // Gradient style
 * <NotificationBadge 
 *   size={28} 
 *   color="#9C27B0" 
 *   iconName="notifications"
 *   badgeColor="#FF5722"
 *   variant="gradient"
 * />
 * 
 * // Outline style (default)
 * <NotificationBadge 
 *   size={24} 
 *   color="#000000" 
 *   iconName="notifications-outline"
 *   badgeColor="#FF6B35"
 * />
 */

const NotificationBadge = ({ 
  size = 24, 
  color = '#000000', 
  showBadge = true, 
  iconName = 'notifications-outline',
  badgeColor = '#FF6B35',
  variant = 'default' // 'default', 'filled', 'gradient', 'modern'
}) => {
  const { token } = useAppSelector((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);

  // Function to fetch unread count
  const fetchUnreadCount = async () => {
    if (token && showBadge) {
      try {
        const count = await notificationService.getUnreadCount(token);
        setUnreadCount(count);
      } catch (error) {
        console.error('❌ NotificationBadge: Error fetching unread count:', error);
      }
    }
  };

  // Fetch unread count when component mounts or token changes
  useEffect(() => {
    fetchUnreadCount();
  }, [token, showBadge]);

  // Refresh unread count when screen comes into focus (e.g., returning from NotificationScreen)
  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadCount();
    }, [token, showBadge])
  );

  // Get icon style based on variant
  const getIconStyle = () => {
    switch (variant) {
      case 'modern':
        return [styles.icon, styles.modernIcon];
      case 'filled':
        return [styles.icon, styles.filledIcon];
      case 'gradient':
        return [styles.icon, styles.gradientIcon];
      default:
        return styles.icon;
    }
  };

  // Get badge style based on variant
  const getBadgeStyle = () => {
    const baseStyle = [styles.badge, { 
      minWidth: size * 0.4, 
      height: size * 0.4,
      borderRadius: size * 0.2,
      top: -size * 0.1,
      right: -size * 0.1,
      backgroundColor: badgeColor
    }];

    switch (variant) {
      case 'modern':
        return [...baseStyle, styles.modernBadge];
      case 'filled':
        return [...baseStyle, styles.filledBadge];
      case 'gradient':
        return [...baseStyle, styles.gradientBadge];
      default:
        return baseStyle;
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Icon 
        name={iconName} 
        size={size} 
        color={color}
        style={getIconStyle()}
      />
      {showBadge && unreadCount > 0 && (
        <View style={getBadgeStyle()}>
          <Text style={[styles.badgeText, { fontSize: size * 0.25 }]}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  icon: {
    textAlign: 'center',
    // Add subtle shadow for depth
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    // Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 10,
  },
  // Variant styles
  modernIcon: {
    textShadowColor: 'rgba(255, 136, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  filledIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gradientIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modernBadge: {
    shadowColor: '#FF4444',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  filledBadge: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  gradientBadge: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default NotificationBadge;
