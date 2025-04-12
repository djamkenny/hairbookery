
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import CardHolderField from "./payment/CardHolderField";
import CreditCardField from "./payment/CreditCardField";
import ExpiryDateField from "./payment/ExpiryDateField";
import CVVField from "./payment/CVVField";
import TotalAmount from "./payment/TotalAmount";
import { 
  PaymentErrors, 
  createEmptyPaymentErrors, 
  validatePaymentForm,
  hasErrors
} from "./utils/paymentValidation";

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  amount, 
  onSuccess, 
  onCancel,
  isSubmitting 
}) => {
  // Form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  
  // Validation state
  const [errors, setErrors] = useState<PaymentErrors>(createEmptyPaymentErrors());
  const [touched, setTouched] = useState({
    cardNumber: false,
    expiryDate: false,
    cvv: false,
    name: false
  });

  // Validate on input change when field is touched
  useEffect(() => {
    if (touched.cardNumber || touched.expiryDate || touched.cvv || touched.name) {
      const validationErrors = validatePaymentForm(
        cardNumber, 
        expiryMonth, 
        expiryYear, 
        cvv, 
        name
      );
      
      setErrors(prevErrors => ({
        ...prevErrors,
        cardNumber: touched.cardNumber ? validationErrors.cardNumber : prevErrors.cardNumber,
        expiryDate: touched.expiryDate ? validationErrors.expiryDate : prevErrors.expiryDate,
        cvv: touched.cvv ? validationErrors.cvv : prevErrors.cvv,
        name: touched.name ? validationErrors.name : prevErrors.name
      }));
    }
  }, [cardNumber, expiryMonth, expiryYear, cvv, name, touched]);

  const markAsTouched = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to trigger validation
    setTouched({
      cardNumber: true,
      expiryDate: true,
      cvv: true,
      name: true
    });
    
    // Validate all fields
    const validationErrors = validatePaymentForm(
      cardNumber, 
      expiryMonth, 
      expiryYear, 
      cvv, 
      name
    );
    
    setErrors(validationErrors);
    
    // Check if there are any errors
    if (hasErrors(validationErrors)) {
      toast.error("Please fix the errors in the payment form");
      return;
    }

    // In a real app, we would send the payment info to a payment processor
    // For demo purposes, we'll just simulate a successful payment
    setTimeout(() => {
      onSuccess();
      toast.success("Payment processed successfully!");
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <CardHolderField 
              value={name} 
              onChange={(value) => {
                setName(value);
                markAsTouched('name');
              }}
              error={errors.name}
            />
            
            <CreditCardField 
              value={cardNumber} 
              onChange={(value) => {
                setCardNumber(value);
                markAsTouched('cardNumber');
              }}
              error={errors.cardNumber}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <ExpiryDateField 
                month={expiryMonth}
                year={expiryYear}
                setMonth={(value) => {
                  setExpiryMonth(value);
                  markAsTouched('expiryDate');
                }}
                setYear={(value) => {
                  setExpiryYear(value);
                  markAsTouched('expiryDate');
                }}
                error={errors.expiryDate}
              />
              
              <CVVField 
                value={cvv} 
                onChange={(value) => {
                  setCvv(value);
                  markAsTouched('cvv');
                }}
                error={errors.cvv}
              />
            </div>
            
            <TotalAmount amount={amount} />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
