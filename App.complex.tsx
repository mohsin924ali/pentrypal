// ========================================
// Main Application Entry Point - Simplified
// ========================================

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Providers
import { AppProviders } from './src/presentation/providers/AppProviders';

// Configuration
import { configureApp } from './src/infrastructure/config';

// Types
import type { FC } from 'react';

// Configure the application
configureApp();

// Suppress specific warnings for better development experience
if (__DEV__) {
  LogBox.ignoreLogs([
    'Warning: ...', // Add specific warnings to ignore
    'Remote debugger', // React Native debugging warnings
  ]);
}

// Navigation
import { RootNavigator } from './src/presentation/navigation/RootNavigator';

/**
 * Main Application Component
 */
const App: FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders>
          <StatusBar style='auto' />
          <RootNavigator />
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
