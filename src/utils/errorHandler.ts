/**
 * Centralized error handling utilities
 */

import { toast } from 'sonner';
import { logger } from './logger';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError extends Error {
  code?: string;
  severity?: ErrorSeverity;
  context?: Record<string, any>;
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error | AppError, context?: Record<string, any>) {
    const appError = error as AppError;
    const severity = appError.severity || 'medium';
    const errorContext = { ...appError.context, ...context };

    // Log the error
    logger.error(
      `${appError.code ? `[${appError.code}] ` : ''}${appError.message}`,
      {
        stack: appError.stack,
        severity,
        context: errorContext,
      }
    );

    // Show user-friendly message based on severity
    this.showUserMessage(appError, severity);

    // Report to monitoring service in production
    if (!import.meta.env.DEV && severity === 'critical') {
      this.reportToCrashlytics(appError, errorContext);
    }
  }

  private showUserMessage(error: AppError, severity: ErrorSeverity) {
    const userMessage = this.getUserFriendlyMessage(error);
    
    switch (severity) {
      case 'low':
        // Don't show toast for low severity errors
        logger.info('Low severity error handled silently:', error.message);
        break;
      case 'medium':
        toast.info(userMessage);
        break;
      case 'high':
        toast.error(userMessage);
        break;
      case 'critical':
        toast.error(userMessage, {
          duration: 10000,
          action: {
            label: 'Reload',
            onClick: () => window.location.reload(),
          },
        });
        break;
    }
  }

  private getUserFriendlyMessage(error: AppError): string {
    // Map technical errors to user-friendly messages
    const errorMappings: Record<string, string> = {
      'NETWORK_ERROR': 'Connection issue. Please check your internet and try again.',
      'AUTH_EXPIRED': 'Your session has expired. Please log in again.',
      'PERMISSION_DENIED': 'You don\'t have permission to perform this action.',
      'VALIDATION_ERROR': 'Please check the form and correct any errors.',
      'SERVER_ERROR': 'Something went wrong on our end. Please try again later.',
      'PAYMENT_FAILED': 'Payment could not be processed. Please try again.',
      'FILE_UPLOAD_FAILED': 'File upload failed. Please try again.',
    };

    return errorMappings[error.code || ''] || error.message || 'An unexpected error occurred.';
  }

  private reportToCrashlytics(error: AppError, context: Record<string, any>) {
    // TODO: Integrate with crash reporting service (Sentry, Bugsnag, etc.)
    console.error('Critical error reported:', { error, context });
  }
}

// Convenience functions
export const errorHandler = ErrorHandler.getInstance();

export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    errorHandler.handleError(error as Error, context);
    return null;
  }
};

export const createAppError = (
  message: string,
  code?: string,
  severity: ErrorSeverity = 'medium',
  context?: Record<string, any>
): AppError => {
  const error = new Error(message) as AppError;
  error.code = code;
  error.severity = severity;
  error.context = context;
  return error;
};