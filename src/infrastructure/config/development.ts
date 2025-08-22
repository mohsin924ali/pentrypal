import React from 'react';

/**
 * Development Configuration
 * Handles hot reloading, fast refresh, and development-specific settings
 */

interface DevelopmentConfig {
  enableHotReloading: boolean;
  enableFastRefresh: boolean;
  enablePerformanceMonitoring: boolean;
  enableNetworkLogging: boolean;
  enableReduxLogging: boolean;
}

class DevelopmentManager {
  private static instance: DevelopmentManager;
  private config: DevelopmentConfig;

  private constructor() {
    this.config = {
      enableHotReloading: __DEV__,
      enableFastRefresh: __DEV__,
      enablePerformanceMonitoring: __DEV__,
      enableNetworkLogging: __DEV__,
      enableReduxLogging: __DEV__,
    };

    if (__DEV__) {
      this.initializeDevelopmentFeatures();
    }
  }

  static getInstance(): DevelopmentManager {
    if (!DevelopmentManager.instance) {
      DevelopmentManager.instance = new DevelopmentManager();
    }
    return DevelopmentManager.instance;
  }

  private initializeDevelopmentFeatures() {
    // Configure Fast Refresh
    this.configureFastRefresh();

    // Setup hot reloading helpers
    this.setupHotReloadingHelpers();

    // Initialize development shortcuts
    this.initializeDevelopmentShortcuts();

    console.log('🔥 Development features initialized');
  }

  private configureFastRefresh() {
    if (this.config.enableFastRefresh && global.HermesInternal) {
      // Ensure Fast Refresh works properly with Hermes
      global.HermesInternal.enableDebugger &&
        global.HermesInternal.enableDebugger();
    }

    // Add Fast Refresh boundary helpers
    if (global.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      global.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = (
        id: any,
        root: any,
      ) => {
        // Custom Fast Refresh logic if needed
        if (__DEV__) {
          console.log('Fast Refresh: Component tree updated');
        }
      };
    }
  }

  private setupHotReloadingHelpers() {
    // Hot reload helper for Redux store
    if (module.hot) {
      module.hot.accept(() => {
        console.log('🔄 Hot reloading Redux store...');
      });
    }

    // Hot reload helper for navigation
    if (module.hot) {
      module.hot.accept('./navigation', () => {
        console.log('🔄 Hot reloading navigation...');
      });
    }
  }

  private initializeDevelopmentShortcuts() {
    if (__DEV__) {
      // Add development menu shortcuts
      const DevMenu = require('react-native').DevMenu;

      if (DevMenu) {
        DevMenu.addItem('Toggle Performance Monitor', () => {
          this.togglePerformanceMonitoring();
        });

        DevMenu.addItem('Clear AsyncStorage', () => {
          this.clearAsyncStorage();
        });

        DevMenu.addItem('Log Performance Report', () => {
          this.logPerformanceReport();
        });
      }
    }
  }

  private togglePerformanceMonitoring() {
    this.config.enablePerformanceMonitoring =
      !this.config.enablePerformanceMonitoring;
    console.log(
      `Performance monitoring: ${this.config.enablePerformanceMonitoring ? 'ON' : 'OFF'}`,
    );
  }

  private async clearAsyncStorage() {
    try {
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared');
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
    }
  }

  private logPerformanceReport() {
    // Import and use devTools from devtools.ts
    import('./devtools').then(({ devTools }) => {
      devTools.logPerformanceReport();
    });
  }

  // Public methods for configuration
  getConfig(): DevelopmentConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<DevelopmentConfig>) {
    this.config = { ...this.config, ...updates };
    console.log('Development config updated:', updates);
  }

  // Fast Refresh boundary helper
  static createFastRefreshBoundary<T extends React.ComponentType<any>>(
    Component: T,
    displayName?: string,
  ): T {
    if (__DEV__) {
      const WrappedComponent = React.forwardRef((props: any, ref: any) => {
        return React.createElement(Component, { ...props, ref });
      }) as any;

      WrappedComponent.displayName =
        displayName || Component.displayName || Component.name;

      // Mark as Fast Refresh boundary
      if (module.hot) {
        module.hot.accept();
      }

      return WrappedComponent;
    }
    return Component;
  }
}

export const developmentManager = DevelopmentManager.getInstance();

// Fast Refresh boundary decorator
export const withFastRefresh = <T extends React.ComponentType<any>>(
  Component: T,
  displayName?: string,
): T => {
  return DevelopmentManager.createFastRefreshBoundary(Component, displayName);
};

// Hot reload helper for hooks
export const useHotReload = (callback: () => void, deps: any[] = []) => {
  React.useEffect(() => {
    if (__DEV__ && module.hot) {
      callback();
    }
  }, deps);
};
