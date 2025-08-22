/**
 * Welcome Screen
 * Final onboarding screen with Sign Up/Login options (Intro-4 from Stitch)
 */

import React, { useEffect, useRef } from 'react';
import { View, Image, ViewStyle, SafeAreaView, Animated } from 'react-native';
import { Theme } from '@/shared/theme';
import { Typography } from '@/presentation/components/atoms/Typography';
import { Button } from '@/presentation/components/atoms/Button';

// Import placeholder image (using splash image)
const welcomeIllustration = require('../../../../assets/splash.png');

interface WelcomeScreenProps {
  onSignUpPress: () => void;
  onLoginPress: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSignUpPress,
  onLoginPress,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const buttonsFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Splash screen entrance animation sequence - more dramatic and beautiful
    Animated.sequence([
      // Start with a dramatic scale-up of the splash image with fade
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      // Small pause for impact
      Animated.delay(300),
      // Then slide up the text content with bounce
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      // Small pause before buttons
      Animated.delay(200),
      // Finally fade in the buttons with slide up
      Animated.spring(buttonsFadeAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        {/* Illustration */}
        <Animated.View 
          style={[
            styles.illustrationContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <Animated.Image
            source={welcomeIllustration}
            style={styles.illustration}
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel="Person holding grocery bag with fresh vegetables"
          />
        </Animated.View>

        {/* Text Content */}
        <Animated.View 
          style={[
            styles.textContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            }
          ]}
        >
          <Typography
            variant="h1"
            color={Theme.colors.text.primary}
            align="center"
            style={styles.title}
          >
            Shop smarter, together
          </Typography>

          <Typography
            variant="bodyLarge"
            color={Theme.colors.text.secondary}
            align="center"
            style={styles.description}
          >
            Plan meals, share lists, and track pantry items with ease.
          </Typography>
        </Animated.View>
      </View>

      {/* Footer with Auth Buttons */}
      <Animated.View 
        style={[
          styles.footer,
          {
            opacity: buttonsFadeAnim,
            transform: [{ 
              translateY: buttonsFadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              })
            }],
          }
        ]}
      >
        <View style={styles.buttonContainer}>
          <Button
            title="Sign Up"
            variant="primary"
            size="large"
            fullWidth
            onPress={onSignUpPress}
            style={styles.signUpButton}
          />

          <Button
            title="Log In"
            variant="ghost"
            size="large"
            fullWidth
            onPress={onLoginPress}
            style={styles.loginButton}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Pure white background for splash screen
    position: 'relative',
  } as ViewStyle,

  content: {
    flex: 1,
    paddingHorizontal: Theme.designSpacing.screenPadding,
    paddingTop: Theme.spacing['6xl'],
    paddingBottom: Theme.spacing['4xl'],
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  illustrationContainer: {
    width: '85%',
    aspectRatio: 1, // Make it square for splash screen look
    marginBottom: Theme.spacing['4xl'],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    backgroundColor: '#ffffff',
    borderRadius: 24,
  } as ViewStyle,

  illustration: {
    width: '90%',
    height: '90%',
    borderRadius: 20,
  } as ViewStyle,

  textContent: {
    width: '100%',
    maxWidth: Theme.designSpacing.maxContentWidth,
    alignItems: 'center',
    marginBottom: Theme.spacing['2xl'],
    paddingHorizontal: Theme.spacing.lg,
  } as ViewStyle,

  title: {
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 38,
  } as ViewStyle,

  description: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 26,
    color: '#6B7280',
    fontWeight: '400',
  } as ViewStyle,

  footer: {
    paddingHorizontal: Theme.designSpacing.screenPadding,
    paddingBottom: Theme.spacing['3xl'],
    paddingTop: Theme.spacing.lg,
  } as ViewStyle,

  buttonContainer: {
    width: '100%',
    maxWidth: Theme.designSpacing.maxContentWidth,
    alignSelf: 'center',
    gap: Theme.spacing.lg,
  } as ViewStyle,

  signUpButton: {
    marginBottom: Theme.spacing.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderRadius: 16,
  } as ViewStyle,

  loginButton: {
    backgroundColor: Theme.colors.background.tertiary,
    borderRadius: 16,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  } as ViewStyle,
};
