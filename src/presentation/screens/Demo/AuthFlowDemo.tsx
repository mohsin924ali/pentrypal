/**
 * Auth Flow Demo
 * Demonstrates the complete authentication flow with Get Started, Login, and SignUp screens
 */

import React, { useState } from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GetStartedScreen } from '@/presentation/screens/Onboarding/GetStartedScreen';
import {
  LoginScreen,
  LoginData,
} from '@/presentation/screens/Auth/LoginScreen';
import {
  SignUpScreen,
  SignUpData,
} from '@/presentation/screens/Auth/SignUpScreen';
import { Theme } from '@/shared/theme';

type Screen = 'getStarted' | 'login' | 'signUp' | 'complete';

export const AuthFlowDemo: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('getStarted');
  const [loading, setLoading] = useState(false);

  const handleSignUp = () => {
    setCurrentScreen('signUp');
  };

  const handleLogin = () => {
    setCurrentScreen('login');
  };

  const handleSkip = () => {
    setCurrentScreen('complete');
  };

  const handleSignUpSubmit = async (data: SignUpData) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log('Sign up data:', data);
      setCurrentScreen('complete');
    }, 2000);
  };

  const handleLoginSubmit = async (data: LoginData) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log('Login data:', data);
      setCurrentScreen('complete');
    }, 2000);
  };

  const handleBackToGetStarted = () => {
    setCurrentScreen('getStarted');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'getStarted':
        return (
          <GetStartedScreen
            onSignUp={handleSignUp}
            onLogin={handleLogin}
            onSkip={handleSkip}
          />
        );

      case 'login':
        return (
          <LoginScreen
            onLogin={handleLoginSubmit}
            onSignUpPress={handleSignUp}
            onForgotPasswordPress={handleForgotPassword}
            onBackPress={handleBackToGetStarted}
            loading={loading}
          />
        );

      case 'signUp':
        return (
          <SignUpScreen
            onSignUp={handleSignUpSubmit}
            onLoginPress={handleLogin}
            onBackPress={handleBackToGetStarted}
            loading={loading}
          />
        );

      case 'complete':
        return (
          <View style={styles.completeContainer}>
            {/* This would be replaced with the main app */}
            <View style={styles.placeholder}>
              <View style={styles.placeholderText} />
              <View style={styles.placeholderText} />
              <View style={styles.placeholderText} />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>{renderScreen()}</View>
    </SafeAreaProvider>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  } as ViewStyle,

  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.primary,
    padding: Theme.spacing.xl,
  } as ViewStyle,

  placeholder: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  } as ViewStyle,

  placeholderText: {
    width: '100%',
    height: 20,
    backgroundColor: Theme.colors.neutral[200],
    borderRadius: Theme.borderRadius.base,
    marginBottom: Theme.spacing.base,
  } as ViewStyle,
};
