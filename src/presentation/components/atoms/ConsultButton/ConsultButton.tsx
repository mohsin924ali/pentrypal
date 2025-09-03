// ========================================
// Consult Button - Animated Floating Action Button
// ========================================

import React, { type FC, useEffect, useRef } from 'react';
import { Animated, Image, Platform, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../../providers/ThemeProvider';

// ========================================
// Component Props Interface
// ========================================

export interface ConsultButtonProps {
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly style?: ViewStyle;
  readonly testID?: string;
  readonly accessible?: boolean;
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
}

// ========================================
// Consult Button Component
// ========================================

export const ConsultButton: FC<ConsultButtonProps> = ({
  onPress,
  disabled = false,
  style,
  testID = 'consult-button',
  accessible = true,
  accessibilityLabel = 'Consult contributors',
  accessibilityHint = 'Tap to contact list contributors for questions',
}) => {
  const { theme } = useTheme();

  // Wave ripple animations - multiple expanding circles
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;

  const wave1Opacity = useRef(new Animated.Value(0)).current;
  const wave2Opacity = useRef(new Animated.Value(0)).current;
  const wave3Opacity = useRef(new Animated.Value(0)).current;

  // ========================================
  // Wave Animation Effects
  // ========================================

  useEffect(() => {
    if (disabled) {
      wave1Anim.setValue(0);
      wave2Anim.setValue(0);
      wave3Anim.setValue(0);
      wave1Opacity.setValue(0);
      wave2Opacity.setValue(0);
      wave3Opacity.setValue(0);
      return;
    }

    // Create wave animation that expands from center and fades out
    const createWaveAnimation = (
      scaleAnim: Animated.Value,
      opacityAnim: Animated.Value,
      delay: number = 0
    ) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Scale from 0.3 to 2.0 (expanding outward)
          Animated.timing(scaleAnim, {
            toValue: 2.0,
            duration: 2000,
            useNativeDriver: true,
          }),
          // Fade in quickly, then fade out slowly
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 1800,
              useNativeDriver: true,
            }),
          ]),
        ]),
        // Reset for next cycle
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 0,
          useNativeDriver: true,
        }),
      ]);
    };

    // Start waves with staggered delays for ripple effect
    const wave1Loop = Animated.loop(createWaveAnimation(wave1Anim, wave1Opacity, 0));
    const wave2Loop = Animated.loop(createWaveAnimation(wave2Anim, wave2Opacity, 700));
    const wave3Loop = Animated.loop(createWaveAnimation(wave3Anim, wave3Opacity, 1400));

    // Initialize wave positions
    wave1Anim.setValue(0.3);
    wave2Anim.setValue(0.3);
    wave3Anim.setValue(0.3);

    wave1Loop.start();
    wave2Loop.start();
    wave3Loop.start();

    return () => {
      wave1Loop.stop();
      wave2Loop.stop();
      wave3Loop.stop();
      // Reset values
      wave1Anim.setValue(0);
      wave2Anim.setValue(0);
      wave3Anim.setValue(0);
      wave1Opacity.setValue(0);
      wave2Opacity.setValue(0);
      wave3Opacity.setValue(0);
    };
  }, [disabled]);

  // ========================================
  // Handlers
  // ========================================

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  // ========================================
  // Wave Animation Styles
  // ========================================

  const wave1Style = {
    transform: [{ scale: wave1Anim }],
    opacity: wave1Opacity,
  };

  const wave2Style = {
    transform: [{ scale: wave2Anim }],
    opacity: wave2Opacity,
  };

  const wave3Style = {
    transform: [{ scale: wave3Anim }],
    opacity: wave3Opacity,
  };

  // ========================================
  // Render
  // ========================================

  return (
    <Animated.View style={[styles.container, disabled && styles.disabled, style]}>
      {/* Wave Ripples - Behind the button */}
      {!disabled && (
        <>
          <Animated.View
            style={[
              styles.wave,
              wave1Style,
              {
                backgroundColor: theme.colors.primary[500],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.wave,
              wave2Style,
              {
                backgroundColor: theme.colors.primary[500],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.wave,
              wave3Style,
              {
                backgroundColor: theme.colors.primary[500],
              },
            ]}
          />
        </>
      )}

      {/* Static Button - Always on top */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.primary[500],
            shadowColor: theme.colors.primary[500],
          },
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        testID={testID}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole='button'>
        {/* Phone Icon - Static */}
        <Image
          source={require('../../../../assets/images/call.png')}
          style={styles.icon}
          resizeMode='contain'
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ========================================
// Styles
// ========================================

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 30,
    elevation: 8,
    height: 60,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    width: 60,
    zIndex: 10, // Ensure button stays on top of waves
    ...Platform.select({
      ios: {
        shadowOpacity: 0.3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  container: {
    alignItems: 'center',
    height: 60,
    justifyContent: 'center',
    position: 'relative',
    width: 60,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    height: 24,
    tintColor: '#ffffff',
    width: 24,
  },
  wave: {
    borderRadius: 30,
    height: 60,
    opacity: 0.3,
    position: 'absolute',
    width: 60,
  },
});
