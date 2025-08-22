/**
 * Button Component
 * Primary button component based on Stitch designs
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { Theme } from '@/shared/theme';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: Theme.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...Theme.shadows.button,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.sm,
        minHeight: 40,
      },
      medium: {
        paddingHorizontal: Theme.spacing.lg,
        paddingVertical: Theme.spacing.base,
        minHeight: 48,
      },
      large: {
        paddingHorizontal: Theme.spacing.xl,
        paddingVertical: Theme.spacing.lg,
        minHeight: Theme.designSpacing.buttonHeight,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: isDisabled
          ? Theme.colors.neutral[300]
          : Theme.colors.primary[500],
      },
      secondary: {
        backgroundColor: isDisabled
          ? Theme.colors.neutral[300]
          : Theme.colors.secondary[500],
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: isDisabled
          ? Theme.colors.neutral[300]
          : Theme.colors.primary[500],
      },
      ghost: {
        backgroundColor: isDisabled
          ? Theme.colors.neutral[100]
          : Theme.colors.neutral[100],
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(isDisabled && { opacity: 0.6 }),
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      small: Theme.typography.buttonSmall,
      medium: Theme.typography.button,
      large: Theme.typography.buttonLarge,
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: {
        color: Theme.colors.text.inverse,
      },
      secondary: {
        color: Theme.colors.text.inverse,
      },
      outline: {
        color: isDisabled
          ? Theme.colors.neutral[400]
          : Theme.colors.primary[500],
      },
      ghost: {
        color: isDisabled
          ? Theme.colors.neutral[400]
          : Theme.colors.text.primary,
      },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? Theme.colors.primary[500]
              : Theme.colors.text.inverse
          }
          style={{ marginRight: Theme.spacing.sm }}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};
