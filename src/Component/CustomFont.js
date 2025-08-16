import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CustomFont = ({ 
  children, 
  style, 
  fontFamily = 'Brilliant',
  fontSize = 16,
  fontWeight = 'normal',
  color = '#000000',
  textAlign = 'left',
  ...props 
}) => {
  return (
    <Text
      style={[
        styles.customFont,
        {
          fontFamily,
          fontSize,
          fontWeight,
          color,
          textAlign,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  customFont: {
    // Custom font styling
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default CustomFont;
