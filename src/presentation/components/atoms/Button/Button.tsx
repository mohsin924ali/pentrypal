// ========================================
// Button Component - Interactive Button with Variants
// ========================================

import React, { type FC } from 'react';
import { ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../providers/ThemeProvider';
import { Typography } from '../Typography/Typography';
import type { ButtonImageIcon, ButtonProps } from '../../../../shared/types/ui';

/**
 * Button Component
 *
 * Accessible, interactive button with multiple variants and sizes
 * Supports loading states, icons, and full width layout
 */
export const Button: FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  testID,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  children,
  ...rest
}) => {
  const { theme } = useTheme();

  // Helper function to render icons
  const renderIcon = (icon: typeof leftIcon, position: 'left' | 'right') => {
    if (!icon || loading) return null;

    const isImageIcon = (icon as ButtonImageIcon).type === 'image';
    const marginStyle =
      position === 'left' ? { marginRight: theme.spacing.sm } : { marginLeft: theme.spacing.sm };

    if (isImageIcon) {
      const imageIcon = icon as ButtonImageIcon;
      const iconSize = imageIcon.size ?? (size === 'lg' ? 20 : size === 'md' ? 18 : 16);

      return (
        <Image
          source={imageIcon.source}
          style={[
            {
              width: iconSize,
              height: iconSize,
              tintColor: imageIcon.tintColor ?? variantStyles.text.color,
            },
            marginStyle,
          ]}
          resizeMode='contain'
        />
      );
    } else {
      // Handle regular icon font
      const iconProps = icon as {
        component: React.ComponentType<{
          name: string;
          size?: number;
          color?: string;
          style?: any;
        }>;
        name: string;
        size?: number;
        color?: string;
      };
      return (
        <iconProps.component
          name={iconProps.name}
          size={iconProps.size}
          color={iconProps.color ?? variantStyles.text.color}
          style={marginStyle}
        />
      );
    }
  };

  // Get variant styles
  const variantStyles = React.useMemo(() => {
    const styles: {
      container: Record<string, any>;
      text: { color: string };
    } = {
      container: {},
      text: { color: theme.colors.text.primary },
    };

    switch (variant) {
      case 'primary':
        styles.container = {
          backgroundColor: disabled ? theme.colors.neutral[300] : theme.colors.primary[500],
          borderWidth: 0,
        };
        styles.text = {
          color: theme.colors.text.onPrimary,
        };
        break;

      case 'secondary':
        styles.container = {
          backgroundColor: disabled ? theme.colors.neutral[100] : theme.colors.secondary[500],
          borderWidth: 0,
        };
        styles.text = {
          color: theme.colors.text.onSecondary,
        };
        break;

      case 'tertiary':
        styles.container = {
          backgroundColor: disabled ? theme.colors.neutral[50] : theme.colors.neutral[100],
          borderWidth: 0,
        };
        styles.text = {
          color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
        };
        break;

      case 'outline':
        styles.container = {
          backgroundColor: 'transparent',
          borderWidth: theme.borders.width.medium,
          borderColor: disabled ? theme.colors.border.primary : theme.colors.primary[500],
        };
        styles.text = {
          color: disabled ? theme.colors.text.disabled : theme.colors.primary[500],
        };
        break;

      case 'ghost':
        styles.container = {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
        styles.text = {
          color: disabled ? theme.colors.text.disabled : theme.colors.primary[500],
        };
        break;

      case 'destructive':
        styles.container = {
          backgroundColor: disabled ? theme.colors.neutral[300] : theme.colors.semantic.error[500],
          borderWidth: 0,
        };
        styles.text = {
          color: theme.colors.text.onPrimary,
        };
        break;

      default:
        styles.container = {
          backgroundColor: theme.colors.primary[500],
          borderWidth: 0,
        };
        styles.text = {
          color: theme.colors.text.onPrimary,
        };
    }

    return styles;
  }, [variant, disabled, theme]);

  // Get size styles
  const sizeStyles = React.useMemo(() => {
    switch (size) {
      case 'xs':
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.borders.radius.sm,
          minHeight: 32,
        };
      case 'sm':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.borders.radius.md,
          minHeight: 40,
        };
      case 'md':
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.borders.radius.lg,
          minHeight: 48,
        };
      case 'lg':
        return {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
          borderRadius: theme.borders.radius.lg,
          minHeight: 56,
        };
      case 'xl':
        return {
          paddingVertical: theme.spacing.xl,
          paddingHorizontal: theme.spacing['2xl'],
          borderRadius: theme.borders.radius.xl,
          minHeight: 64,
        };
      default:
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.borders.radius.lg,
          minHeight: 48,
        };
    }
  }, [size, theme]);

  // Combined container styles
  const containerStyle = React.useMemo(() => {
    const baseStyle = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...sizeStyles,
      ...variantStyles.container,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Add shadow for elevated variants
    if (variant === 'primary' || variant === 'secondary') {
      Object.assign(baseStyle, theme.shadows?.sm || {});
    }

    return baseStyle;
  }, [sizeStyles, variantStyles.container, fullWidth, variant, theme.shadows.sm]);

  // Handle press
  const handlePress = React.useCallback(() => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  // Calculate opacity for disabled/pressed states
  const getOpacity = () => {
    if (disabled) return 0.6;
    if (loading) return 0.8;
    return 1;
  };

  return (
    <TouchableOpacity
      style={[containerStyle, { opacity: getOpacity() }, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      {...rest}>
      {/* Left Icon */}
      {renderIcon(leftIcon, 'left')}

      {/* Loading Indicator */}
      {loading && (
        <ActivityIndicator
          size='small'
          color={variantStyles.text.color}
          style={{ marginRight: Boolean(title) ? theme.spacing.sm : 0 }}
        />
      )}

      {/* Button Text */}
      {Boolean(title || children) && (
        <Typography
          variant='button'
          color={variantStyles.text.color}
          style={{ textAlign: 'center' }}>
          {children ?? title}
        </Typography>
      )}

      {/* Right Icon */}
      {renderIcon(rightIcon, 'right')}
    </TouchableOpacity>
  );
};
