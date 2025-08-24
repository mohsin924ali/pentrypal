// ========================================
// Infrastructure Configuration
// ========================================

import { Platform } from 'react-native';

/**
 * Configure the application
 * Sets up development tools, debugging, and environment
 */
export function configureApp(): void {
  if (__DEV__) {
    // Development configuration
    configureDevelopment();
  } else {
    // Production configuration
    configureProduction();
  }
}

/**
 * Configure development environment
 */
function configureDevelopment(): void {
  // Enable console warnings
  console.warn = console.warn || (() => {});

  // Log app startup
  console.log('🚀 PentryPal starting in development mode');
  console.log(`📱 Platform: ${Platform.OS} ${Platform.Version}`);

  // Enable performance monitoring in development
  if (Platform.OS === 'ios') {
    // iOS specific development setup
  } else if (Platform.OS === 'android') {
    // Android specific development setup
  }
}

/**
 * Configure production environment
 */
function configureProduction(): void {
  // Disable console logs in production
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};

  // Enable crash reporting
  // crashlytics().setCrashlyticsCollectionEnabled(true);

  // Enable performance monitoring
  // performance().setPerformanceCollectionEnabled(true);
}

/**
 * Get environment configuration
 */
export function getEnvironmentConfig() {
  return {
    isDevelopment: __DEV__,
    platform: Platform.OS,
    version: Platform.Version,
  };
}
