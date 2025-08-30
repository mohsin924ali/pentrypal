/**
 * Jest Setup File
 *
 * This file configures the Jest testing environment for the React Native app.
 */

import '@testing-library/jest-native/extend-expect';

// Mock React Native modules that don't work well in Jest
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Global test timeout
jest.setTimeout(30000);

// Suppress console warnings during tests
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    args[0]?.includes?.('Warning: componentWillMount has been renamed')
  ) {
    return;
  }
  originalWarn(...args);
};
