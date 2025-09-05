// ========================================
// Device Information Hook
// ========================================

import { Platform } from 'react-native';
import type { DeviceInfo } from '../../../../shared/types/auth';

export interface DeviceInfoHook {
  getDeviceInfo: (biometricCapable?: boolean) => DeviceInfo;
}

export const useDeviceInfo = (): DeviceInfoHook => {
  const getDeviceInfo = (biometricCapable: boolean = false): DeviceInfo => ({
    deviceId: `device_${Math.random().toString(36).substr(2, 9)}`,
    deviceName: Platform.OS === 'ios' ? 'iPhone/iPad' : 'Android Device',
    platform: Platform.OS as 'ios' | 'android',
    osVersion: Platform.Version.toString(),
    appVersion: '1.0.0',
    biometricCapable,
  });

  return {
    getDeviceInfo,
  };
};
