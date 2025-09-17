import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const NotificationBadge = ({ 
  size = 24, 
  color = "#000000", 
  showBadge = false,
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      {showBadge ? (
        // With notification: Show only Notification1.png (dot icon)
        <Image 
          source={require('../assests/images/Notification1.png')}
          style={[styles.icon, { width: size, height: size }]}
          resizeMode="contain"
        />
      ) : (
        // No notification: Show only Bell.png (normal bell icon)
        <Image 
          source={require('../assests/images/Bell.png')}
          style={[styles.icon, { width: size, height: size }]}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    // Icon styles
  },
});

export default NotificationBadge;
