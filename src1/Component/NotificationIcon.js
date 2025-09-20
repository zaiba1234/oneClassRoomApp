import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

const NotificationIcon = ({ leftColor, rightColor, outlineColor, size = 48 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Head outline */}
      <View style={[styles.headOutline, { borderColor: outlineColor }]}>
        {/* Left half */}
        <View style={[styles.half, styles.leftHalf, { backgroundColor: leftColor }]} />
        {/* Right half */}
        <View style={[styles.half, styles.rightHalf, { backgroundColor: rightColor }]} />
        
        {/* Facial features */}
        <View style={styles.eye} />
        <View style={styles.nose} />
        <View style={styles.mouth} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headOutline: {
    width: '80%',
    height: '80%',
    borderRadius: 20,
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  half: {
    position: 'absolute',
    width: '50%',
    height: '100%',
  },
  leftHalf: {
    left: 0,
  },
  rightHalf: {
    right: 0,
  },
  eye: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000000',
    top: '30%',
    left: '35%',
  },
  nose: {
    position: 'absolute',
    width: 3,
    height: 6,
    backgroundColor: '#000000',
    top: '40%',
    left: '45%',
  },
  mouth: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: '#000000',
    borderRadius: 1,
    top: '60%',
    left: '40%',
  },
});

export default NotificationIcon; 