// ========================================
// Register Screen Styles
// ========================================

import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '../../../shared/types/ui';

/**
 * Base styles that don't depend on theme - extracted from original styles object
 */
export const baseStyles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
  } as ViewStyle,

  keyboardAvoidingView: {
    flex: 1,
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  } as ViewStyle,

  // Header
  header: {
    marginBottom: 32,
  } as ViewStyle,

  // Form
  form: {
    flex: 1,
    paddingVertical: 16,
  } as ViewStyle,

  // Name Container
  nameContainer: {
    flexDirection: 'row',
  } as ViewStyle,

  nameField: {
    flex: 1,
  } as ViewStyle,

  // Field Label
  fieldLabel: {
    fontWeight: 'bold',
  } as TextStyle,

  // Gender Dropdown
  genderDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 40,
  } as ViewStyle,

  genderDropdownList: {
    position: 'absolute',
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
    overflow: 'hidden',
  } as ViewStyle,

  genderDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 40,
  } as ViewStyle,

  // Password Strength
  passwordStrengthContainer: {
    marginBottom: 16,
  } as ViewStyle,

  passwordStrengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  strengthBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  } as ViewStyle,

  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
  } as ViewStyle,

  passwordFeedback: {
    marginTop: 4,
  } as ViewStyle,

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  } as ViewStyle,

  checkboxWrapper: {
    marginRight: 12,
    marginTop: 2,
  } as ViewStyle,

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  } as ViewStyle,

  checkmark: {
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 12,
  } as TextStyle,

  termsText: {
    flex: 1,
    marginLeft: 0,
    marginTop: 0,
  } as ViewStyle,

  // Error Container
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  } as ViewStyle,

  // Footer
  footer: {
    paddingTop: 32,
  } as ViewStyle,

  // Common Spacing Styles
  marginTopTiny: {
    marginTop: 2,
  } as ViewStyle,

  marginTopXs: {
    marginTop: 4,
  } as ViewStyle,

  underlineText: {
    textDecorationLine: 'underline',
  } as TextStyle,
});

/**
 * Create themed styles using the provided theme
 */
export const createThemedStyles = (theme: Theme) =>
  StyleSheet.create({
    // Dynamic styles that depend on theme colors
    genderDropdownThemed: {
      borderColor: theme.colors.border.primary,
      backgroundColor: theme.colors.surface.background,
    } as ViewStyle,

    genderDropdownListThemed: {
      borderColor: theme.colors.border.primary,
      backgroundColor: theme.colors.surface.background,
      borderWidth: 2,
    } as ViewStyle,

    errorContainerThemed: {
      backgroundColor: theme.colors.semantic.error[50],
    } as ViewStyle,
  });

/**
 * Create dynamic styles for runtime calculations
 */
export const createDynamicStyles = (theme: Theme) => ({
  // Header title with dynamic spacing
  headerTitle: (marginBottom: number) => ({
    marginBottom,
  }),

  // Header description with dynamic spacing
  headerDescription: (marginBottom: number) => ({
    marginBottom,
  }),

  // Name container with dynamic spacing
  nameContainerDynamic: (marginBottom: number) => ({
    marginBottom,
  }),

  // Name field with dynamic margins
  nameFieldRight: (marginRight: number) => ({
    marginRight,
  }),

  nameFieldLeft: (marginLeft: number) => ({
    marginLeft,
  }),

  // Field label with dynamic spacing
  fieldLabelDynamic: (marginBottom: number) => ({
    marginBottom,
  }),

  // Input containers with dynamic spacing
  inputContainer: (marginBottom: number) => ({
    marginBottom,
  }),

  // Gender dropdown with relative positioning
  genderContainer: (marginBottom: number, zIndex: number, position: 'relative' | 'absolute') => ({
    marginBottom,
    zIndex,
    position,
  }),

  // Password container with dynamic spacing
  passwordContainer: (marginBottom: number) => ({
    marginBottom,
  }),

  // Confirm password container with dynamic spacing
  confirmPasswordContainer: (marginTop: number, marginBottom: number) => ({
    marginTop,
    marginBottom,
  }),

  // Gender dropdown item with dynamic selection
  genderDropdownItemDynamic: (
    backgroundColor: string,
    borderBottomWidth: number,
    borderBottomColor: string
  ) => ({
    backgroundColor,
    borderBottomWidth,
    borderBottomColor,
  }),

  // Strength bar with dynamic color
  strengthBarDynamic: (backgroundColor: string) => ({
    backgroundColor,
  }),

  // Register button with dynamic spacing
  registerButton: (marginTop: number) => ({
    marginTop,
  }),

  // Footer description with dynamic spacing
  footerDescription: (marginBottom: number) => ({
    marginBottom,
  }),
});
