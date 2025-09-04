import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '../Redux/hooks';
import { useFocusEffect } from '@react-navigation/native';
import notificationService from '../services/notificationService';

const NotificationBadge = ({ size = 24, color = '#000000', showBadge = true }) => {
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

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.icon, { fontSize: size * 0.6, color }]}>🔔</Text>
      {showBadge && unreadCount > 0 && (
        <View style={[styles.badge, { 
          minWidth: size * 0.4, 
          height: size * 0.4,
          borderRadius: size * 0.2,
          top: -size * 0.1,
          right: -size * 0.1
        }]}>
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
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NotificationBadge;
