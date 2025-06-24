
export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string) {
  return password.length >= 8;
}

export interface SpecialistFormErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  specialty: string;
  experience: string;
  bio: string;
  location: string;
  terms: string;
}

export function createEmptySpecialistFormErrors(): SpecialistFormErrors {
  return {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialty: "",
    experience: "",
    bio: "",
    location: "",
    terms: ""
  };
}
