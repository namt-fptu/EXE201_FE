/**
 * ✅ PERFORMANCE: Optimized Logger
 * Automatically removes console.log in production for better performance
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'auth' | 'success';

interface LoggerConfig {
  enabled: boolean;
  levels: LogLevel[];
  prefix?: string;
}

class OptimizedLogger {
  private config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      levels: ['debug', 'info', 'warn', 'error', 'auth', 'success'],
      prefix: '',
      ...config
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && this.config.levels.includes(level);
  }

  private formatMessage(level: LogLevel, message: string): string {
    const icons = {
      debug: '🐛',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      auth: '🔐',
      success: '✅'
    };

    const prefix = this.config.prefix ? `[${this.config.prefix}] ` : '';
    return `${icons[level]} ${prefix}${message}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message), data || '');
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), data || '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), data || '');
    }
  }

  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), data || '');
    }
  }

  auth(message: string, data?: any): void {
    if (this.shouldLog('auth')) {
      console.log(this.formatMessage('auth', message), data || '');
    }
  }

  success(message: string, data?: any): void {
    if (this.shouldLog('success')) {
      console.log(this.formatMessage('success', message), data || '');
    }
  }

  // Performance measurement helpers
  time(label: string): void {
    if (this.config.enabled) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.config.enabled) {
      console.timeEnd(label);
    }
  }

  // Group logging for better organization
  group(label: string): void {
    if (this.config.enabled) {
      console.group(this.formatMessage('info', label));
    }
  }

  groupEnd(): void {
    if (this.config.enabled) {
      console.groupEnd();
    }
  }
}

// Create default logger instances
export const logger = new OptimizedLogger();
export const authLogger = new OptimizedLogger({ prefix: 'AUTH' });
export const perfLogger = new OptimizedLogger({ prefix: 'PERF' });

// Legacy compatibility - gradually replace console.log with these
export const debugLog = {
  auth: authLogger.auth.bind(authLogger),
  error: logger.error.bind(logger),
  info: logger.info.bind(logger),
  success: logger.success.bind(logger),
  warn: logger.warn.bind(logger)
};

export default logger;