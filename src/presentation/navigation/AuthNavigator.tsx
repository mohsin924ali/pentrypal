// ========================================
// Auth Navigator - Authentication Flow Navigation
// ========================================

import React, { type FC } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import { LoginScreen, RegisterScreen } from '../screens/Auth';

// Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: { email?: string };
  ResetPassword: { token: string };
  EmailVerification: { email: string };
  TwoFactorVerification: { sessionId: string };
};

// Props
interface AuthNavigatorProps {
  readonly onAuthSuccess: () => void;
}

// Create stack navigator
const Stack = createStackNavigator<AuthStackParamList>();

/**
 * Auth Navigator Component
 *
 * Handles all authentication-related navigation:
 * - Login flow
 * - Registration flow
 * - Password reset flow
 * - Email verification
 * - Two-factor authentication
 */
export const AuthNavigator: FC<AuthNavigatorProps> = ({ onAuthSuccess }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animationEnabled: true,
        cardStyle: { backgroundColor: 'transparent' },
      }}
      initialRouteName='Login'>
      <Stack.Screen name='Login'>
        {props => (
          <LoginScreen
            {...props}
            onNavigateToRegister={() => props.navigation.navigate('Register')}
            onNavigateToForgotPassword={() => props.navigation.navigate('ForgotPassword', {})}
            onLoginSuccess={onAuthSuccess}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name='Register'>
        {props => (
          <RegisterScreen
            {...props}
            onNavigateToLogin={() => props.navigation.navigate('Login')}
            onRegistrationSuccess={onAuthSuccess}
          />
        )}
      </Stack.Screen>

      {/* TODO: Implement additional auth screens */}
      {/* 
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="TwoFactorVerification" component={TwoFactorVerificationScreen} />
      */}
    </Stack.Navigator>
  );
};
