// ========================================
// Gradient Background Component - Reusable screen backgrounds
// ========================================

import React, { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../providers/ThemeProvider';

// ========================================
// Props Interface
// ========================================

export interface GradientBackgroundProps {
  readonly children: ReactNode;
  readonly style?: ViewStyle;
}

/**
 * Gradient Background Component
 *
 * Provides consistent gradient background across all screens
 * - Uses theme gradient colors
 * - Top-left to bottom-right direction
 * - Supports custom styling
 */
export const GradientBackground: React.FC<GradientBackgroundProps> = ({ children, style }) => {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={theme.colors.gradients.screenBackground}
      start={{ x: 0, y: 0 }} // Top-left
      end={{ x: 1, y: 1 }} // Bottom-right
      style={[styles.container, style]}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
