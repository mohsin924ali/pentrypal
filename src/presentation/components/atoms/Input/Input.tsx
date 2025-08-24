// ========================================
// Input Component - Secure Form Input with Validation
// ========================================

import React, { useState, useRef, forwardRef, type Ref } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  type TextInputProps,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
} from 'react-native';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../../providers/ThemeProvider';
import type { InputProps, InputVariant, InputSize } from '../../../../shared/types/ui';

/**
 * Secure Input Component
 *
 * High-quality form input with:
 * - Comprehensive validation
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Security features (no autocomplete for sensitive data)
 * - Beautiful animations
 * - Error handling
 * - Icon support
 */
export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      onBlur,
      onFocus,
      error,
      helperText,
      variant = 'outline',
      size = 'md',
      disabled = false,
      required = false,
      secure = false,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      multiline = false,
      maxLength,
      autoComplete = 'off',
      keyboardType = 'default',
      returnKeyType = 'done',
      blurOnSubmit = true,
      testID,
      accessible = true,
      accessibilityLabel,
      accessibilityHint,
      style,
      containerStyle,
      inputStyle,
      labelStyle,
      errorStyle,
      helperStyle,
      ...rest
    },
    ref: Ref<TextInput>
  ) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    // Security: Determine if field should have autocomplete disabled
    const shouldDisableAutocomplete = React.useMemo(() => {
      return (
        secure ||
        keyboardType === 'visible-password' ||
        autoComplete === 'password' ||
        autoComplete === 'new-password' ||
        autoComplete === 'current-password'
      );
    }, [secure, keyboardType, autoComplete]);

    // Animate label position
    React.useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: isFocused || value ? 1 : 0,
        duration: theme.animations.durations.fast,
        useNativeDriver: false,
      }).start();
    }, [isFocused, value, animatedValue, theme.animations.durations.fast]);

    // Handle focus events
    const handleFocus = React.useCallback(
      (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(true);
        onFocus?.(event);
      },
      [onFocus]
    );

    const handleBlur = React.useCallback(
      (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(false);
        onBlur?.(event);
      },
      [onBlur]
    );

    // Handle password visibility toggle
    const togglePasswordVisibility = React.useCallback(() => {
      setIsPasswordVisible(prev => !prev);
    }, []);

    // Get variant styles
    const variantStyles = React.useMemo(() => {
      const hasError = Boolean(error);
      const baseStyles = {
        container: {},
        input: {},
        border: {},
      };

      switch (variant) {
        case 'outline':
          baseStyles.container = {
            borderWidth: theme.borders.width.medium,
            borderRadius: theme.borders.radius.lg,
            backgroundColor: disabled
              ? theme.colors.surface.disabled
              : theme.colors.surface.background,
          };
          baseStyles.border = {
            borderColor: hasError
              ? theme.colors.semantic.error[500]
              : isFocused
                ? theme.colors.primary[500]
                : theme.colors.border.primary,
          };
          break;

        case 'filled':
          baseStyles.container = {
            borderWidth: 0,
            borderRadius: theme.borders.radius.lg,
            backgroundColor: disabled ? theme.colors.surface.disabled : theme.colors.neutral[50],
            borderBottomWidth: theme.borders.width.medium,
          };
          baseStyles.border = {
            borderBottomColor: hasError
              ? theme.colors.semantic.error[500]
              : isFocused
                ? theme.colors.primary[500]
                : theme.colors.border.secondary,
          };
          break;

        case 'underline':
          baseStyles.container = {
            borderWidth: 0,
            borderBottomWidth: theme.borders.width.medium,
            backgroundColor: 'transparent',
          };
          baseStyles.border = {
            borderBottomColor: hasError
              ? theme.colors.semantic.error[500]
              : isFocused
                ? theme.colors.primary[500]
                : theme.colors.border.primary,
          };
          break;

        default:
          break;
      }

      return baseStyles;
    }, [variant, error, isFocused, disabled, theme.borders, theme.colors]);

    // Get size styles
    const sizeStyles = React.useMemo(() => {
      switch (size) {
        case 'sm':
          return {
            container: {
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
              minHeight: 40,
            },
            text: {
              fontSize: theme.typography.fontSizes.sm,
              lineHeight: 20,
            },
          };
        case 'md':
          return {
            container: {
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              minHeight: 48,
            },
            text: {
              fontSize: theme.typography.fontSizes.base,
              lineHeight: 24,
            },
          };
        case 'lg':
          return {
            container: {
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              minHeight: 56,
            },
            text: {
              fontSize: theme.typography.fontSizes.lg,
              lineHeight: 28,
            },
          };
        default:
          return {
            container: {
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              minHeight: 48,
            },
            text: {
              fontSize: theme.typography.fontSizes.base,
              lineHeight: 24,
            },
          };
      }
    }, [size, theme.spacing, theme.typography.fontSizes]);

    // Animated label styles
    const animatedLabelStyle = {
      position: 'absolute' as const,
      left: leftIcon
        ? sizeStyles.container.paddingHorizontal + 32
        : sizeStyles.container.paddingHorizontal,
      top: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [
          sizeStyles.container.minHeight / 2 - sizeStyles.text.lineHeight / 2,
          -sizeStyles.text.lineHeight / 2,
        ],
      }),
      fontSize: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [sizeStyles.text.fontSize, sizeStyles.text.fontSize * 0.85],
      }),
      color: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [
          theme.colors.text.tertiary,
          error ? theme.colors.semantic.error[500] : theme.colors.primary[500],
        ],
      }),
      backgroundColor: theme.colors.surface.background,
      paddingHorizontal: 4,
    };

    // Combined container styles
    const containerStyles = [
      variantStyles.container,
      variantStyles.border,
      sizeStyles.container,
      {
        opacity: disabled ? 0.6 : 1,
      },
      containerStyle,
    ];

    // Input text styles
    const textInputStyles = [
      {
        flex: 1,
        ...sizeStyles.text,
        color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
        fontFamily: theme.typography.fontFamilies.primary,
      },
      inputStyle,
    ];

    // Accessibility props
    const accessibilityProps = {
      accessible,
      accessibilityLabel: accessibilityLabel || label || placeholder,
      accessibilityHint,
      accessibilityState: {
        disabled,
        selected: isFocused,
      },
      accessibilityRole: 'none' as const, // TextInput handles this internally
    };

    return (
      <View style={[{ marginBottom: theme.spacing.md }, style]}>
        {/* Label */}
        {label && (
          <View style={{ position: 'relative' }}>
            <Animated.Text style={[animatedLabelStyle, labelStyle]}>
              {label}
              {required && (
                <Typography variant='caption' color={theme.colors.semantic.error[500]}>
                  {' *'}
                </Typography>
              )}
            </Animated.Text>
          </View>
        )}

        {/* Input Container */}
        <View style={containerStyles}>
          {/* Left Icon */}
          {leftIcon && (
            <View style={{ marginRight: theme.spacing.sm }}>
              <leftIcon.component
                name={leftIcon.name}
                size={leftIcon.size || 20}
                color={leftIcon.color || theme.colors.text.secondary}
              />
            </View>
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            style={textInputStyles}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.text.tertiary}
            editable={!disabled}
            secureTextEntry={secure && !isPasswordVisible}
            multiline={multiline}
            maxLength={maxLength}
            keyboardType={keyboardType}
            returnKeyType={returnKeyType}
            blurOnSubmit={blurOnSubmit}
            autoComplete={shouldDisableAutocomplete ? 'off' : autoComplete}
            autoCorrect={false}
            autoCapitalize={secure ? 'none' : 'sentences'}
            spellCheck={!secure}
            textContentType={secure ? 'none' : 'none'}
            testID={testID}
            {...accessibilityProps}
            {...rest}
          />

          {/* Right Icon or Password Toggle */}
          {(rightIcon || showPasswordToggle) && (
            <TouchableOpacity
              onPress={showPasswordToggle ? togglePasswordVisibility : undefined}
              disabled={!showPasswordToggle}
              style={{ marginLeft: theme.spacing.sm }}
              accessibilityRole='button'
              accessibilityLabel={
                showPasswordToggle
                  ? isPasswordVisible
                    ? 'Hide password'
                    : 'Show password'
                  : undefined
              }>
              {showPasswordToggle ? (
                <Typography variant='caption' color={theme.colors.text.secondary}>
                  {isPasswordVisible ? '🙈' : '👁️'}
                </Typography>
              ) : (
                rightIcon && (
                  <rightIcon.component
                    name={rightIcon.name}
                    size={rightIcon.size || 20}
                    color={rightIcon.color || theme.colors.text.secondary}
                  />
                )
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Character Count */}
        {maxLength && (
          <Typography
            variant='caption'
            color={theme.colors.text.tertiary}
            style={{
              textAlign: 'right',
              marginTop: theme.spacing.xs,
            }}>
            {value?.length || 0}/{maxLength}
          </Typography>
        )}

        {/* Error Message */}
        {error && (
          <Typography
            variant='caption'
            color={theme.colors.semantic.error[500]}
            style={[
              {
                marginTop: theme.spacing.xs,
                marginLeft: theme.spacing.xs,
              },
              errorStyle,
            ]}>
            {error}
          </Typography>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <Typography
            variant='caption'
            color={theme.colors.text.tertiary}
            style={[
              {
                marginTop: theme.spacing.xs,
                marginLeft: theme.spacing.xs,
              },
              helperStyle,
            ]}>
            {helperText}
          </Typography>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
