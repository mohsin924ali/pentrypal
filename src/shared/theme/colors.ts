// ========================================
// Color System - Semantic Color Palette
// ========================================

import type { ColorPalette } from '../types/ui';

/**
 * Color system based on the existing PentryPal brand
 * Primary: #19e680 (bright green)
 * Maintains accessibility and semantic meaning
 */
export const colors: ColorPalette = {
  // Primary Brand Colors - Green theme from existing app
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#19e680', // Main brand color
    600: '#16c472',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Secondary Colors - Complementary orange/amber
  secondary: {
    50: '#fefce8',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Secondary brand color
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Accent Colors - Modern purple
  accent: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },

  // Neutral Grays - Modern and accessible
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Semantic Colors - Consistent across use cases
  semantic: {
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
  },

  // Surface Colors - Backgrounds and cards
  surface: {
    background: '#ffffff',
    card: '#ffffff',
    modal: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.6)',
    disabled: '#f3f4f6',
  },

  // Text Colors - Optimized for readability
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    tertiary: '#6b7280',
    disabled: '#9ca3af',
    inverse: '#ffffff',
    onPrimary: '#ffffff',
    onSecondary: '#111827',
    onSurface: '#111827',
  },

  // Border Colors - Subtle and consistent
  border: {
    primary: '#e5e7eb',
    secondary: '#d1d5db',
    divider: '#f3f4f6',
    focus: '#19e680',
    error: '#ef4444',
  },
};

// Dark theme variant (for future implementation)
export const darkColors: ColorPalette = {
  ...colors,
  surface: {
    background: '#0f172a',
    card: '#1e293b',
    modal: '#334155',
    overlay: 'rgba(0, 0, 0, 0.8)',
    disabled: '#374151',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    disabled: '#64748b',
    inverse: '#0f172a',
    onPrimary: '#ffffff',
    onSecondary: '#0f172a',
    onSurface: '#f8fafc',
  },
  border: {
    primary: '#334155',
    secondary: '#475569',
    divider: '#1e293b',
    focus: '#19e680',
    error: '#ef4444',
  },
};
