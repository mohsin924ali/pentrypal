// ========================================
// LoginScreen Styles
// ========================================

import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../../shared/types/ui';

// ========================================
// Base Styles (Theme Independent)
// ========================================

export const baseStyles = StyleSheet.create({
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 16,
    resizeMode: 'contain',
  } as ImageStyle,

  appIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  } as ViewStyle,

  biometricContainer: {
    marginTop: 16,
  } as ViewStyle,

  biometricIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  biometricIconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  } as ViewStyle,

  biometricText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  } as TextStyle,

  container: {
    flex: 1,
  } as ViewStyle,

  fieldLabel: {
    fontWeight: 'bold',
  } as TextStyle,

  fingerprintImage: {
    width: 28,
    height: 28,
  } as ImageStyle,

  footer: {
    paddingTop: 32,
  } as ViewStyle,

  form: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  } as ViewStyle,

  header: {
    marginBottom: 32,
  } as ViewStyle,

  keyboardAvoidingView: {
    flex: 1,
  } as ViewStyle,

  linkText: {
    textDecorationLine: 'underline',
  } as TextStyle,

  loginButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  signInButton: {
    flex: 1,
  } as ViewStyle,

  signUpContainer: {
    marginTop: 24,
    alignItems: 'center',
  } as ViewStyle,
});

// ========================================
// Themed Styles (Theme Dependent)
// ========================================

export const createThemedStyles = (theme: Theme) => ({
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: theme.colors.semantic.error[50],
  } as ViewStyle,

  biometricIconButtonThemed: {
    backgroundColor: theme.colors.surface.background,
    borderColor: theme.colors.border.primary,
  } as ViewStyle,

  fingerprintImageThemed: {
    tintColor: theme.colors.primary[500],
  } as ImageStyle,
});

// ========================================
// Dynamic Styles (Runtime Dependent)
// ========================================

export const createDynamicStyles = ({ isLoading }: { isLoading: boolean }) => ({
  biometricIconDisabled: {
    opacity: isLoading ? 0.5 : 1,
  } as ViewStyle,
});
