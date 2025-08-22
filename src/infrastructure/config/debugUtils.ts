/**
 * Debug Utilities
 * Collection of debugging helpers and utilities for development
 */

interface DebugInfo {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
}

class DebugUtils {
  private static instance: DebugUtils;
  private logs: DebugInfo[] = [];
  private maxLogs = 1000;

  private constructor() {}

  static getInstance(): DebugUtils {
    if (!DebugUtils.instance) {
      DebugUtils.instance = new DebugUtils();
    }
    return DebugUtils.instance;
  }

  /**
   * Enhanced logging with categories and structured data
   */
  log(
    level: 'debug' | 'info' | 'warn' | 'error',
    category: string,
    message: string,
    data?: any,
  ) {
    if (!__DEV__) return;

    const debugInfo: DebugInfo = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(debugInfo);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with colors and formatting
    const emoji = this.getLevelEmoji(level);
    const color = this.getLevelColor(level);

    console.log(`${emoji} [${category}] ${message}`, data ? data : '');
  }

  /**
   * Debug specific categories
   */
  debugNavigation(message: string, data?: any) {
    this.log('debug', 'Navigation', message, data);
  }

  debugRedux(message: string, data?: any) {
    this.log('debug', 'Redux', message, data);
  }

  debugAPI(message: string, data?: any) {
    this.log('debug', 'API', message, data);
  }

  debugPerformance(message: string, data?: any) {
    this.log('debug', 'Performance', message, data);
  }

  debugAuth(message: string, data?: any) {
    this.log('debug', 'Auth', message, data);
  }

  /**
   * Get all logs or filtered logs
   */
  getLogs(category?: string, level?: string): DebugInfo[] {
    let filteredLogs = this.logs;

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    return filteredLogs;
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    console.log('🗑️ Debug logs cleared');
  }

  /**
   * Network request debugger
   */
  debugNetworkRequest(url: string, method: string, headers?: any, body?: any) {
    this.debugAPI(`${method} ${url}`, {
      headers,
      body: body ? JSON.stringify(body).substring(0, 500) : undefined,
    });
  }

  /**
   * Network response debugger
   */
  debugNetworkResponse(
    url: string,
    status: number,
    data?: any,
    duration?: number,
  ) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'debug';
    this.log(level, 'API', `Response ${status} from ${url}`, {
      status,
      duration: duration ? `${duration}ms` : undefined,
      data: data ? JSON.stringify(data).substring(0, 500) : undefined,
    });
  }

  /**
   * Component render debugger
   */
  debugComponentRender(
    componentName: string,
    props?: any,
    renderTime?: number,
  ) {
    this.debugPerformance(`${componentName} rendered`, {
      props: props ? Object.keys(props) : undefined,
      renderTime: renderTime ? `${renderTime}ms` : undefined,
    });
  }

  /**
   * State change debugger
   */
  debugStateChange(stateName: string, oldValue: any, newValue: any) {
    this.debugRedux(`State changed: ${stateName}`, {
      from: oldValue,
      to: newValue,
    });
  }

  /**
   * Error debugger with stack trace
   */
  debugError(error: Error, context?: string) {
    this.log('error', context || 'Error', error.message, {
      stack: error.stack,
      name: error.name,
    });
  }

  /**
   * Performance timer
   */
  startTimer(label: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.debugPerformance(`Timer: ${label}`, {
        duration: `${duration.toFixed(2)}ms`,
      });
    };
  }

  /**
   * Memory usage debugger
   */
  debugMemoryUsage(context?: string) {
    if (global.performance?.memory) {
      const memory = global.performance.memory;
      this.debugPerformance(`Memory usage${context ? ` - ${context}` : ''}`, {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
      });
    }
  }

  private getLevelEmoji(level: string): string {
    switch (level) {
      case 'debug':
        return '🐛';
      case 'info':
        return 'ℹ️';
      case 'warn':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📝';
    }
  }

  private getLevelColor(level: string): string {
    switch (level) {
      case 'debug':
        return 'color: #6B7280';
      case 'info':
        return 'color: #3B82F6';
      case 'warn':
        return 'color: #F59E0B';
      case 'error':
        return 'color: #EF4444';
      default:
        return 'color: #000000';
    }
  }
}

export const debugUtils = DebugUtils.getInstance();

// Convenience functions
export const debugLog = (category: string, message: string, data?: any) => {
  debugUtils.log('debug', category, message, data);
};

export const debugInfo = (category: string, message: string, data?: any) => {
  debugUtils.log('info', category, message, data);
};

export const debugWarn = (category: string, message: string, data?: any) => {
  debugUtils.log('warn', category, message, data);
};

export const debugError = (category: string, message: string, data?: any) => {
  debugUtils.log('error', category, message, data);
};

// Add to development menu
if (__DEV__) {
  const DevMenu = require('react-native').DevMenu;

  if (DevMenu) {
    DevMenu.addItem('Show Debug Logs', () => {
      console.group('📋 Debug Logs');
      debugUtils.getLogs().forEach(log => {
        console.log(
          `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.category}] ${log.message}`,
          log.data || '',
        );
      });
      console.groupEnd();
    });

    DevMenu.addItem('Clear Debug Logs', () => {
      debugUtils.clearLogs();
    });

    DevMenu.addItem('Export Debug Logs', () => {
      const logs = debugUtils.exportLogs();
      console.log('Exported logs:', logs);
    });

    DevMenu.addItem('Memory Usage', () => {
      debugUtils.debugMemoryUsage('Manual Check');
    });
  }
}
