
import { securityValidation } from "./validation";

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
}

export const profileValidation = {
  validateProfileUpdate: (profileData: any): ProfileValidationResult => {
    const errors: string[] = [];

    // Validate full name
    if (profileData.full_name) {
      if (!securityValidation.validateStringLength(profileData.full_name, 1, 100)) {
        errors.push("Full name must be between 1 and 100 characters");
      }
      // Remove potentially harmful characters
      profileData.full_name = securityValidation.sanitizeText(profileData.full_name);
    }

    // Validate email
    if (profileData.email) {
      if (!securityValidation.validateEmail(profileData.email)) {
        errors.push("Invalid email format");
      }
      profileData.email = profileData.email.toLowerCase().trim();
    }

    // Validate phone
    if (profileData.phone) {
      if (!securityValidation.validatePhone(profileData.phone)) {
        errors.push("Invalid phone number format");
      }
    }

    // Validate bio (sanitize HTML)
    if (profileData.bio) {
      if (!securityValidation.validateStringLength(profileData.bio, 0, 500)) {
        errors.push("Bio must be under 500 characters");
      }
      profileData.bio = securityValidation.sanitizeHtml(profileData.bio);
    }

    // Validate specialty
    if (profileData.specialty) {
      if (!securityValidation.validateStringLength(profileData.specialty, 0, 100)) {
        errors.push("Specialty must be under 100 characters");
      }
      profileData.specialty = securityValidation.sanitizeText(profileData.specialty);
    }

    // Validate experience
    if (profileData.experience) {
      if (!securityValidation.validateStringLength(profileData.experience, 0, 200)) {
        errors.push("Experience must be under 200 characters");
      }
      profileData.experience = securityValidation.sanitizeText(profileData.experience);
    }

    // Validate location
    if (profileData.location) {
      if (!securityValidation.validateStringLength(profileData.location, 0, 100)) {
        errors.push("Location must be under 100 characters");
      }
      profileData.location = securityValidation.sanitizeText(profileData.location);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  validateServiceData: (serviceData: any): ProfileValidationResult => {
    const errors: string[] = [];

    // Validate name
    if (!serviceData.name || !securityValidation.validateStringLength(serviceData.name, 1, 100)) {
      errors.push("Service name must be between 1 and 100 characters");
    } else {
      serviceData.name = securityValidation.sanitizeText(serviceData.name);
    }

    // Validate description
    if (serviceData.description) {
      if (!securityValidation.validateStringLength(serviceData.description, 0, 500)) {
        errors.push("Description must be under 500 characters");
      }
      serviceData.description = securityValidation.sanitizeHtml(serviceData.description);
    }

    // Validate price
    if (!serviceData.price || !securityValidation.validatePrice(serviceData.price)) {
      errors.push("Price must be a positive number up to 1,000,000");
    }

    // Validate duration
    if (!serviceData.duration || !securityValidation.validateDuration(serviceData.duration)) {
      errors.push("Duration must be between 1 and 480 minutes");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
