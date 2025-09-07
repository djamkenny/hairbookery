/**
 * Production-ready logger utility with environment-based levels
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDev = import.meta.env.DEV;
  private enabledLevels: Set<LogLevel>;

  constructor() {
    // In production, only log warnings and errors
    this.enabledLevels = this.isDev 
      ? new Set(['debug', 'info', 'warn', 'error'])
      : new Set(['warn', 'error']);
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enabledLevels.has(level);
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message), data || '');
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message), data || '');
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), data || '');
    }
  }

  error(message: string, error?: any) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), error || '');
      
      // In production, could send to error tracking service
      if (!this.isDev && error) {
        // TODO: Integrate with error tracking service (Sentry, etc.)
      }
    }
  }
}

export const logger = new Logger();