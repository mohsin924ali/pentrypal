// ========================================
// Logger Utility - Development and Production Logging
// ========================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR,
      enabled: __DEV__,
      prefix: '',
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && level >= this.config.level;
  }

  private formatMessage(level: string, message: string, ...args: unknown[]): unknown[] {
    const prefix =
      this.config.prefix !== undefined && this.config.prefix !== ''
        ? `[${this.config.prefix}] `
        : '';
    const timestamp = new Date().toISOString().split('T')[1]?.split('.')[0] ?? '';
    return [`${prefix}${timestamp} ${level}:`, message, ...args];
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      // eslint-disable-next-line no-console
      console.log(...this.formatMessage('DEBUG', message, ...args));
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      // eslint-disable-next-line no-console
      console.info(...this.formatMessage('INFO', message, ...args));
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(...this.formatMessage('WARN', message, ...args));
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(...this.formatMessage('ERROR', message, ...args));
    }
  }

  // Method to create a logger with a specific prefix for a service/component
  createChild(prefix: string): Logger {
    return new Logger({
      ...this.config,
      prefix:
        this.config.prefix !== undefined && this.config.prefix !== ''
          ? `${this.config.prefix}:${prefix}`
          : prefix,
    });
  }
}

// Default logger instance
export const logger = new Logger();

// Service-specific loggers
export const authLogger = logger.createChild('Auth');
export const socialLogger = logger.createChild('Social');
export const shoppingLogger = logger.createChild('Shopping');
export const websocketLogger = logger.createChild('WebSocket');
export const apiLogger = logger.createChild('API');

// Utility function to conditionally log in development only
export const devLog = (message: string, ...args: unknown[]): void => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
  }
};

export default logger;
