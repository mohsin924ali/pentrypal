// ========================================
// Authentication Handlers Hook
// ========================================

import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../application/store';
import {
  clearError,
  loginUser,
  loginWithBiometric,
  resetLoadingStates,
  selectAuth,
} from '../../../../application/store/slices/authSlice';
import type { LoginFormData } from '../../../../shared/validation';
import type { DeviceInfo } from '../../../../shared/types/auth';

export interface AuthHandlersHook {
  auth: ReturnType<typeof selectAuth>;
  handleEmailLogin: (
    values: LoginFormData,
    deviceInfo: DeviceInfo,
    onSuccess: () => void,
    onBiometricSetup?: (email: string) => Promise<void>
  ) => Promise<void>;
  handleBiometricAuthentication: (
    userId: string,
    signature: string,
    deviceInfo: DeviceInfo,
    onSuccess: () => void
  ) => Promise<void>;
  handleForgotPassword: () => void;
  handleRegisterNavigation: () => void;
  clearAuthError: () => void;
  resetAuth: () => void;
}

export const useAuthHandlers = (
  onNavigateToRegister: () => void,
  onNavigateToForgotPassword: () => void,
  isBiometricAvailable: boolean,
  biometricType: string | null,
  lastLoginEmail: string
): AuthHandlersHook => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => selectAuth(state));

  const handleEmailLogin = async (
    values: LoginFormData,
    deviceInfo: DeviceInfo,
    onSuccess: () => void,
    onBiometricSetup?: (email: string) => Promise<void>
  ) => {
    try {
      const result = await dispatch(
        loginUser({
          ...values,
          deviceInfo,
        })
      ).unwrap();

      if (result.success) {
        // Save email for biometric login
        if (values.rememberMe) {
          // This would be handled by secure storage hook
        }

        // Ask user if they want to enable biometric authentication
        if (isBiometricAvailable && !lastLoginEmail && onBiometricSetup) {
          Alert.alert(
            'Enable Biometric Login',
            `Would you like to enable ${biometricType} for faster login next time?`,
            [
              { text: 'Not Now', onPress: () => onSuccess() },
              {
                text: 'Enable',
                onPress: async () => {
                  try {
                    await onBiometricSetup(values.email);
                    onSuccess();
                  } catch (error) {
                    console.error('Failed to enable biometric login:', error);
                    onSuccess();
                  }
                },
              },
            ]
          );
        } else {
          onSuccess();
        }
      }
    } catch (error: any) {
      // Handle specific error cases - this would be handled by form validation in real app
      if (error.code === 'INVALID_CREDENTIALS') {
        Alert.alert('Login Failed', 'Invalid email/phone or password');
      } else if (error.code === 'ACCOUNT_LOCKED') {
        Alert.alert(
          'Account Locked',
          'Your account has been temporarily locked due to too many failed login attempts. Please try again later or reset your password.'
        );
      } else if (error.code === 'NETWORK_ERROR') {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert(
          'Login Failed',
          error.message || 'An unexpected error occurred. Please try again.'
        );
      }
      throw error;
    }
  };

  const handleBiometricAuthentication = async (
    userId: string,
    signature: string,
    deviceInfo: DeviceInfo,
    onSuccess: () => void
  ) => {
    const biometricResult = await dispatch(
      loginWithBiometric({
        userId,
        signature,
        deviceInfo,
      })
    ).unwrap();

    if (biometricResult.success) {
      onSuccess();
    }
  };

  const handleForgotPassword = () => {
    clearAuthError();
    onNavigateToForgotPassword();
  };

  const handleRegisterNavigation = () => {
    clearAuthError();
    onNavigateToRegister();
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const resetAuth = () => {
    dispatch(resetLoadingStates());
  };

  return {
    auth,
    handleEmailLogin,
    handleBiometricAuthentication,
    handleForgotPassword,
    handleRegisterNavigation,
    clearAuthError,
    resetAuth,
  };
};
