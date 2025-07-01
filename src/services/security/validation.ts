
import DOMPurify from 'isomorphic-dompurify';

export const securityValidation = {
  // Input sanitization
  sanitizeHtml: (input: string): string => {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  },

  sanitizeText: (input: string): string => {
    return input.replace(/[<>]/g, '');
  },

  // Email validation
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  },

  // Phone validation
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[0-9\-\(\)\s]{7,20}$/;
    return phoneRegex.test(phone);
  },

  // Price validation
  validatePrice: (price: number): boolean => {
    return price > 0 && price <= 1000000; // Max 10,000 GHS
  },

  // Duration validation
  validateDuration: (duration: number): boolean => {
    return duration > 0 && duration <= 480; // Max 8 hours
  },

  // Rating validation
  validateRating: (rating: number): boolean => {
    return rating >= 1 && rating <= 5;
  },

  // Generic string length validation
  validateStringLength: (str: string, min: number = 0, max: number = 1000): boolean => {
    return str.length >= min && str.length <= max;
  },

  // XSS prevention for user content
  escapeHtml: (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};
