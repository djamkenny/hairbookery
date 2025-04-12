
export interface PaymentErrors {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

export const createEmptyPaymentErrors = (): PaymentErrors => ({
  cardNumber: "",
  expiryDate: "",
  cvv: "",
  name: ""
});

export const validateCardNumber = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\s/g, "");
  if (!cleanNumber) return "Card number is required";
  if (cleanNumber.length !== 16) return "Card number must be 16 digits";
  if (!/^\d+$/.test(cleanNumber)) return "Card number must contain only digits";
  return "";
};

export const validateExpiryDate = (month: string, year: string): string => {
  if (!month || !year) return "Expiry date is required";
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const expiryYear = parseInt(year);
  const expiryMonth = parseInt(month);
  
  if (expiryYear < currentYear) return "Card has expired";
  if (expiryYear === currentYear && expiryMonth < currentMonth) return "Card has expired";
  
  return "";
};

export const validateCVV = (cvv: string): string => {
  if (!cvv) return "CVV is required";
  if (!/^\d+$/.test(cvv)) return "CVV must contain only digits";
  if (cvv.length < 3 || cvv.length > 4) return "CVV must be 3 or 4 digits";
  return "";
};

export const validateCardholderName = (name: string): string => {
  if (!name.trim()) return "Cardholder name is required";
  if (name.trim().length < 3) return "Please enter full name";
  return "";
};

export const validatePaymentForm = (
  cardNumber: string,
  expiryMonth: string,
  expiryYear: string,
  cvv: string,
  name: string
): PaymentErrors => {
  return {
    cardNumber: validateCardNumber(cardNumber),
    expiryDate: validateExpiryDate(expiryMonth, expiryYear),
    cvv: validateCVV(cvv),
    name: validateCardholderName(name)
  };
};

export const hasErrors = (errors: PaymentErrors): boolean => {
  return Object.values(errors).some(error => error !== "");
};
