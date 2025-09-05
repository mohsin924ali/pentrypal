// ========================================
// Authentication Utilities
// ========================================

import type { DeviceInfo } from '../../../../shared/types/auth';

/**
 * Create a demo biometric signature
 */
export const createBiometricSignature = (): string => {
  return `biometric_${Date.now()}_${Math.random()}`;
};

/**
 * Create a demo signature for testing
 */
export const createDemoSignature = (): string => {
  return `demo_biometric_${Date.now()}_${Math.random()}`;
};

/**
 * Check if biometric login should be offered to user
 */
export const shouldOfferBiometricSetup = (
  isBiometricAvailable: boolean,
  hasLastLoginEmail: boolean,
  rememberMe: boolean
): boolean => {
  return isBiometricAvailable && !hasLastLoginEmail && rememberMe;
};

/**
 * Get display text for biometric type
 */
export const getBiometricDisplayText = (biometricType: string | null): string => {
  if (!biometricType) return 'Biometric';
  return biometricType;
};

/**
 * Check if device meets security requirements
 */
export const validateDeviceInfo = (deviceInfo: DeviceInfo): boolean => {
  return !!(deviceInfo.deviceId && deviceInfo.platform && deviceInfo.osVersion);
};
