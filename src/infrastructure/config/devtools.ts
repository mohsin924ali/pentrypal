import { logger } from 'react-native-logs';

/**
 * Development Tools Configuration
 * Sets up React DevTools, performance monitoring, and debugging utilities
 */

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
  props?: any;
}

interface NavigationMetrics {
  screenName: string;
  navigationTime: number;
  timestamp: number;
}

class DevToolsManager {
  private static instance: DevToolsManager;
  private performanceMetrics: PerformanceMetrics[] = [];
  private navigationMetrics: NavigationMetrics[] = [];
  private logger: any;

  private constructor() {
    if (__DEV__) {
      this.logger = logger.createLogger({
        severity: 'debug',
        transport: logger.consoleTransport,
        transportOptions: {
          colors: {
            info: 'blueBright',
            warn: 'yellowBright',
            error: 'redBright',
          },
        },
      });
      this.initializeDevTools();
    }
  }

  static getInstance(): DevToolsManager {
    if (!DevToolsManager.instance) {
      DevToolsManager.instance = new DevToolsManager();
    }
    return DevToolsManager.instance;
  }

  private initializeDevTools() {
    // Enable React DevTools
    if (typeof global !== 'undefined') {
      // Connect to React DevTools
      global.__REACT_DEVTOOLS_GLOBAL_HOOK__ =
        global.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
    }

    // Setup performance monitoring
    this.setupPerformanceMonitoring();

    // Setup memory monitoring
    this.setupMemoryMonitoring();

    this.logger.info(
      '🛠️ React DevTools and performance monitoring initialized',
    );
  }

  private setupPerformanceMonitoring() {
    // Monitor component render times
    if (global.performance) {
      const originalMark = global.performance.mark;
      const originalMeasure = global.performance.measure;

      global.performance.mark = function (name: string) {
        if (name.includes('⚛️')) {
          console.log(`Performance Mark: ${name}`);
        }
        return originalMark.call(this, name);
      };

      global.performance.measure = function (
        name: string,
        startMark?: string,
        endMark?: string,
      ) {
        const result = originalMeasure.call(this, name, startMark, endMark);
        if (name.includes('⚛️')) {
          console.log(`Performance Measure: ${name} - ${result?.duration}ms`);
        }
        return result;
      };
    }
  }

  private setupMemoryMonitoring() {
    if (__DEV__) {
      // Monitor memory usage every 30 seconds
      setInterval(() => {
        if (global.performance?.memory) {
          const memoryInfo = global.performance.memory;
          const memoryUsage = {
            used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024),
            total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024),
          };

          // Log if memory usage is high
          if (memoryUsage.used > memoryUsage.limit * 0.8) {
            this.logger.warn('High memory usage detected', memoryUsage);
          }
        }
      }, 30000);
    }
  }

  trackComponentRender(componentName: string, renderTime: number, props?: any) {
    if (__DEV__) {
      const metric: PerformanceMetrics = {
        componentName,
        renderTime,
        timestamp: Date.now(),
        props,
      };

      this.performanceMetrics.push(metric);

      // Keep only last 100 metrics
      if (this.performanceMetrics.length > 100) {
        this.performanceMetrics.shift();
      }

      // Log slow renders
      if (renderTime > 16) {
        this.logger.warn(
          `Slow render detected: ${componentName} took ${renderTime}ms`,
          {
            props,
          },
        );
      }
    }
  }

  trackNavigation(screenName: string, navigationTime: number) {
    if (__DEV__) {
      const metric: NavigationMetrics = {
        screenName,
        navigationTime,
        timestamp: Date.now(),
      };

      this.navigationMetrics.push(metric);

      // Keep only last 50 navigation metrics
      if (this.navigationMetrics.length > 50) {
        this.navigationMetrics.shift();
      }

      // Log slow navigation
      if (navigationTime > 300) {
        this.logger.warn(
          `Slow navigation detected: ${screenName} took ${navigationTime}ms`,
        );
      }
    }
  }

  getPerformanceReport() {
    if (__DEV__) {
      return {
        averageRenderTime: this.calculateAverageRenderTime(),
        slowestComponents: this.getSlowestComponents(),
        averageNavigationTime: this.calculateAverageNavigationTime(),
        slowestNavigations: this.getSlowestNavigations(),
      };
    }
    return null;
  }

  private calculateAverageRenderTime(): number {
    if (this.performanceMetrics.length === 0) return 0;
    const total = this.performanceMetrics.reduce(
      (sum, metric) => sum + metric.renderTime,
      0,
    );
    return total / this.performanceMetrics.length;
  }

  private getSlowestComponents(): PerformanceMetrics[] {
    return this.performanceMetrics
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, 5);
  }

  private calculateAverageNavigationTime(): number {
    if (this.navigationMetrics.length === 0) return 0;
    const total = this.navigationMetrics.reduce(
      (sum, metric) => sum + metric.navigationTime,
      0,
    );
    return total / this.navigationMetrics.length;
  }

  private getSlowestNavigations(): NavigationMetrics[] {
    return this.navigationMetrics
      .sort((a, b) => b.navigationTime - a.navigationTime)
      .slice(0, 5);
  }

  logPerformanceReport() {
    if (__DEV__) {
      const report = this.getPerformanceReport();
      this.logger.info('📊 Performance Report', report);
    }
  }
}

export const devTools = DevToolsManager.getInstance();

// Performance tracking hooks
export const usePerformanceTracker = (componentName: string) => {
  if (__DEV__) {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      devTools.trackComponentRender(componentName, renderTime);
    };
  }
  return () => {};
};

export const trackNavigationPerformance = (screenName: string) => {
  if (__DEV__) {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const navigationTime = endTime - startTime;
      devTools.trackNavigation(screenName, navigationTime);
    };
  }
  return () => {};
};
