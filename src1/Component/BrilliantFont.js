import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { FONTS, FONT_FALLBACKS, FONT_WEIGHTS, FONT_SIZES } from '../fonts/fontConfig';

const BrilliantFont = ({ 
  children, 
  style, 
  variant = 'REGULAR',
  size = 'XXXLARGE',
  weight = 'BOLD',
  color = '#2285FA',
  textAlign = 'center',
  fontStyle = 'italic',
  ...props 
}) => {
  // Get the appropriate font family based on variant
  const getFontFamily = () => {
    switch (variant) {
      case 'BOLD':
        return FONTS.BRILLIANT_BOLD;
      case 'ITALIC':
        return FONTS.BRILLIANT_ITALIC;
      case 'BOLD_ITALIC':
        return FONTS.BRILLIANT_BOLD_ITALIC;
      default:
        return FONTS.BRILLIANT;
    }
  };

  // Get the appropriate font fallback
  const getFontFallback = () => {
    switch (variant) {
      case 'BOLD':
        return FONT_FALLBACKS.BRILLIANT_BOLD;
      case 'ITALIC':
        return FONT_FALLBACKS.BRILLIANT_ITALIC;
      case 'BOLD_ITALIC':
        return FONT_FALLBACKS.BRILLIANT_BOLD_ITALIC;
      default:
        return FONT_FALLBACKS.BRILLIANT;
    }
  };

  // Get font size
  const getFontSize = () => {
    return FONT_SIZES[size] || FONT_SIZES.XXXLARGE;
  };

  // Get font weight
  const getFontWeight = () => {
    return FONT_WEIGHTS[weight] || FONT_WEIGHTS.BOLD;
  };

  return (
    <Text
      style={[
        styles.brilliantFont,
        {
          fontFamily: getFontFamily(),
          fontSize: getFontSize(),
          fontWeight: getFontWeight(),
          color,
          textAlign,
          fontStyle,
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
  brilliantFont: {
    // Custom font styling for Brilliant font
    includeFontPadding: false,
    textAlignVertical: 'center',
    // Platform-specific adjustments
    ...Platform.select({
      ios: {
        // iOS-specific font adjustments
      },
      android: {
        // Android-specific font adjustments
      },
    }),
  },
});

export default BrilliantFont;
