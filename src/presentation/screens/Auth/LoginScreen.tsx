// ========================================
// Login Screen - Refactored with Extracted Components
// ========================================

import React, { type FC } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button/Button';
import { LoadingScreen } from '../../components/atoms/LoadingScreen/LoadingScreen';
import { GradientBackground } from '../../components/atoms/GradientBackground';
import { AuthErrorDisplay, BiometricLoginButton, LoginFormFields } from './components';

// Hooks
import { useTheme } from '../../providers/ThemeProvider';
import { useForm } from '../../hooks/useForm';
import { useAuthHandlers, useBiometricAuth, useDeviceInfo, useSecureStorage } from './hooks';

// Validation
import { type LoginFormData, loginSchema } from '../../../shared/validation';

// Styles
import { baseStyles, createThemedStyles } from './LoginScreen.styles';

// Utils
import { shouldOfferBiometricSetup } from './utils';

// ========================================
// Props Interface
// ========================================

export interface LoginScreenProps {
  readonly onNavigateToRegister: () => void;
  readonly onNavigateToForgotPassword: () => void;
  readonly onLoginSuccess: () => void;
}

/**
 * Login Screen Component - Refactored
 *
 * Secure authentication screen with:
 * - Email/phone and password authentication
 * - Biometric authentication (Face ID/Touch ID)
 * - Comprehensive form validation
 * - Security monitoring
 * - Accessibility compliance
 * - Beautiful animations
 */
export const LoginScreen: FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onNavigateToForgotPassword,
  onLoginSuccess,
}) => {
  const { theme } = useTheme();
  const themedStyles = createThemedStyles(theme);

  // Custom hooks
  const { isBiometricAvailable, biometricType, handleBiometricLogin } = useBiometricAuth();
  const { getDeviceInfo } = useDeviceInfo();
  const { lastLoginEmail, storeUserForBiometric } = useSecureStorage();
  const { auth, handleEmailLogin, handleForgotPassword, handleRegisterNavigation } =
    useAuthHandlers(
      onNavigateToRegister,
      onNavigateToForgotPassword,
      isBiometricAvailable,
      biometricType,
      lastLoginEmail
    );

  // Form management
  const { isValid, getFieldProps, handleSubmit } = useForm<LoginFormData>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema: loginSchema,
    validateOnBlur: true,
    validateOnChange: false,
  });

  // ========================================
  // Handlers
  // ========================================

  const onSubmitForm = handleSubmit(async (values: LoginFormData) => {
    const deviceInfo = getDeviceInfo(isBiometricAvailable);

    await handleEmailLogin(
      values,
      deviceInfo,
      onLoginSuccess,
      shouldOfferBiometricSetup(isBiometricAvailable, !!lastLoginEmail, values.rememberMe || false)
        ? storeUserForBiometric
        : undefined
    );
  });

  const onBiometricLogin = () => {
    handleBiometricLogin(lastLoginEmail, onLoginSuccess);
  };

  // ========================================
  // Render
  // ========================================

  if (auth.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <GradientBackground>
      <SafeAreaView style={baseStyles.container}>
        <KeyboardAvoidingView
          style={baseStyles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            style={baseStyles.scrollView}
            contentContainerStyle={baseStyles.scrollContent}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={baseStyles.header}>
              <Typography variant='h2' align='center'>
                Welcome Back
              </Typography>
              <Typography
                variant='body2'
                color={theme.colors.text.secondary}
                align='center'
                style={{ marginTop: theme.spacing.sm }}>
                Sign in with your email or phone number to continue
              </Typography>
            </View>

            {/* Main Form */}
            <View
              style={[
                baseStyles.form,
                {
                  backgroundColor: 'transparent',
                  borderRadius: 20,
                  padding: 24,
                  marginHorizontal: 4,
                  marginVertical: 8,
                },
              ]}>
              {/* Form Title */}
              <Typography variant='h3' align='center' style={{ marginBottom: theme.spacing.md }}>
                Sign In
              </Typography>

              {/* Form Fields */}
              <LoginFormFields
                emailFieldProps={getFieldProps('email')}
                passwordFieldProps={getFieldProps('password')}
              />

              {/* Error Display */}
              <AuthErrorDisplay error={auth.error} />

              {/* Login Button Row */}
              <View style={[baseStyles.loginButtonRow, { marginTop: theme.spacing.sm }]}>
                <Button
                  title='Sign In'
                  variant='primary'
                  size='sm'
                  leftIcon={{
                    type: 'image',
                    source: require('../../../assets/images/login.png'),
                    size: 20,
                  }}
                  onPress={onSubmitForm}
                  loading={auth.isLoggingIn}
                  disabled={!isValid || auth.isLoggingIn}
                  style={baseStyles.signInButton}
                  testID='login-submit-button'
                  accessibilityLabel='Sign in button'
                  accessibilityHint='Tap to sign in with email or phone and password'
                />

                {/* Biometric Login Button */}
                {isBiometricAvailable && (
                  <BiometricLoginButton
                    onPress={onBiometricLogin}
                    disabled={auth.isLoggingIn}
                    biometricType={biometricType}
                  />
                )}
              </View>

              {/* Forgot Password */}
              <Button
                title='Forgot Password?'
                variant='ghost'
                size='sm'
                fullWidth
                onPress={handleForgotPassword}
                style={{ marginTop: theme.spacing.md }}
                testID='forgot-password-button'
                accessibilityLabel='Forgot password button'
                accessibilityHint='Tap to reset your password via email or phone'
              />

              {/* Sign Up Link */}
              <View style={baseStyles.signUpContainer}>
                <Typography variant='body2' color={theme.colors.text.secondary} align='center'>
                  Don&apos;t have an account?{' '}
                  <Typography
                    variant='body2'
                    color={theme.colors.primary[500]}
                    onPress={handleRegisterNavigation}
                    style={baseStyles.linkText}
                    testID='register-navigation-link'>
                    Sign Up
                  </Typography>
                </Typography>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};
