
// Common validations across forms
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

// Stylist form errors interface
export interface StylistFormErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  specialty: string;
  experience: string;
  bio: string;
  terms: string;
}

// Create empty stylist form errors
export const createEmptyStylistFormErrors = (): StylistFormErrors => {
  return {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialty: "",
    experience: "",
    bio: "",
    terms: ""
  };
};
