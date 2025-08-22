/**
 * Sign Up Screen
 * User registration screen with form validation
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  ViewStyle,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/shared/theme';
import { Typography } from '@/presentation/components/atoms/Typography';
import { Button } from '@/presentation/components/atoms/Button';
import { Input } from '@/presentation/components/atoms/Input';

interface SignUpScreenProps {
  onSignUp: (data: SignUpData) => void;
  onLoginPress: () => void;
  onBackPress: () => void;
  loading?: boolean;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSignUp,
  onLoginPress,
  onBackPress,
  loading = false,
}) => {
  const [formData, setFormData] = useState<SignUpData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<SignUpData>>({});
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpData> = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (formData.password !== confirmPassword) {
      newErrors.password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = () => {
    if (validateForm()) {
      onSignUp(formData);
    }
  };

  const updateFormData = (field: keyof SignUpData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Typography variant="body" color={Theme.colors.text.secondary}>
                ← Back
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Title */}
            <View style={styles.titleSection}>
              <Typography
                variant="h1"
                color={Theme.colors.text.primary}
                align="center"
                style={styles.title}
              >
                Create Account
              </Typography>

              <Typography
                variant="body"
                color={Theme.colors.text.secondary}
                align="center"
                style={styles.subtitle}
              >
                Join PentryPal and start organizing your shopping lists
              </Typography>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.nameRow}>
                <Input
                  label="First Name"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChangeText={value => updateFormData('firstName', value)}
                  error={errors.firstName}
                  containerStyle={styles.nameInput}
                  autoCapitalize="words"
                  textContentType="givenName"
                />

                <Input
                  label="Last Name"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChangeText={value => updateFormData('lastName', value)}
                  error={errors.lastName}
                  containerStyle={styles.nameInput}
                  autoCapitalize="words"
                  textContentType="familyName"
                />
              </View>

              <Input
                label="Email"
                placeholder="Enter your email address"
                value={formData.email}
                onChangeText={value => updateFormData('email', value)}
                error={errors.email}
                containerStyle={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
              />

              <Input
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={value => updateFormData('password', value)}
                error={errors.password}
                containerStyle={styles.input}
                secureTextEntry
                textContentType="newPassword"
                hint="Must be at least 8 characters"
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                containerStyle={styles.input}
                secureTextEntry
                textContentType="newPassword"
              />
            </View>

            {/* Sign Up Button */}
            <Button
              title="Create Account"
              variant="primary"
              size="large"
              fullWidth
              onPress={handleSignUp}
              loading={loading}
              style={styles.signUpButton}
            />

            {/* Login Link */}
            <View style={styles.loginSection}>
              <Typography
                variant="body"
                color={Theme.colors.text.secondary}
                align="center"
              >
                Already have an account?{' '}
              </Typography>
              <TouchableOpacity
                onPress={onLoginPress}
                accessibilityRole="button"
                accessibilityLabel="Go to login"
              >
                <Typography
                  variant="body"
                  color={Theme.colors.primary[500]}
                  style={styles.loginLink}
                >
                  Log In
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  } as ViewStyle,

  keyboardAvoid: {
    flex: 1,
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    flexGrow: 1,
  } as ViewStyle,

  header: {
    paddingHorizontal: Theme.designSpacing.screenPadding,
    paddingTop: Theme.spacing.base,
  } as ViewStyle,

  backButton: {
    paddingVertical: Theme.spacing.sm,
    alignSelf: 'flex-start',
  } as ViewStyle,

  content: {
    flex: 1,
    paddingHorizontal: Theme.designSpacing.screenPadding,
    paddingBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  titleSection: {
    marginTop: Theme.spacing['2xl'],
    marginBottom: Theme.spacing['3xl'],
  } as ViewStyle,

  title: {
    marginBottom: Theme.spacing.base,
  } as ViewStyle,

  subtitle: {
    // No additional styles needed
  } as ViewStyle,

  form: {
    marginBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  nameRow: {
    flexDirection: 'row',
    gap: Theme.spacing.base,
  } as ViewStyle,

  nameInput: {
    flex: 1,
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  input: {
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  signUpButton: {
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,

  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  loginLink: {
    fontWeight: '600',
  } as ViewStyle,
};
