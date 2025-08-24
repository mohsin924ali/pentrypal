// ========================================
// Theme System - Design Tokens & Configuration
// ========================================

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import type { Theme } from '../types/ui';

/**
 * Complete theme configuration following design system principles
 * Based on the existing PentryPal design with improvements
 */
export const theme: Theme = {
  colors,
  typography,
  spacing,
  shadows,
  borders: {
    radius: {
      none: 0,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      '2xl': 24,
      '3xl': 32,
      full: 9999,
    },
    width: {
      none: 0,
      thin: 1,
      medium: 2,
      thick: 3,
    },
  },
  animations: {
    durations: {
      instant: 0,
      fast: 150,
      normal: 300,
      slow: 500,
      slower: 750,
    },
    easings: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    presets: {
      fadeIn: {
        duration: 300,
        easing: 'ease-out',
      },
      fadeOut: {
        duration: 200,
        easing: 'ease-in',
      },
      slideInUp: {
        duration: 400,
        easing: 'ease-out',
      },
      slideInDown: {
        duration: 400,
        easing: 'ease-out',
      },
      slideInLeft: {
        duration: 400,
        easing: 'ease-out',
      },
      slideInRight: {
        duration: 400,
        easing: 'ease-out',
      },
      scaleIn: {
        duration: 250,
        easing: 'ease-out',
      },
      scaleOut: {
        duration: 200,
        easing: 'ease-in',
      },
      rotateIn: {
        duration: 300,
        easing: 'ease-out',
      },
      bounce: {
        duration: 600,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  },
};

// Export individual modules for selective imports
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { shadows } from './shadows';

// Export default theme
export default theme;
