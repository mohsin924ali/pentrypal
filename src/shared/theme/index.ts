/**
 * Theme System
 * Centralized theme configuration
 */

import { Colors } from './colors';
import { Typography, FontFamilies, FontSizes, FontWeights } from './typography';
import { Spacing, DesignSpacing } from './spacing';
import { Shadows } from './shadows';

export const Theme = {
  colors: Colors,
  typography: Typography,
  fontFamilies: FontFamilies,
  fontSizes: FontSizes,
  fontWeights: FontWeights,
  spacing: Spacing,
  designSpacing: DesignSpacing,
  shadows: Shadows,

  // Border radius values from designs
  borderRadius: {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    full: 9999,
  },

  // Animation durations
  animation: {
    fast: 150,
    base: 200,
    slow: 300,
  },

  // Breakpoints for responsive design
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
} as const;

// Export individual theme parts
export { Colors } from './colors';
export { Typography, FontFamilies, FontSizes, FontWeights } from './typography';
export { Spacing, DesignSpacing } from './spacing';
export { Shadows } from './shadows';

// Export types
export type ThemeType = typeof Theme;
export type ColorKey = keyof typeof Colors;
export type TypographyKey = keyof typeof Typography;
export type SpacingKey = keyof typeof Spacing;
export type ShadowKey = keyof typeof Shadows;
