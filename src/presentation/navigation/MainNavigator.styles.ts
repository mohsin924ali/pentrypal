// ========================================
// Main Navigator Styles
// ========================================

import { type ImageStyle, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '../../shared/types/ui';

/**
 * Fallback theme for MainNavigator when theme context is unavailable
 * Matches the original hardcoded values exactly
 */
export const createFallbackTheme = () => ({
  colors: {
    primary: { '500': '#3b82f6' },
    text: { primary: '#000000', secondary: '#666666', tertiary: '#999999' },
    surface: { background: '#ffffff' },
    border: { primary: '#e5e5e5' },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
  },
});

/**
 * Tab Icon Styles
 */
export const tabIconStyles = StyleSheet.create({
  container: {
    // Dynamic width/height will be set inline based on size prop
  } as ViewStyle,
  image: {
    // Dynamic width/height/tintColor will be set inline based on props
  } as ImageStyle,
});

/**
 * Create tab bar styles using the provided theme
 */
export const createTabBarStyles = (theme: any) => ({
  tabBarStyle: {
    backgroundColor: theme.colors.surface.background,
    borderTopColor: theme.colors.border.primary,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 24,
    height: 85,
    ...theme.shadows.sm,
  } as ViewStyle,
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginTop: 4,
  } as TextStyle,
  tabBarIconStyle: {
    marginTop: 4,
  } as ViewStyle,
});
