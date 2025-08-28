// ========================================
// Loading Screen - App initialization loading
// ========================================

import React, { type FC } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../../providers/ThemeProvider';

/**
 * Loading Screen Component
 *
 * Shows a loading indicator while the app initializes
 * Used during Redux persistence rehydration
 */
export const LoadingScreen: FC = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.background }]}>
      <View style={styles.content}>
        {/* Lottie Animation */}
        <View style={styles.animationContainer}>
          <LottieView
            source={require('../../../../assets/animations/GroceryUpdate.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>

        {/* App Name */}
        <Typography
          variant='h3'
          color={theme.colors.text.primary}
          align='center'
          style={{ marginTop: theme.spacing.xl }}>
          PentryPal
        </Typography>

        {/* Loading Text */}
        <Typography
          variant='body1'
          color={theme.colors.text.secondary}
          align='center'
          style={{ marginTop: theme.spacing.sm }}>
          Loading your grocery lists...
        </Typography>
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = {
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 24,
  },
  animationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
};
