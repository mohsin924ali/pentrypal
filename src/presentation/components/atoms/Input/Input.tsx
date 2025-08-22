/**
 * Input Component
 * Text input component based on Stitch designs
 */

import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Theme } from '@/shared/theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | undefined;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  variant = 'outlined',
  size = 'medium',
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: Theme.borderRadius.base,
      borderWidth: 2,
      flexDirection: 'row',
      alignItems: 'center',
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: Theme.spacing.sm,
        paddingVertical: Theme.spacing.xs,
        minHeight: 40,
      },
      medium: {
        paddingHorizontal: Theme.spacing.base,
        paddingVertical: Theme.spacing.sm,
        minHeight: 48,
      },
      large: {
        paddingHorizontal: Theme.spacing.lg,
        paddingVertical: Theme.spacing.base,
        minHeight: 56,
      },
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
      filled: {
        backgroundColor: Theme.colors.background.tertiary,
        borderColor: 'transparent',
      },
      outlined: {
        backgroundColor: Theme.colors.background.primary,
        borderColor: error
          ? Theme.colors.error[500]
          : isFocused
            ? Theme.colors.primary[500]
            : Theme.colors.border.light,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getInputStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      small: Theme.typography.bodySmall,
      medium: Theme.typography.body,
      large: Theme.typography.bodyLarge,
    };

    return {
      ...sizeStyles[size],
      flex: 1,
      color: Theme.colors.text.primary,
      ...inputStyle,
    };
  };

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  return (
    <View style={containerStyle}>
      {/* Label */}
      {label && (
        <Text
          style={[
            {
              ...Theme.typography.label,
              color: Theme.colors.text.primary,
              marginBottom: Theme.spacing.xs,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View style={getContainerStyle()}>
        {/* Left Icon */}
        {leftIcon && (
          <View style={{ marginRight: Theme.spacing.sm }}>{leftIcon}</View>
        )}

        {/* Text Input */}
        <TextInput
          style={getInputStyle()}
          placeholderTextColor={Theme.colors.text.tertiary}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Right Icon / Secure Toggle */}
        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity
            onPress={secureTextEntry ? toggleSecureEntry : undefined}
            style={{ marginLeft: Theme.spacing.sm }}
            disabled={!secureTextEntry}
          >
            {secureTextEntry ? (
              <Text style={{ color: Theme.colors.text.tertiary }}>
                {isSecure ? '👁️' : '🙈'}
              </Text>
            ) : (
              rightIcon
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text
          style={[
            {
              ...Theme.typography.caption,
              color: Theme.colors.error[500],
              marginTop: Theme.spacing.xs,
            },
            errorStyle,
          ]}
        >
          {error}
        </Text>
      )}

      {/* Hint Message */}
      {hint && !error && (
        <Text
          style={[
            {
              ...Theme.typography.caption,
              color: Theme.colors.text.tertiary,
              marginTop: Theme.spacing.xs,
            },
          ]}
        >
          {hint}
        </Text>
      )}
    </View>
  );
};
