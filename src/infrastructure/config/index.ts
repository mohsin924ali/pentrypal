import Config from 'react-native-config';

/**
 * Application Configuration
 * Centralized configuration management for all environments
 */

export interface AppConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  enableFlipper: boolean;
  enableDevTools: boolean;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  enablePerformanceMonitoring: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

const createConfig = (): AppConfig => {
  return {
    apiBaseUrl: Config.API_BASE_URL || 'https://api.pentrypal.com',
    apiTimeout: parseInt(Config.API_TIMEOUT || '10000', 10),
    firebaseApiKey: Config.FIREBASE_API_KEY || '',
    firebaseAuthDomain: Config.FIREBASE_AUTH_DOMAIN || '',
    firebaseProjectId: Config.FIREBASE_PROJECT_ID || '',
    enableFlipper: Config.ENABLE_FLIPPER === 'true',
    enableDevTools: Config.ENABLE_DEV_TOOLS === 'true' || __DEV__,
    enableAnalytics: Config.ENABLE_ANALYTICS === 'true',
    enableCrashReporting: Config.ENABLE_CRASH_REPORTING === 'true',
    enablePerformanceMonitoring:
      Config.ENABLE_PERFORMANCE_MONITORING === 'true' || __DEV__,
    logLevel: (Config.LOG_LEVEL as any) || (__DEV__ ? 'debug' : 'error'),
  };
};

export const appConfig = createConfig();

// Initialize development tools if enabled
if (__DEV__ && appConfig.enableDevTools) {
  // Initialize Flipper
  if (appConfig.enableFlipper) {
    import('./flipper').then(({ initializeFlipper }) => {
      initializeFlipper();
    });
  }

  // Initialize DevTools
  import('./devtools').then(({ devTools }) => {
    console.log('🛠️ Development tools loaded');
  });

  // Initialize Development Manager
  import('./development').then(({ developmentManager }) => {
    console.log('🔥 Development manager loaded');
  });

  // Initialize Bundle Analyzer
  import('./bundleAnalyzer').then(({ bundleAnalyzer }) => {
    console.log('📦 Bundle analyzer loaded');
  });
}

// Export individual configurations for specific use cases
export * from './flipper';
export * from './devtools';
export * from './development';
export * from './bundleAnalyzer';
export * from './debugUtils';
