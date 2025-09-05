// ========================================
// Login Form Fields Component - Email/Phone & Password
// ========================================

import React from 'react';
import { View } from 'react-native';
import { Typography } from '../../../components/atoms/Typography/Typography';
import { Input } from '../../../components/atoms/Input/Input';
import { useTheme } from '../../../providers/ThemeProvider';
import { baseStyles } from '../LoginScreen.styles';

interface LoginFormFieldsProps {
  emailFieldProps: any;
  passwordFieldProps: any;
}

export const LoginFormFields: React.FC<LoginFormFieldsProps> = ({
  emailFieldProps,
  passwordFieldProps,
}) => {
  const { theme } = useTheme();

  return (
    <>
      {/* Email or Phone Field */}
      <View style={{ marginBottom: theme.spacing.sm }}>
        <Typography
          variant='body2'
          color={theme.colors.text.secondary}
          style={[baseStyles.fieldLabel, { marginBottom: theme.spacing.xs }]}>
          Email or Phone Number
        </Typography>
        <Input
          placeholder='Enter your email or phone number'
          keyboardType='default'
          autoCapitalize='none'
          autoComplete='username'
          returnKeyType='next'
          size='sm'
          {...emailFieldProps}
          testID='login-email-input'
          accessibilityLabel='Email or phone number input'
          accessibilityHint='Enter your email address or phone number to sign in'
        />
      </View>

      {/* Password Field */}
      <View style={{ marginBottom: theme.spacing.sm }}>
        <Typography
          variant='body2'
          color={theme.colors.text.secondary}
          style={[baseStyles.fieldLabel, { marginBottom: theme.spacing.xs }]}>
          Password
        </Typography>
        <Input
          placeholder='Enter your password'
          secureTextEntry
          autoCapitalize='none'
          autoComplete='current-password'
          returnKeyType='done'
          size='sm'
          showPasswordToggle
          {...passwordFieldProps}
          testID='login-password-input'
          accessibilityLabel='Password input'
          accessibilityHint='Enter your account password'
        />
      </View>
    </>
  );
};
