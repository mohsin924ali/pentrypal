/**
 * Custom render utilities for React Native Testing Library
 * Provides pre-configured providers and testing utilities
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureStore, Store } from '@reduxjs/toolkit';

// Mock store configuration for testing
const createTestStore = (preloadedState?: any): Store => {
  return configureStore({
    reducer: {
      // Add your reducers here when they're implemented
      auth: (state = { user: null, isAuthenticated: false }, action) => state,
      ui: (state = { theme: 'light', loading: false }, action) => state,
    },
    preloadedState,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: Store;
  initialRouteName?: string;
}

/**
 * Custom render function that wraps components with necessary providers
 */
const customRender = (
  ui: React.ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    initialRouteName = 'Home',
    ...renderOptions
  }: CustomRenderOptions = {},
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <Provider store={store}>
          <NavigationContainer>{children}</NavigationContainer>
        </Provider>
      </SafeAreaProvider>
    );
  };

  return {
    store,
    ...render(ui, { wrapper: AllTheProviders, ...renderOptions }),
  };
};

/**
 * Render function for components that don't need navigation
 */
const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    ...renderOptions
  }: Omit<CustomRenderOptions, 'initialRouteName'> = {},
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <Provider store={store}>{children}</Provider>
      </SafeAreaProvider>
    );
  };

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

/**
 * Render function for testing hooks with providers
 */
const renderHookWithProviders = <T,>(
  hook: () => T,
  {
    preloadedState,
    store = createTestStore(preloadedState),
  }: Omit<CustomRenderOptions, 'initialRouteName'> = {},
) => {
  const { renderHook } = require('@testing-library/react-hooks');

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <Provider store={store}>{children}</Provider>
    </SafeAreaProvider>
  );

  return {
    store,
    ...renderHook(hook, { wrapper }),
  };
};

// Re-export everything from React Native Testing Library
export * from '@testing-library/react-native';

// Export our custom render functions
export {
  customRender as render,
  renderWithProviders,
  renderHookWithProviders,
  createTestStore,
};
