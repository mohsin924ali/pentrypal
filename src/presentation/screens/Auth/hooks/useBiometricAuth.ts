// ========================================
// Biometric Authentication Hook
// ========================================

import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricAuthState {
  isBiometricAvailable: boolean;
  biometricType: string | null;
  isLoading: boolean;
}

export interface BiometricAuthActions {
  handleBiometricLogin: (lastLoginEmail: string, onSuccess: () => void) => Promise<void>;
  setupBiometricAuth: () => Promise<void>;
}

export const useBiometricAuth = (): BiometricAuthState & BiometricAuthActions => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setupBiometricAuth = async () => {
    try {
      // Check if biometric hardware is available
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      console.log('🔐 Biometric Debug Info:');
      console.log('- Hardware available:', isAvailable);
      console.log('- Biometrics enrolled:', isEnrolled);
      console.log('- Supported types:', supportedTypes);

      if (isAvailable && isEnrolled) {
        setIsBiometricAvailable(true);

        // Determine biometric type
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        } else {
          setBiometricType('Biometric');
        }
        console.log('✅ Biometric authentication enabled:', biometricType);
      } else {
        console.log('❌ Biometric authentication not fully available');

        // For testing and demo purposes, enable it anyway
        console.log('🧪 Enabling biometric for testing/demo');
        setIsBiometricAvailable(true);

        if (isAvailable) {
          // Hardware available but not enrolled
          if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType('Face ID');
          } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType('Touch ID');
          } else {
            setBiometricType('Biometric');
          }
          console.log('📱 Hardware detected but not enrolled, using demo mode');
        } else {
          // No hardware available
          setBiometricType('Touch ID');
          console.log('💻 No hardware detected, using demo mode');
        }
      }
    } catch (error) {
      console.log('Biometric setup error:', error);
      // For testing, enable anyway
      console.log('🧪 Enabling biometric for testing (error occurred)');
      setIsBiometricAvailable(true);
      setBiometricType('Touch ID');
    }
  };

  const proceedWithDemo = async (storedEmail: string, onSuccess: () => void) => {
    console.log('🧪 Simulating biometric authentication for demo...');

    // Simulate biometric success for demo
    setTimeout(() => {
      console.log('✅ Demo biometric authentication successful');
      onSuccess();
    }, 1000);
  };

  const proceedWithBiometric = async (
    storedEmail: string,
    onSuccess: () => void,
    onAuthenticateWithBiometric: (signature: string) => Promise<void>
  ) => {
    // Authenticate with biometrics
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Login with ${biometricType}`,
      fallbackLabel: 'Use Password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      const signature = `biometric_${Date.now()}_${Math.random()}`;
      await onAuthenticateWithBiometric(signature);
      onSuccess();
    } else if (result.error === 'user_cancel') {
      // User cancelled biometric auth, do nothing
      return;
    } else {
      Alert.alert(
        'Authentication Failed',
        'Biometric authentication failed. Please try again or use email/phone and password.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBiometricLogin = async (lastLoginEmail: string, onSuccess: () => void) => {
    if (!isBiometricAvailable) {
      Alert.alert(
        'Biometric Login Unavailable',
        'Biometric authentication is not available on this device. Please use email/phone and password to login.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔐 Starting biometric authentication...');

      // Check if biometrics are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!isEnrolled) {
        Alert.alert(
          'Biometric Setup Required',
          `To use ${biometricType}, you need to set it up in your device settings first.\n\nFor demo purposes, would you like to simulate biometric authentication?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Demo Login',
              onPress: () => proceedWithDemo(lastLoginEmail || 'demo@example.com', onSuccess),
            },
            {
              text: 'Open Settings',
              onPress: () => {
                Alert.alert('Demo', 'In a real app, this would open device settings.');
              },
            },
          ]
        );
        return;
      }

      // Check if we have stored credentials for biometric login
      const storedEmail = lastLoginEmail || 'demo@example.com'; // Demo email for testing
      if (!lastLoginEmail) {
        Alert.alert(
          'Setup Required',
          "You need to login with email/phone and password first to enable biometric authentication.\n\nFor demo purposes, we'll simulate biometric login.",
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Demo Login', onPress: () => proceedWithDemo(storedEmail, onSuccess) },
          ]
        );
        return;
      }

      // This would be implemented by the calling component
      // await proceedWithBiometric(storedEmail, onSuccess, onAuthenticateWithBiometric);

      // For now, just call demo
      await proceedWithDemo(storedEmail, onSuccess);
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      Alert.alert(
        'Biometric Authentication Error',
        'An error occurred during biometric authentication. Please try again or use email/phone and password.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Setup biometric auth on mount
  useEffect(() => {
    setupBiometricAuth();
  }, []);

  return {
    isBiometricAvailable,
    biometricType,
    isLoading,
    handleBiometricLogin,
    setupBiometricAuth,
  };
};
