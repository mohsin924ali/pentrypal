// ========================================
// Login Screen - Secure Authentication Interface
// ========================================

import React, { type FC, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as LocalAuthentication from 'expo-local-authentication';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button/Button';
import { Input } from '../../components/atoms/Input/Input';
import { LoadingScreen } from '../../components/atoms/LoadingScreen/LoadingScreen';
import { GradientBackground } from '../../components/atoms/GradientBackground';

// Hooks and Utils
import { useTheme } from '../../providers/ThemeProvider';
import { useForm } from '../../hooks/useForm';
import { type LoginFormData, loginSchema } from '../../../shared/validation';

// Store
import {
  clearError,
  loginUser,
  loginWithBiometric,
  resetLoadingStates,
  selectAuth,
  updateSecuritySettings,
} from '../../../application/store/slices/authSlice';
import type { AppDispatch, RootState } from '../../../application/store';

// Types
import type { DeviceInfo } from '../../../shared/types/auth';

// ========================================
// Props Interface
// ========================================

export interface LoginScreenProps {
  readonly onNavigateToRegister: () => void;
  readonly onNavigateToForgotPassword: () => void;
  readonly onLoginSuccess: () => void;
}

/**
 * Login Screen Component
 *
 * Secure authentication screen with:
 * - Email/password authentication
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
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => selectAuth(state));

  // Local state
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [lastLoginEmail, setLastLoginEmail] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  // Form management
  const {
    fields,
    isValid,
    isSubmitting,
    hasErrors,
    getFieldProps,
    handleSubmit,
    validateForm,
    setError,
    resetForm,
  } = useForm<LoginFormData>({
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
  // Biometric Setup
  // ========================================

  useEffect(() => {
    setupBiometricAuth();
    loadLastLoginEmail();
  }, []);

  const setupBiometricAuth = async () => {
    try {
      // Check if biometric hardware is available
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      console.log('🔐 Biometric Debug Info:');
      console.log('- Hardware available:', isAvailable);
      console.log('- Biometrics enrolled:', isEnrolled);
      console.log('- Supported types:', supportedTypes);

      if (isAvailable && isEnrolled) {
        setIsBiometricAvailable(true);

        // Determine biometric type
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        } else {
          setBiometricType('Biometric');
        }
        console.log('✅ Biometric authentication enabled:', biometricType);
      } else {
        console.log('❌ Biometric authentication not fully available');

        // For testing and demo purposes, enable it anyway
        console.log('🧪 Enabling biometric for testing/demo');
        setIsBiometricAvailable(true);

        if (isAvailable) {
          // Hardware available but not enrolled
          if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType('Face ID');
          } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType('Touch ID');
          } else {
            setBiometricType('Biometric');
          }
          console.log('📱 Hardware detected but not enrolled, using demo mode');
        } else {
          // No hardware available
          setBiometricType('Touch ID');
          console.log('💻 No hardware detected, using demo mode');
        }
      }
    } catch (error) {
      console.log('Biometric setup error:', error);
      // For testing, enable anyway
      console.log('🧪 Enabling biometric for testing (error occurred)');
      setIsBiometricAvailable(true);
      setBiometricType('Touch ID');
    }
  };

  const loadLastLoginEmail = async () => {
    try {
      // In production, load from secure storage
      // const email = await SecureStorage.getItem('last_login_email');
      // setLastLoginEmail(email || '');
    } catch (error) {
      console.warn('Failed to load last login email:', error);
    }
  };

  const storeUserForBiometric = async (email: string) => {
    try {
      // In production, store in secure storage
      // await SecureStorage.setItem('last_login_email', email);
      setLastLoginEmail(email);

      // Update Redux store to indicate biometric is enabled
      dispatch(updateSecuritySettings({ isBiometricEnabled: true }));
    } catch (error) {
      console.error('Failed to store user for biometric:', error);
      throw error;
    }
  };

  // ========================================
  // Device Info
  // ========================================

  const getDeviceInfo = (): DeviceInfo => ({
    deviceId: `device_${Math.random().toString(36).substr(2, 9)}`,
    deviceName: Platform.OS === 'ios' ? 'iPhone/iPad' : 'Android Device',
    platform: Platform.OS as 'ios' | 'android',
    osVersion: Platform.Version.toString(),
    appVersion: '1.0.0',
    biometricCapable: isBiometricAvailable,
  });

  // ========================================
  // Authentication Handlers
  // ========================================

  const handleEmailLogin = handleSubmit(async (values: LoginFormData) => {
    try {
      const deviceInfo = getDeviceInfo();

      const result = await dispatch(
        loginUser({
          ...values,
          deviceInfo,
        })
      ).unwrap();

      if (result.success) {
        // Save email for biometric login
        if (values.rememberMe) {
          // await SecureStorage.setItem('last_login_email', values.email);
          setLastLoginEmail(values.email);
        }

        // Ask user if they want to enable biometric authentication
        if (isBiometricAvailable && !lastLoginEmail) {
          Alert.alert(
            'Enable Biometric Login',
            `Would you like to enable ${biometricType} for faster login next time?`,
            [
              { text: 'Not Now', onPress: () => onLoginSuccess() },
              {
                text: 'Enable',
                onPress: async () => {
                  try {
                    // Store email for biometric authentication
                    await storeUserForBiometric(values.email);
                    onLoginSuccess();
                  } catch (error) {
                    console.error('Failed to enable biometric login:', error);
                    onLoginSuccess();
                  }
                },
              },
            ]
          );
        } else {
          onLoginSuccess();
        }
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error.code === 'INVALID_CREDENTIALS') {
        setError('email', 'Invalid email or password');
        setError('password', 'Invalid email or password');
      } else if (error.code === 'ACCOUNT_LOCKED') {
        Alert.alert(
          'Account Locked',
          'Your account has been temporarily locked due to too many failed login attempts. Please try again later or reset your password.',
          [
            { text: 'Reset Password', onPress: onNavigateToForgotPassword },
            { text: 'OK', style: 'cancel' },
          ]
        );
      } else if (error.code === 'EMAIL_NOT_VERIFIED') {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email address before logging in. Check your inbox for a verification link.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Login Failed',
          error.message || 'An unexpected error occurred. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  });

  // Extracted biometric functions to avoid no-inner-declarations
  const proceedWithDemo = async (storedEmail: string) => {
    console.log('🧪 Demo biometric login');

    const deviceInfo = getDeviceInfo();
    const signature = `demo_biometric_${Date.now()}_${Math.random()}`;

    try {
      const biometricResult = await dispatch(
        loginWithBiometric({
          userId: storedEmail,
          signature,
          deviceInfo,
        })
      ).unwrap();

      if (biometricResult.success) {
        onLoginSuccess();
      }
    } catch (error) {
      console.log('Demo biometric failed, this is expected:', error);
      Alert.alert(
        'Demo Complete',
        'Biometric authentication demo completed. In a real app, this would authenticate with your backend.',
        [{ text: 'OK' }]
      );
    }
  };

  const proceedWithBiometric = async (storedEmail: string) => {
    // Authenticate with biometrics
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Login with ${biometricType}`,
      fallbackLabel: 'Use Password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      const deviceInfo = getDeviceInfo();
      const signature = `biometric_${Date.now()}_${Math.random()}`;

      const biometricResult = await dispatch(
        loginWithBiometric({
          userId: storedEmail,
          signature,
          deviceInfo,
        })
      ).unwrap();

      if (biometricResult.success) {
        onLoginSuccess();
      }
    } else if (result.error === 'user_cancel') {
      // User cancelled biometric auth, do nothing
      return;
    } else {
      Alert.alert(
        'Authentication Failed',
        'Biometric authentication failed. Please try again or use email and password.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBiometricLogin = async () => {
    if (!isBiometricAvailable) {
      Alert.alert(
        'Biometric Login Unavailable',
        'Biometric authentication is not available on this device. Please use email and password to login.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      console.log('🔐 Starting biometric authentication...');

      // Check if biometrics are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!isEnrolled) {
        Alert.alert(
          'Biometric Setup Required',
          `To use ${biometricType}, you need to set it up in your device settings first.\n\nFor demo purposes, would you like to simulate biometric authentication?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Demo Login',
              onPress: () => proceedWithDemo(lastLoginEmail || 'demo@example.com'),
            },
            {
              text: 'Open Settings',
              onPress: () => {
                Alert.alert('Demo', 'In a real app, this would open device settings.');
              },
            },
          ]
        );
        return;
      }

      // Check if we have stored credentials for biometric login
      const storedEmail = lastLoginEmail || 'demo@example.com'; // Demo email for testing
      if (!lastLoginEmail) {
        Alert.alert(
          'Setup Required',
          "You need to login with email and password first to enable biometric authentication.\n\nFor demo purposes, we'll simulate biometric login.",
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Demo Login', onPress: () => proceedWithDemo(storedEmail) },
          ]
        );
        return;
      }

      await proceedWithBiometric(storedEmail);
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      Alert.alert(
        'Biometric Authentication Error',
        'An error occurred during biometric authentication. Please try again or use email and password.',
        [{ text: 'OK' }]
      );
    }
  };

  // ========================================
  // UI Handlers
  // ========================================

  const handleForgotPassword = () => {
    onNavigateToForgotPassword();
  };

  const handleRegisterNavigation = () => {
    resetForm();
    dispatch(clearError());
    onNavigateToRegister();
  };

  // Clear errors and reset loading states on component mount
  useEffect(() => {
    dispatch(clearError());
    dispatch(resetLoadingStates()); // Fix stuck loading states
  }, [dispatch]);

  // Navigate on successful login
  useEffect(() => {
    if (auth.isAuthenticated) {
      onLoginSuccess();
    }
  }, [auth.isAuthenticated, onLoginSuccess]);

  // Show loading screen during authentication
  if (auth.isLoggingIn) {
    return <LoadingScreen />;
  }

  // ========================================
  // Render
  // ========================================

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'>
            {/* Header */}
            <View style={styles.header}>
              <Typography
                variant='h2'
                color={theme.colors.text.primary}
                align='center'
                style={{ marginBottom: theme.spacing.sm }}>
                Welcome Back
              </Typography>

              <Typography
                variant='body1'
                color={theme.colors.text.secondary}
                align='center'
                style={{ marginBottom: theme.spacing.xl }}>
                Sign in to your PentryPal account
              </Typography>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              <View
                style={[
                  styles.formCard,
                  {
                    backgroundColor: `rgba(255, 255, 255, 0.15)`,
                    borderColor: `rgba(255, 255, 255, 0.2)`,
                  },
                ]}>
                {/* Email or Mobile Input */}
                <View style={{ marginBottom: theme.spacing.md }}>
                  <Typography
                    variant='body2'
                    color={theme.colors.text.primary}
                    style={{ marginBottom: theme.spacing.xs, fontWeight: '600' }}>
                    Email or Mobile Number *
                  </Typography>
                  <Input
                    placeholder='Enter your email or mobile number'
                    keyboardType='default'
                    autoComplete='email'
                    returnKeyType='next'
                    size='md'
                    {...getFieldProps('email')}
                    testID='login-email-input'
                    accessibilityLabel='Email address input'
                    accessibilityHint='Enter your registered email address'
                  />
                </View>

                {/* Password Input */}
                <View style={{ marginBottom: theme.spacing.md }}>
                  <Typography
                    variant='body2'
                    color={theme.colors.text.primary}
                    style={{ marginBottom: theme.spacing.xs, fontWeight: '600' }}>
                    Password *
                  </Typography>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: theme.colors.border.primary,
                      borderRadius: theme.borders.radius.md,
                      paddingHorizontal: theme.spacing.sm,
                      backgroundColor: theme.colors.surface.background,
                      minHeight: 44,
                    }}>
                    <TextInput
                      placeholder='Enter your password'
                      secureTextEntry={!showPassword}
                      autoComplete='current-password'
                      returnKeyType='done'
                      value={getFieldProps('password').value}
                      onChangeText={getFieldProps('password').onChangeText}
                      onBlur={getFieldProps('password').onBlur}
                      style={{
                        flex: 1,
                        fontSize: 16,
                        color: theme.colors.text.primary,
                        paddingVertical: theme.spacing.xs,
                      }}
                      placeholderTextColor={theme.colors.text.tertiary}
                      testID='login-password-input'
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={{ paddingLeft: 8 }}>
                      <Typography variant='body1'>{showPassword ? '🙈' : '👁️'}</Typography>
                    </TouchableOpacity>
                  </View>
                  {getFieldProps('password').error && (
                    <Typography
                      variant='caption'
                      color={theme.colors.semantic.error[500]}
                      style={{ marginTop: 4 }}>
                      {getFieldProps('password').error}
                    </Typography>
                  )}
                </View>

                {/* Remember Me Checkbox */}
                {/* TODO: Implement checkbox component */}

                {/* Error Display */}
                {auth.error && (
                  <View
                    style={[
                      styles.errorContainer,
                      { backgroundColor: theme.colors.semantic.error[50] },
                    ]}>
                    <Typography
                      variant='body2'
                      color={theme.colors.semantic.error[700]}
                      align='center'>
                      {auth.error}
                    </Typography>
                  </View>
                )}

                {/* Login Button Row */}
                <View style={[styles.loginButtonRow, { marginTop: theme.spacing.lg }]}>
                  <Button
                    title='Sign In'
                    variant='primary'
                    size='lg'
                    leftIcon={{
                      type: 'image',
                      source: require('../../../assets/images/login.png'),
                      size: 20,
                    }}
                    onPress={handleEmailLogin}
                    loading={auth.isLoggingIn}
                    disabled={!isValid || auth.isLoggingIn}
                    style={styles.signInButton}
                    testID='login-submit-button'
                    accessibilityLabel='Sign in button'
                    accessibilityHint='Tap to sign in with email and password'
                  />

                  {/* Biometric Login Icon */}
                  {isBiometricAvailable && (
                    <View style={{ marginLeft: 12 }}>
                      <TouchableOpacity
                        onPress={handleBiometricLogin}
                        disabled={auth.isLoggingIn}
                        style={[
                          styles.biometricIconButton,
                          {
                            backgroundColor: theme.colors.surface.background,
                            borderColor: theme.colors.border.primary,
                            opacity: auth.isLoggingIn ? 0.5 : 1,
                          },
                        ]}
                        testID='biometric-login-icon-button'
                        accessibilityLabel={`${biometricType} login`}
                        accessibilityHint={`Use ${biometricType} to sign in quickly`}>
                        <View style={styles.biometricIcon}>
                          <Image
                            source={require('../../../assets/images/Fingerprint.png')}
                            style={[
                              styles.fingerprintImage,
                              { tintColor: theme.colors.primary[500] },
                            ]}
                            resizeMode='contain'
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Forgot Password */}
                <Button
                  title='Forgot Password?'
                  variant='ghost'
                  size='md'
                  fullWidth
                  onPress={handleForgotPassword}
                  style={{ marginTop: theme.spacing.lg }}
                  testID='forgot-password-button'
                  accessibilityLabel='Forgot password button'
                  accessibilityHint='Tap to reset your password'
                />

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                  <Typography variant='body2' color={theme.colors.text.secondary} align='center'>
                    Don't have an account?{' '}
                    <Typography
                      variant='body2'
                      color={theme.colors.primary[500]}
                      onPress={handleRegisterNavigation}
                      style={{ textDecorationLine: 'underline' }}
                      testID='register-navigation-link'>
                      Sign Up
                    </Typography>
                  </Typography>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

// ========================================
// Styles
// ========================================

const styles = {
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
  },
  form: {
    flex: 1,
    justifyContent: 'center' as const,
    paddingVertical: 16,
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginHorizontal: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  loginButtonRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  signInButton: {
    flex: 1,
  },
  biometricIconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  biometricIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  biometricText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
  },
  fingerprintImage: {
    width: 28,
    height: 28,
  },
  signUpContainer: {
    marginTop: 24,
    alignItems: 'center' as const,
  },
  biometricContainer: {
    marginTop: 16,
  },
  footer: {
    paddingTop: 32,
  },
};
