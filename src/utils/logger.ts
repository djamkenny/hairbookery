/**
 * Logger utility for development and production environments
 */

export const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, data || '');
    }
  },
  
  error: (message: string, error?: any) => {
    if (import.meta.env.DEV) {
      console.error(`[ERROR] ${message}`, error || '');
    }
    // In production, you might want to send to error tracking service
  },
  
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  },
  
  warn: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }
};