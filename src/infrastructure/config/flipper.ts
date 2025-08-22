import { logger } from 'react-native-logs';

/**
 * Flipper Configuration for Development and Debugging
 * Provides advanced debugging capabilities including network inspection,
 * Redux state monitoring, and performance profiling
 */

let flipperLogger: any = null;

export const initializeFlipper = () => {
  if (__DEV__) {
    try {
      // Initialize Flipper logger
      flipperLogger = logger.createLogger({
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

      // Network debugging setup
      if (global.XMLHttpRequest) {
        const originalXHROpen = global.XMLHttpRequest.prototype.open;
        const originalXHRSend = global.XMLHttpRequest.prototype.send;

        global.XMLHttpRequest.prototype.open = function (
          method: string,
          url: string,
          ...args: any[]
        ) {
          this._method = method;
          this._url = url;
          this._startTime = Date.now();
          return originalXHROpen.apply(this, [method, url, ...args]);
        };

        global.XMLHttpRequest.prototype.send = function (body?: any) {
          this.addEventListener('loadend', () => {
            const duration = Date.now() - this._startTime;
            flipperLogger?.debug('Network Request', {
              method: this._method,
              url: this._url,
              status: this.status,
              duration: `${duration}ms`,
              response: this.responseText?.substring(0, 1000),
            });
          });
          return originalXHRSend.apply(this, [body]);
        };
      }

      console.log('🔧 Flipper debugging tools initialized');
    } catch (error) {
      console.warn('Failed to initialize Flipper:', error);
    }
  }
};

export const logToFlipper = (category: string, message: string, data?: any) => {
  if (__DEV__ && flipperLogger) {
    flipperLogger.debug(`[${category}] ${message}`, data);
  }
};

export const logPerformance = (
  operation: string,
  startTime: number,
  endTime: number,
  metadata?: any,
) => {
  if (__DEV__) {
    const duration = endTime - startTime;
    logToFlipper('Performance', `${operation} completed`, {
      duration: `${duration}ms`,
      ...metadata,
    });
  }
};

export const logReduxAction = (action: any, state: any) => {
  if (__DEV__) {
    logToFlipper('Redux', `Action: ${action.type}`, {
      action,
      state: JSON.stringify(state, null, 2).substring(0, 1000),
    });
  }
};
