// ========================================
// Secure Storage Hook
// ========================================

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../application/store';
import { updateSecuritySettings } from '../../../../application/store/slices/authSlice';

export interface SecureStorageHook {
  lastLoginEmail: string;
  storeUserForBiometric: (email: string) => Promise<void>;
  loadLastLoginEmail: () => Promise<void>;
}

export const useSecureStorage = (): SecureStorageHook => {
  const dispatch = useDispatch<AppDispatch>();
  const [lastLoginEmail, setLastLoginEmail] = useState<string>('');

  const loadLastLoginEmail = async () => {
    try {
      // In production, load from secure storage
      // const email = await SecureStorage.getItem('last_login_email');
      // setLastLoginEmail(email || '');
    } catch (error) {
      console.warn('Failed to load last login email:', error);
    }
  };

  const storeUserForBiometric = async (email: string) => {
    try {
      // In production, store in secure storage
      // await SecureStorage.setItem('last_login_email', email);
      setLastLoginEmail(email);

      // Update Redux store to indicate biometric is enabled
      dispatch(updateSecuritySettings({ isBiometricEnabled: true }));
    } catch (error) {
      console.error('Failed to store user for biometric:', error);
      throw error;
    }
  };

  // Load email on mount
  useEffect(() => {
    loadLastLoginEmail();
  }, []);

  return {
    lastLoginEmail,
    storeUserForBiometric,
    loadLastLoginEmail,
  };
};
