/**
 * Typography System
 * Font definitions based on Plus Jakarta Sans from Stitch designs
 */

import { TextStyle } from 'react-native';

export const FontWeights = {
  regular: '400',
  medium: '500',
  bold: '700',
  extraBold: '800',
} as const;

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const LineHeights = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 40,
  '5xl': 56,
} as const;

// Typography Styles based on Stitch designs
export const Typography: Record<string, TextStyle> = {
  // Headings
  h1: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: FontSizes['3xl'],
    lineHeight: LineHeights['3xl'],
    fontWeight: FontWeights.extraBold,
  },

  h2: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: FontSizes['2xl'],
    lineHeight: LineHeights['2xl'],
    fontWeight: FontWeights.bold,
  },

  h3: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: FontSizes.xl,
    lineHeight: LineHeights.xl,
    fontWeight: FontWeights.bold,
  },

  h4: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: FontSizes.lg,
    lineHeight: LineHeights.lg,
    fontWeight: FontWeights.bold,
  },

  // Body Text
  bodyLarge: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: FontSizes.lg,
    lineHeight: LineHeights.lg,
    fontWeight: FontWeights.regular,
  },

  body: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: FontSizes.base,
    lineHeight: LineHeights.base,
    fontWeight: FontWeights.regular,
  },

  bodySmall: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.sm,
    fontWeight: FontWeights.regular,
  },

  // Button Text
  buttonLarge: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: FontSizes.lg,
    lineHeight: LineHeights.lg,
    fontWeight: FontWeights.bold,
  },

  button: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: FontSizes.base,
    lineHeight: LineHeights.base,
    fontWeight: FontWeights.bold,
  },

  buttonSmall: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.sm,
    fontWeight: FontWeights.medium,
  },

  // Caption and Labels
  caption: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.sm,
    fontWeight: FontWeights.medium,
  },

  label: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: FontSizes.base,
    lineHeight: LineHeights.base,
    fontWeight: FontWeights.medium,
  },

  // Slide-specific styles from designs
  slideTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: FontSizes['2xl'],
    lineHeight: LineHeights['2xl'],
    fontWeight: FontWeights.bold,
  },

  slideDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: FontSizes.base,
    lineHeight: LineHeights.base,
    fontWeight: FontWeights.regular,
  },
} as const;

// Font family mapping for React Native
export const FontFamilies = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  bold: 'PlusJakartaSans-Bold',
  extraBold: 'PlusJakartaSans-ExtraBold',
} as const;

export type TypographyKey = keyof typeof Typography;
