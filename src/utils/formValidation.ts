
/**
 * Validates an email address format
 */
export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password meets minimum length requirements
 */
export const validatePassword = (password: string) => {
  return password.length >= 8;
};

/**
 * Form error interface for registration form
 */
export interface RegisterFormErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: string;
}

/**
 * Creates an empty form errors object
 */
export const createEmptyFormErrors = (): RegisterFormErrors => ({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: ""
});
