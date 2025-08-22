/**
 * Login Screen
 * User authentication screen with form validation
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  ViewStyle,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/shared/theme';
import { Typography } from '@/presentation/components/atoms/Typography';
import { Button } from '@/presentation/components/atoms/Button';
import { Input } from '@/presentation/components/atoms/Input';

// Import app logo
const appLogo = require('../../../../assets/icon.png');

interface LoginScreenProps {
  onLogin: (data: LoginData) => void;
  onSignUpPress: () => void;
  onForgotPasswordPress: () => void;
  onBackPress: () => void;
  loading?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onSignUpPress,
  onForgotPasswordPress,
  onBackPress,
  loading = false,
}) => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Partial<LoginData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validateForm()) {
      onLogin(formData);
    }
  };

  const updateFormData = (field: keyof LoginData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof Partial<LoginData>]) {
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
            {/* App Logo */}
            <View style={styles.logoSection}>
              <Image
                source={appLogo}
                style={styles.logo}
                resizeMode="contain"
                accessibilityRole="image"
                accessibilityLabel="PentryPal app logo"
              />
            </View>

            {/* Title */}
            <View style={styles.titleSection}>
              <Typography
                variant="h1"
                color={Theme.colors.text.primary}
                align="center"
                style={styles.title}
              >
                Welcome Back
              </Typography>

              <Typography
                variant="body"
                color={Theme.colors.text.secondary}
                align="center"
                style={styles.subtitle}
              >
                Sign in to your PentryPal account
              </Typography>
            </View>

            {/* Form */}
            <View style={styles.form}>
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
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={value => updateFormData('password', value)}
                error={errors.password}
                containerStyle={styles.input}
                secureTextEntry
                textContentType="password"
              />

              {/* Forgot Password Link */}
              <TouchableOpacity
                onPress={onForgotPasswordPress}
                style={styles.forgotPassword}
                accessibilityRole="button"
                accessibilityLabel="Forgot password"
              >
                <Typography
                  variant="body"
                  color={Theme.colors.primary[500]}
                  align="right"
                >
                  Forgot Password?
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Button
              title="Log In"
              variant="primary"
              size="large"
              fullWidth
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            {/* Sign Up Link */}
            <View style={styles.signUpSection}>
              <Typography
                variant="body"
                color={Theme.colors.text.secondary}
                align="center"
              >
                Don't have an account?{' '}
              </Typography>
              <TouchableOpacity
                onPress={onSignUpPress}
                accessibilityRole="button"
                accessibilityLabel="Go to sign up"
              >
                <Typography
                  variant="body"
                  color={Theme.colors.primary[500]}
                  style={styles.signUpLink}
                >
                  Sign Up
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
    justifyContent: 'center',
  } as ViewStyle,

  logoSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing['3xl'],
  } as ViewStyle,

  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  } as ViewStyle,

  titleSection: {
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

  input: {
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  forgotPassword: {
    alignSelf: 'flex-end',
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.base,
  } as ViewStyle,

  loginButton: {
    marginBottom: Theme.spacing.xl,
  } as ViewStyle,

  signUpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  signUpLink: {
    fontWeight: '600',
  } as ViewStyle,
};
