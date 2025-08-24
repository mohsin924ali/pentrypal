// ========================================
// Loading Screen - App initialization loading
// ========================================

import React, { useRef, useEffect, type FC } from 'react';
import { View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Spinning animation
  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.background }]}>
      <View style={styles.content}>
        {/* App Logo/Icon */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              backgroundColor: theme.colors.primary[500],
              transform: [{ rotate: spin }, { scale: pulseValue }],
            },
          ]}>
          <Typography variant='h2' color={theme.colors.text.onPrimary}>
            🛒
          </Typography>
        </Animated.View>

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

        {/* Loading Dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map(index => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: theme.colors.primary[500],
                  transform: [
                    {
                      scale: pulseValue.interpolate({
                        inputRange: [1, 1.2],
                        outputRange: [0.8, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
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
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  dotsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginTop: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
};
