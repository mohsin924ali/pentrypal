/**
 * Component mocks for testing
 */

import React from 'react';

// Mock React Native components
export const mockComponents = {
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  Image: 'Image',
  TextInput: 'TextInput',
  Modal: 'Modal',
  ActivityIndicator: 'ActivityIndicator',
  Switch: 'Switch',
  Picker: 'Picker',
};

// Mock third-party components
export const mockThirdPartyComponents = {
  // React Navigation
  NavigationContainer: ({ children }: { children: React.ReactNode }) =>
    children,
  createStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children,
  }),

  // Safe Area Context
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,

  // Vector Icons
  Icon: 'Icon',

  // Fast Image
  FastImage: 'FastImage',

  // Gesture Handler
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) =>
    children,
  PanGestureHandler: ({ children }: { children: React.ReactNode }) => children,

  // Reanimated
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    ScrollView: 'Animated.ScrollView',
  },
};

// Mock hooks
export const mockHooks = {
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
  }),

  useRoute: () => ({
    key: 'test-route',
    name: 'TestScreen',
    params: {},
  }),

  useFocusEffect: (callback: () => void) => {
    React.useEffect(callback, []);
  },

  useIsFocused: () => true,

  useSafeAreaInsets: () => ({
    top: 44,
    right: 0,
    bottom: 34,
    left: 0,
  }),

  useKeyboard: () => ({
    keyboardShown: false,
    keyboardHeight: 0,
  }),
};

// Animation mocks
export const mockAnimations = {
  timing: jest.fn(() => ({
    start: jest.fn(callback => callback && callback()),
  })),

  spring: jest.fn(() => ({
    start: jest.fn(callback => callback && callback()),
  })),

  decay: jest.fn(() => ({
    start: jest.fn(callback => callback && callback()),
  })),

  Value: jest.fn(() => ({
    setValue: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    interpolate: jest.fn(() => ({
      setValue: jest.fn(),
    })),
  })),
};

// Platform mock
export const mockPlatform = {
  OS: 'ios',
  Version: '15.0',
  select: jest.fn(obj => obj.ios || obj.default),
  isPad: false,
  isTVOS: false,
  isTV: false,
};

// Dimensions mock
export const mockDimensions = {
  get: jest.fn(() => ({
    width: 375,
    height: 812,
    scale: 3,
    fontScale: 1,
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Alert mock
export const mockAlert = {
  alert: jest.fn(),
  prompt: jest.fn(),
};

// Linking mock
export const mockLinking = {
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Permissions mock
export const mockPermissions = {
  check: jest.fn(() => Promise.resolve('granted')),
  request: jest.fn(() => Promise.resolve('granted')),
  requestMultiple: jest.fn(() => Promise.resolve({})),
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
  },
};
