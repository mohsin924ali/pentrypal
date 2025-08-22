/**
 * Color System
 * Centralized color definitions based on Stitch designs
 */

export const Colors = {
  // Primary Colors
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#19e680', // Main primary from designs
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Secondary Colors
  secondary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c', // Main secondary from designs
    500: '#ffa500', // Alternative secondary
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Neutral Colors
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569', // Text secondary
    700: '#334155',
    800: '#1e293b', // Text primary
    900: '#0f172a',
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    500: '#19e680',
    600: '#16a34a',
  },

  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },

  warning: {
    50: '#fffbeb',
    500: '#ffa500',
    600: '#d97706',
  },

  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
  },

  // Text Colors
  text: {
    primary: '#1e293b',
    secondary: '#475569',
    tertiary: '#64748b',
    inverse: '#ffffff',
  },

  // Border Colors
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e1',
    dark: '#94a3b8',
  },

  // Overlay Colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

// Type for color keys
export type ColorKey = keyof typeof Colors;
export type ColorShade = keyof typeof Colors.primary;
