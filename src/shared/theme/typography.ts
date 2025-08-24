// ========================================
// Typography System - Consistent Text Styles
// ========================================

import type { Typography } from '@/shared/types/ui';
import { Platform } from 'react-native';

/**
 * Typography system with semantic text styles
 * Optimized for React Native with fallback fonts
 */
export const typography: Typography = {
  // Font Families - System fonts with fallbacks
  fontFamilies: {
    primary: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    secondary: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
    monospace: Platform.select({
      ios: 'SF Mono',
      android: 'monospace',
      default: 'monospace',
    }),
  },

  // Font Sizes - Scalable and accessible
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  // Font Weights - Semantic naming
  fontWeights: {
    thin: '100',
    extraLight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
  },

  // Line Heights - Optimal readability
  lineHeights: {
    none: 1.0,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2.0,
  },

  // Letter Spacing - Subtle adjustments
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1.0,
  },

  // Semantic Text Styles - Pre-configured combinations
  textStyles: {
    // Headings
    h1: {
      fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      }),
      fontSize: 48,
      fontWeight: '800',
      lineHeight: 60,
      letterSpacing: -0.5,
    },
    h2: {
      fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      }),
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 44,
      letterSpacing: -0.25,
    },
    h3: {
      fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      }),
      fontSize: 30,
      fontWeight: '600',
      lineHeight: 38,
      letterSpacing: 0,
    },
    h4: {
      fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      }),
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
      letterSpacing: 0,
    },
    h5: {
      fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      }),
      fontSize: 20,
      fontWeight: '500',
      lineHeight: 28,
      letterSpacing: 0,
    },
    h6: {
      fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      }),
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 26,
      letterSpacing: 0,
    },

    // Body Text
    body1: {
      fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      }),
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: 0,
    },
    body2: {
      fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      }),
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0,
    },

    // Support Text
    caption: {
      fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      }),
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      letterSpacing: 0.25,
    },
    overline: {
      fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      }),
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 1.0,
      textTransform: 'uppercase',
    },

    // Interactive Text
    button: {
      fontFamily: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      }),
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
      letterSpacing: 0.25,
    },
  },
};
