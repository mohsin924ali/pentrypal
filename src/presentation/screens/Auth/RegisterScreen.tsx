// ========================================
// Register Screen - Secure User Registration
// ========================================

import React, { useState, useEffect, type FC } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as LocalAuthentication from 'expo-local-authentication';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button/Button';
import { Input } from '../../components/atoms/Input/Input';
import { LoadingScreen } from '../../components/atoms/LoadingScreen/LoadingScreen';
import { PhoneNumberInput, type Country } from '../../components/molecules/PhoneNumberInput';
import { SuccessModal } from '../../components/molecules/SuccessModal';

// Hooks and Utils
import { useTheme } from '../../providers/ThemeProvider';
import { useForm } from '../../hooks/useForm';
import {
  registerSchema,
  type RegisterFormData,
  getPasswordStrength,
} from '../../../shared/validation';

// Store
import {
  registerUser,
  selectAuth,
  clearError,
  updateSecuritySettings,
} from '../../../application/store/slices/authSlice';
import type { AppDispatch, RootState } from '../../../application/store';

// Types
import type { DeviceInfo } from '../../../infrastructure/services/IAuthService';

// ========================================
// Props Interface
// ========================================

export interface RegisterScreenProps {
  readonly onNavigateToLogin: () => void;
  readonly onRegistrationSuccess: () => void;
}

/**
 * Register Screen Component
 *
 * Comprehensive registration screen with:
 * - Multi-step form validation
 * - Password strength indicator
 * - Terms acceptance
 * - Security monitoring
 * - Accessibility compliance
 * - Real-time validation feedback
 */
