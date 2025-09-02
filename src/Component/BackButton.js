import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const BackButton = ({ onPress, size = 20, color = '#FF8800' }) => {
  return (
    <TouchableOpacity 
      style={styles.backButton}
      onPress={onPress}
    >
      <View style={styles.backButtonContainer}>
        <Icon name="chevron-back" size={size} color={color} />
      </View>
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    flexShrink: 0,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFE4D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
