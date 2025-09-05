# LoginScreen Refactoring Plan

## Current State

- **File Size**: 707 lines
- **Mixed Concerns**: Authentication, UI, styles, device management, storage

## Step 1: Extract Styles (Target: -85 lines)

- [ ] `LoginScreen.styles.ts` - All inline styles
- [ ] `baseStyles`, `createThemedStyles` pattern

## Step 2: Extract Custom Hooks (Target: -200 lines)

- [ ] `useBiometricAuth.ts` - Biometric setup and authentication
- [ ] `useDeviceInfo.ts` - Device information collection
- [ ] `useAuthHandlers.ts` - Login logic and error handling
- [ ] `useSecureStorage.ts` - Credential storage operations

## Step 3: Extract Components (Target: -150 lines)

- [ ] `BiometricLoginButton.tsx` - Biometric authentication button
- [ ] `AuthErrorDisplay.tsx` - Error message component
- [ ] `LoginFormFields.tsx` - Form input fields

## Step 4: Extract Utilities (Target: -50 lines)

- [ ] `deviceUtils.ts` - Device info helpers
- [ ] `biometricUtils.ts` - Biometric helper functions
- [ ] `storageUtils.ts` - Secure storage utilities

## Step 5: Refactor Main Component (Target: ~200 lines)

- [ ] Update imports to use extracted parts
- [ ] Remove duplicated code
- [ ] Use hooks and components

## Expected Final Size: ~200-250 lines (65% reduction)
