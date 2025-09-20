import { Platform } from 'react-native';

// Font configuration for different platforms
export const FONTS = {
  BRILLIANT: Platform.select({
    ios: 'Brilliant',
    android: 'Brilliant',
    default: 'Brilliant',
  }),
  BRILLIANT_BOLD: Platform.select({
    ios: 'Brilliant-Bold',
    android: 'Brilliant-Bold',
    default: 'Brilliant-Bold',
  }),
  BRILLIANT_ITALIC: Platform.select({
    ios: 'Brilliant-Italic',
    android: 'Brilliant-Italic',
    default: 'Brilliant-Italic',
  }),
  BRILLIANT_BOLD_ITALIC: Platform.select({
    ios: 'Brilliant-BoldItalic',
    android: 'Brilliant-BoldItalic',
    default: 'Brilliant-BoldItalic',
  }),
};

// Font fallbacks for better compatibility
export const FONT_FALLBACKS = {
  BRILLIANT: Platform.select({
    ios: 'Brilliant, serif',
    android: 'Brilliant, serif',
    default: 'Brilliant, serif',
  }),
  BRILLIANT_BOLD: Platform.select({
    ios: 'Brilliant-Bold, serif',
    android: 'Brilliant-Bold, serif',
    default: 'Brilliant-Bold, serif',
  }),
  BRILLIANT_ITALIC: Platform.select({
    ios: 'Brilliant-Italic, serif',
    android: 'Brilliant-Italic, serif',
    default: 'Brilliant-Italic, serif',
  }),
  BRILLIANT_BOLD_ITALIC: Platform.select({
    ios: 'Brilliant-BoldItalic, serif',
    android: 'Brilliant-BoldItalic, serif',
    default: 'Brilliant-BoldItalic, serif',
  }),
};

// Font weights
export const FONT_WEIGHTS = {
  LIGHT: '300',
  REGULAR: '400',
  MEDIUM: '500',
  SEMIBOLD: '600',
  BOLD: '700',
  EXTRABOLD: '800',
};

// Font sizes
export const FONT_SIZES = {
  SMALL: 12,
  MEDIUM: 16,
  LARGE: 20,
  XLARGE: 24,
  XXLARGE: 32,
  XXXLARGE: 36,
  MASSIVE: 42,
};
