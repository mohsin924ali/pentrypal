/**
 * App Flow Screen
 * Main screen flow controller for onboarding and authentication
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import { useAppSelector, useAppDispatch } from '@/application/store/hooks';
import { selectIsAuthenticated } from '@/application/store/slices/authSlice';
import { showToast } from '@/application/store/slices/uiSlice';
import { resetAllAppData } from '@/infrastructure/services/authService';

// Import screens
import { OnboardingScreen } from '../Onboarding';
import {
  WelcomeScreen,
  SignUpScreen,
  LoginScreen,
  SignUpData,
  LoginData,
} from '../Auth';

type AppFlowState =
  | 'onboarding'
  | 'welcome'
  | 'signup'
  | 'login'
  | 'authenticated';

export const AppFlowScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [flowState, setFlowState] = useState<AppFlowState>('onboarding');

  // Reset all app data when component mounts
  useEffect(() => {
    console.log('🚀 App starting - resetting all data...');
    resetAllAppData();
  }, []);

  // Navigation handlers
  const handleOnboardingComplete = useCallback(() => {
    setFlowState('welcome');
  }, []);

  const handleOnboardingSkip = useCallback(() => {
    setFlowState('welcome');
  }, []);

  const handleSignUpPress = useCallback(() => {
    setFlowState('signup');
  }, []);

  const handleLoginPress = useCallback(() => {
    setFlowState('login');
  }, []);

  const handleBackToWelcome = useCallback(() => {
    setFlowState('welcome');
  }, []);

  // Authentication handlers
  const handleSignUp = useCallback(
    async (data: SignUpData) => {
      try {
        // TODO: Implement actual sign up logic in Task 5
        console.log('Sign up data:', data);

        dispatch(
          showToast({
            message: 'Account created successfully!',
            type: 'success',
          }),
        );

        // For now, just show success message
        // In Task 5, this will integrate with Firebase Auth
      } catch (error) {
        dispatch(
          showToast({
            message: 'Failed to create account. Please try again.',
            type: 'error',
          }),
        );
      }
    },
    [dispatch],
  );

  const handleLogin = useCallback(
    async (data: LoginData) => {
      try {
        // TODO: Implement actual login logic in Task 5
        console.log('Login data:', data);

        dispatch(
          showToast({
            message: 'Login successful!',
            type: 'success',
          }),
        );

        // For now, just show success message
        // In Task 5, this will integrate with Firebase Auth
      } catch (error) {
        dispatch(
          showToast({
            message: 'Login failed. Please check your credentials.',
            type: 'error',
          }),
        );
      }
    },
    [dispatch],
  );

  const handleForgotPassword = useCallback(() => {
    // TODO: Implement forgot password flow in Task 5
    dispatch(
      showToast({
        message: 'Forgot password feature coming soon!',
        type: 'info',
      }),
    );
  }, [dispatch]);

  // If user is authenticated, show main app (placeholder for now)
  if (isAuthenticated) {
    return (
      <View style={styles.container}>
        {/* TODO: Replace with main app navigation in Task 6 */}
        <View style={styles.placeholder}>
          <Typography
            variant="h2"
            color={Theme.colors.text.primary}
            align="center"
          >
            Welcome to PentryPal!
          </Typography>
          <Typography
            variant="body"
            color={Theme.colors.text.secondary}
            align="center"
            style={{ marginTop: 16 }}
          >
            Main app navigation will be implemented in Task 6
          </Typography>
        </View>
      </View>
    );
  }

  // Render appropriate screen based on flow state
  switch (flowState) {
    case 'onboarding':
      return (
        <OnboardingScreen
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      );

    case 'welcome':
      return (
        <WelcomeScreen
          onSignUpPress={handleSignUpPress}
          onLoginPress={handleLoginPress}
        />
      );

    case 'signup':
      return (
        <SignUpScreen
          onSignUp={handleSignUp}
          onLoginPress={handleLoginPress}
          onBackPress={handleBackToWelcome}
        />
      );

    case 'login':
      return (
        <LoginScreen
          onLogin={handleLogin}
          onSignUpPress={handleSignUpPress}
          onForgotPasswordPress={handleForgotPassword}
          onBackPress={handleBackToWelcome}
        />
      );

    default:
      return (
        <WelcomeScreen
          onSignUpPress={handleSignUpPress}
          onLoginPress={handleLoginPress}
        />
      );
  }
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  } as ViewStyle,

  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.designSpacing.screenPadding,
  } as ViewStyle,
};