export const RegisterScreen: FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegistrationSuccess,
}) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => selectAuth(state));

  // Local state
  const [showPassword, setShowPassword] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  // Local state
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  // Local state for UI interactions
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState({
    title: '',
    message: '',
    requiresEmailVerification: false,
  });

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
    setValue,
  } = useForm<RegisterFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      countryCode: 'US',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      gender: '' as any,
      acceptTerms: false,
      marketingConsent: false,
    },
    validationSchema: registerSchema,
    validateOnBlur: true,
    validateOnChange: false,
  });

  // ========================================
  // Biometric Setup
  // ========================================

  useEffect(() => {
    setupBiometricAuth();
  }, []);

  const setupBiometricAuth = async () => {
    try {
      // Check if biometric hardware is available
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

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
      } else {
        setIsBiometricAvailable(false);
      }
    } catch (error) {
      console.log('Biometric setup error:', error);
      setIsBiometricAvailable(false);
    }
  };

  // ========================================
  // Password Strength Monitoring
  // ========================================

  useEffect(() => {
    const password = fields.password.value;
    if (password) {
      const strength = getPasswordStrength(password);
      setPasswordStrength(strength);
      setShowPasswordStrength(true);
    } else {
      setShowPasswordStrength(false);
    }
  }, [fields.password.value]);

  // ========================================
  // Device Info
  // ========================================

  const getDeviceInfo = (): DeviceInfo => ({
    deviceId: 'device_' + Math.random().toString(36).substr(2, 9),
    platform: Platform.OS,
    osVersion: Platform.Version.toString(),
    appVersion: '1.0.0',
    userAgent: `PentryPal/1.0.0 (${Platform.OS} ${Platform.Version})`,
  });

  // ========================================
  // Registration Completion Handler
  // ========================================

  const handleRegistrationComplete = (email: string) => {
    // Ask user if they want to enable biometric authentication
    if (isBiometricAvailable) {
      Alert.alert(
        'Enable Biometric Login',
        `Would you like to enable ${biometricType} for secure and convenient login?`,
        [
          { text: 'Skip', onPress: () => onRegistrationSuccess() },
          {
            text: 'Enable',
            onPress: async () => {
              try {
                // Update Redux store to indicate biometric is enabled
                dispatch(updateSecuritySettings({ isBiometricEnabled: true }));
                Alert.alert(
                  'Biometric Login Enabled',
                  `${biometricType} has been enabled for your account. You can now use it to login quickly and securely.`,
                  [{ text: 'OK', onPress: onRegistrationSuccess }]
                );
              } catch (error) {
                console.error('Failed to enable biometric login:', error);
                onRegistrationSuccess();
              }
            },
          },
        ]
      );
    } else {
      onRegistrationSuccess();
    }
  };

  // ========================================
  // Registration Handler
  // ========================================

  const handleRegistration = handleSubmit(async (values: RegisterFormData) => {
    try {
      // Additional client-side validation
      if (!values.acceptTerms) {
        Alert.alert(
          'Terms Required',
          'You must accept the Terms of Service and Privacy Policy to create an account.',
          [{ text: 'OK' }]
        );
        return;
      }

      const deviceInfo = getDeviceInfo();

      const result = await dispatch(
        registerUser({
          ...values,
          deviceInfo,
        })
      ).unwrap();

      if (result.success) {
        setSuccessModalData({
          title: 'Account Created Successfully!',
          message: result.requiresEmailVerification
            ? "We've sent a verification link to your email address. Please check your inbox and click the link, then login with your credentials."
            : 'Your account has been created successfully. Please login with your credentials.',
          requiresEmailVerification: result.requiresEmailVerification || false,
        });
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error.code === 'EMAIL_ALREADY_EXISTS') {
        setError('email', 'An account with this email already exists');
        Alert.alert(
          'Email Already Registered',
          'An account with this email address already exists. Please use a different email or try logging in.',
          [
            { text: 'Login Instead', onPress: onNavigateToLogin },
            { text: 'OK', style: 'cancel' },
          ]
        );
      } else if (error.code === 'WEAK_PASSWORD') {
        setError('password', 'Password does not meet security requirements');
      } else if (error.code === 'INVALID_EMAIL') {
        setError('email', 'Please enter a valid email address');
      } else if (error.code === 'REGISTRATION_BLOCKED') {
        Alert.alert(
          'Registration Blocked',
          'Your registration has been blocked for security reasons. Please contact support if you believe this is an error.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Registration Failed',
          error.message || 'An unexpected error occurred. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  });

  // ========================================
  // UI Handlers
  // ========================================

  const handlePhoneNumberChange = (phoneNumber: string) => {
    setValue('phoneNumber', phoneNumber);
  };

  const handleCountryChange = (country: Country) => {
    setValue('countryCode', country.code);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    resetForm();
    dispatch(clearError());
    onNavigateToLogin();
  };

  const handleLoginNavigation = () => {
    resetForm();
    dispatch(clearError());
    onNavigateToLogin();
  };

  const handleTermsPress = () => {
    Alert.alert(
      'Terms of Service',
      'You will be redirected to view our Terms of Service and Privacy Policy.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'View Terms',
          onPress: () => {
            // TODO: Open terms in WebView or browser
            console.log('Open terms of service');
          },
        },
      ]
    );
  };

  // Clear errors on component mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Navigate on successful registration
  useEffect(() => {
    if (auth.isAuthenticated) {
      onRegistrationSuccess();
    }
  }, [auth.isAuthenticated, onRegistrationSuccess]);

  // Show loading screen during registration
  if (auth.isRegistering) {
    return <LoadingScreen />;
  }

  // ========================================
  // Password Strength Indicator
  // ========================================

  const renderPasswordStrength = () => {
    if (!showPasswordStrength) return null;

    const getStrengthColor = (score: number) => {
      if (score <= 1) return theme.colors.semantic.error[500];
      if (score <= 2) return theme.colors.semantic.warning[500];
      if (score <= 3) return theme.colors.secondary[500];
      return theme.colors.semantic.success[500];
    };

    const getStrengthText = (score: number) => {
      if (score <= 1) return 'Weak';
      if (score <= 2) return 'Fair';
      if (score <= 3) return 'Good';
      return 'Strong';
    };

    return (
      <View style={styles.passwordStrengthContainer}>
        <View style={styles.passwordStrengthHeader}>
          <Typography variant='caption' color={theme.colors.text.secondary}>
            Password Strength:
          </Typography>
          <Typography
            variant='caption'
            color={getStrengthColor(passwordStrength.score)}
            weight='semiBold'>
            {getStrengthText(passwordStrength.score)}
          </Typography>
        </View>

        {/* Strength Bars */}
        <View style={styles.strengthBars}>
          {[1, 2, 3, 4, 5].map(level => (
            <View
              key={level}
              style={[
                styles.strengthBar,
                {
                  backgroundColor:
                    level <= passwordStrength.score
                      ? getStrengthColor(passwordStrength.score)
                      : theme.colors.neutral[200],
                },
              ]}
            />
          ))}
        </View>

        {/* Feedback */}
        {passwordStrength.feedback.length > 0 && (
          <View style={styles.passwordFeedback}>
            {passwordStrength.feedback.map((feedback, index) => (
              <Typography
                key={index}
                variant='caption'
                color={theme.colors.text.tertiary}
                style={{ marginTop: 2 }}>
                • {feedback}
              </Typography>
            ))}
          </View>
        )}
      </View>
    );
  };

  // ========================================
  // Render
  // ========================================

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.background }]}>
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
              Create Account
            </Typography>

            <Typography
              variant='body1'
              color={theme.colors.text.secondary}
              align='center'
              style={{ marginBottom: theme.spacing.xl }}>
              Join PentryPal to manage your groceries smarter
            </Typography>
          </View>

          {/* Registration Form */}
          <View style={styles.form}>
            {/* Name Fields */}
            <View style={styles.nameContainer}>
              <View style={[styles.nameField, { marginRight: theme.spacing.sm }]}>
                <Typography
                  variant='body2'
                  color={theme.colors.text.primary}
                  style={{ marginBottom: theme.spacing.sm, fontWeight: '600' }}>
                  First Name *
                </Typography>
                <Input
                  placeholder='First name'
                  autoComplete='given-name'
                  returnKeyType='next'
                  size='md'
                  {...getFieldProps('firstName')}
                  testID='register-firstName-input'
                  accessibilityLabel='First name input'
                />
                {fields.firstName.error && fields.firstName.touched && (
                  <Typography
                    variant='caption'
                    color={theme.colors.semantic.error[500]}
                    style={{ marginTop: 4 }}>
                    {fields.firstName.error}
                  </Typography>
                )}
              </View>

              <View style={[styles.nameField, { marginLeft: theme.spacing.sm }]}>
                <Typography
                  variant='body2'
                  color={theme.colors.text.primary}
                  style={{ marginBottom: theme.spacing.sm, fontWeight: '600' }}>
                  Last Name *
                </Typography>
                <Input
                  placeholder='Last name'
                  autoComplete='family-name'
                  returnKeyType='next'
                  size='md'
                  {...getFieldProps('lastName')}
                  testID='register-lastName-input'
                  accessibilityLabel='Last name input'
                />
                {fields.lastName.error && fields.lastName.touched && (
                  <Typography
                    variant='caption'
                    color={theme.colors.semantic.error[500]}
                    style={{ marginTop: 4 }}>
                    {fields.lastName.error}
                  </Typography>
                )}
              </View>
            </View>

            {/* Email Input */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <Typography
                variant='body2'
                color={theme.colors.text.primary}
                style={{ marginBottom: theme.spacing.sm, fontWeight: '600' }}>
                Email Address *
              </Typography>
              <Input
                placeholder='Enter your email address'
                keyboardType='email-address'
                autoComplete='email'
                returnKeyType='next'
                size='md'
                {...getFieldProps('email')}
                testID='register-email-input'
                accessibilityLabel='Email address input'
                accessibilityHint='Enter your email address'
              />
              {fields.email.error && fields.email.touched && (
                <Typography
                  variant='caption'
                  color={theme.colors.semantic.error[500]}
                  style={{ marginTop: 4 }}>
                  {fields.email.error}
                </Typography>
              )}
            </View>

            {/* Phone Number Input */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <Typography
                variant='body2'
                color={theme.colors.text.primary}
                style={{ marginBottom: theme.spacing.sm, fontWeight: '600' }}>
                Phone Number *
              </Typography>
              <PhoneNumberInput
                countryCode={fields.countryCode.value}
                phoneNumber={fields.phoneNumber.value}
                onChangeCountry={handleCountryChange}
                onChangePhoneNumber={handlePhoneNumberChange}
                placeholder='Enter your phone number'
                error={
                  fields.phoneNumber.error && fields.phoneNumber.touched
                    ? fields.phoneNumber.error
                    : undefined
                }
                testID='register-phone-input'
                accessibilityLabel='Phone number input'
              />
            </View>

            {/* Gender Dropdown */}
            <View style={{ marginBottom: theme.spacing.lg, zIndex: 1000, position: 'relative' }}>
              <Typography
                variant='body2'
                color={theme.colors.text.primary}
                style={{ marginBottom: theme.spacing.sm, fontWeight: '600' }}>
                Gender *
              </Typography>
              <TouchableOpacity
                style={[
                  styles.genderDropdown,
                  {
                    borderColor: theme.colors.border.primary,
                    backgroundColor: theme.colors.surface.background,
                  },
                ]}
                onPress={() => {
                  setShowGenderDropdown(!showGenderDropdown);
                }}
                testID='gender-dropdown'
                accessibilityLabel='Gender selection dropdown'>
                <Typography
                  variant='body2'
                  color={
                    fields.gender.value ? theme.colors.text.primary : theme.colors.text.tertiary
                  }>
                  {fields.gender.value
                    ? {
                        male: 'Male',
                        female: 'Female',
                        other: 'Other',
                        'prefer-not-to-say': 'Prefer not to say',
                      }[fields.gender.value] || 'Select gender'
                    : 'Select gender'}
                </Typography>
                <Typography variant='h6' color={theme.colors.text.secondary}>
                  ▼
                </Typography>
              </TouchableOpacity>

              {showGenderDropdown && (
                <View
                  style={[
                    styles.genderDropdownList,
                    {
                      borderColor: theme.colors.border.primary,
                      backgroundColor: theme.colors.surface.background,
                      borderWidth: 2,
                    },
                  ]}>
                  {[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
                  ].map((option, index, array) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.genderDropdownItem,
                        {
                          backgroundColor:
                            fields.gender.value === option.value
                              ? theme.colors.primary[100]
                              : theme.colors.surface.background,
                          borderBottomWidth: index === array.length - 1 ? 0 : 1,
                          borderBottomColor: theme.colors.border.primary,
                        },
                      ]}
                      onPress={() => {
                        setValue('gender', option.value as any);
                        setShowGenderDropdown(false);
                      }}
                      testID={`gender-option-${option.value}`}>
                      <Typography
                        variant='body2'
                        color={
                          fields.gender.value === option.value
                            ? theme.colors.primary[600]
                            : theme.colors.text.primary
                        }>
                        {option.label}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {fields.gender.error && fields.gender.touched && (
                <Typography
                  variant='caption'
                  color={theme.colors.semantic.error[500]}
                  style={{ marginTop: 4 }}>
                  {fields.gender.error}
                </Typography>
              )}
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: theme.spacing.sm }}>
              <Typography
                variant='body2'
                color={theme.colors.text.primary}
                style={{ marginBottom: theme.spacing.sm, fontWeight: '600' }}>
                Password *
              </Typography>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.colors.border.primary,
                  borderRadius: theme.borders.radius.md,
                  paddingHorizontal: theme.spacing.md,
                  backgroundColor: theme.colors.surface.background,
                  minHeight: 42,
                }}>
                <TextInput
                  placeholder='Create a strong password'
                  secureTextEntry={!showPassword}
                  autoComplete='new-password'
                  returnKeyType='next'
                  value={getFieldProps('password').value}
                  onChangeText={text => {
                    console.log('🔍 PASSWORD INPUT DEBUG:');
                    console.log('- New password text:', JSON.stringify(text));
                    console.log('- Text length:', text.length);
                    getFieldProps('password').onChangeText(text);
                  }}
                  onBlur={() => {
                    console.log('🔍 PASSWORD BLUR DEBUG:');
                    console.log(
                      '- Password value on blur:',
                      JSON.stringify(getFieldProps('password').value)
                    );
                    console.log('- About to trigger validation...');
                    getFieldProps('password').onBlur();
                  }}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: theme.colors.text.primary,
                    paddingVertical: theme.spacing.sm,
                  }}
                  placeholderTextColor={theme.colors.text.tertiary}
                  testID='register-password-input'
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

            {/* Password Strength Indicator */}
            {renderPasswordStrength()}

            {/* Confirm Password Input */}
            <View style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
              <Typography
                variant='body2'
                color={theme.colors.text.primary}
                style={{ marginBottom: theme.spacing.sm, fontWeight: '600' }}>
                Confirm Password *
              </Typography>
              <Input
                placeholder='Confirm your password'
                secure
                autoComplete='new-password'
                returnKeyType='done'
                size='md'
                {...getFieldProps('confirmPassword')}
                testID='register-confirmPassword-input'
                accessibilityLabel='Confirm password input'
                accessibilityHint='Re-enter your password to confirm'
              />
            </View>

            {/* Terms Acceptance */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                onPress={() => setValue('acceptTerms', !fields.acceptTerms.value)}
                style={styles.checkboxWrapper}
                testID='accept-terms-checkbox'>
                <View style={[styles.checkbox, fields.acceptTerms.value && styles.checkboxChecked]}>
                  {fields.acceptTerms.value && (
                    <Typography
                      variant='body2'
                      color={theme.colors.surface.background}
                      style={styles.checkmark}>
                      ✓
                    </Typography>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.termsText}>
                <Typography variant='body2' color={theme.colors.text.secondary}>
                  I accept the{' '}
                  <Typography
                    variant='body2'
                    color={theme.colors.primary[500]}
                    onPress={handleTermsPress}
                    style={{ textDecorationLine: 'underline' }}>
                    Terms of Service
                  </Typography>{' '}
                  and{' '}
                  <Typography
                    variant='body2'
                    color={theme.colors.primary[500]}
                    onPress={handleTermsPress}
                    style={{ textDecorationLine: 'underline' }}>
                    Privacy Policy
                  </Typography>
                </Typography>
              </View>
            </View>

            {/* Marketing Consent */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                onPress={() => setValue('marketingConsent', !fields.marketingConsent.value)}
                style={styles.checkboxWrapper}
                testID='marketing-consent-checkbox'>
                <View
                  style={[
                    styles.checkbox,
                    fields.marketingConsent.value && styles.checkboxChecked,
                  ]}>
                  {fields.marketingConsent.value && (
                    <Typography
                      variant='body2'
                      color={theme.colors.surface.background}
                      style={styles.checkmark}>
                      ✓
                    </Typography>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.termsText}>
                <Typography variant='body2' color={theme.colors.text.secondary}>
                  I would like to receive marketing emails about new features and updates (optional)
                </Typography>
              </View>
            </View>

            {/* Error Display */}
            {auth.error && (
              <View
                style={[
                  styles.errorContainer,
                  { backgroundColor: theme.colors.semantic.error[50] },
                ]}>
                <Typography variant='body2' color={theme.colors.semantic.error[700]} align='center'>
                  {auth.error}
                </Typography>
              </View>
            )}

            {/* Debug Info */}
            <View
              style={{
                marginBottom: theme.spacing.md,
                padding: theme.spacing.sm,
                backgroundColor: theme.colors.surface.background,
                borderRadius: 4,
              }}>
              <Typography variant='caption' color={theme.colors.text.secondary}>
                Debug: Valid: {isValid ? 'Yes' : 'No'} | Terms:{' '}
                {fields.acceptTerms.value ? 'Yes' : 'No'} | Errors: {hasErrors ? 'Yes' : 'No'}
              </Typography>
              {hasErrors && (
                <Typography
                  variant='caption'
                  color={theme.colors.semantic.error[500]}
                  style={{ marginTop: 4 }}>
                  Errors:{' '}
                  {Object.entries(fields)
                    .filter(([key, field]) => field.error)
                    .map(([key, field]) => `${key}: ${field.error}`)
                    .join(', ')}
                </Typography>
              )}
            </View>

            {/* Debug Info */}
            {__DEV__ && (
              <View
                style={{ marginTop: theme.spacing.md, padding: 10, backgroundColor: '#f0f0f0' }}>
                <Typography variant='caption' color='#666'>
                  Debug: isValid={isValid.toString()}, acceptTerms=
                  {fields.acceptTerms.value.toString()}, gender="{fields.gender.value}"
                </Typography>
              </View>
            )}

            {/* Register Button */}
            <Button
              title='Create Account'
              variant='primary'
              size='lg'
              fullWidth
              onPress={handleRegistration}
              loading={auth.isRegistering}
              disabled={!isValid || !fields.acceptTerms.value || auth.isRegistering}
              style={{ marginTop: theme.spacing.lg }}
              testID='register-submit-button'
              accessibilityLabel='Create account button'
              accessibilityHint='Tap to create your new account'
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Typography
              variant='body2'
              color={theme.colors.text.secondary}
              align='center'
              style={{ marginBottom: theme.spacing.sm }}>
              Already have an account?
            </Typography>

            <Button
              title='Sign In'
              variant='outline'
              size='lg'
              fullWidth
              leftIcon={{
                type: 'image',
                source: require('../../../assets/images/login.png'),
                size: 18,
              }}
              onPress={handleLoginNavigation}
              testID='login-navigation-button'
              accessibilityLabel='Sign in button'
              accessibilityHint='Navigate to login screen'
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title={successModalData.title}
        message={successModalData.message}
        primaryButtonText='Go to Login'
        primaryButtonIcon={{
          type: 'image',
          source: require('../../../assets/images/login.png'),
          size: 16,
        }}
        onPrimaryPress={handleSuccessModalClose}
        onDismiss={handleSuccessModalClose}
        icon='🎉'
        testID='registration-success-modal'
      />
    </SafeAreaView>
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
    paddingVertical: 16,
  },
  nameContainer: {
    flexDirection: 'row' as const,
    marginBottom: 20,
  },
  nameField: {
    flex: 1,
  },
  genderDropdown: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 42,
  },
  genderDropdownList: {
    position: 'absolute' as const,
    top: 44,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    overflow: 'hidden' as const,
  },
  genderDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 40,
  },
  passwordStrengthContainer: {
    marginBottom: 16,
  },
  passwordStrengthHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  strengthBars: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  passwordFeedback: {
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 16,
  },
  checkboxWrapper: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    lineHeight: 12,
  },
  termsText: {
    flex: 1,
    marginLeft: 0,
    marginTop: 0,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  footer: {
    paddingTop: 32,
  },
};
