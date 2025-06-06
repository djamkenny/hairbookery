
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { usePayment } from "./PaymentProvider";

interface PaymentButtonProps {
  amount: number;
  description: string;
  priceId?: string; // Optional Stripe price ID
  serviceId?: string;
  appointmentId?: string;
  className?: string;
  children?: React.ReactNode;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  priceId,
  serviceId,
  appointmentId,
  className,
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const { createPayment } = usePayment();

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      if (amount <= 0) {
        throw new Error("Invalid amount");
      }
      
      const result = await createPayment(amount, description, priceId);
      
      if (result?.url) {
        // Open checkout in new tab (similar to your Flask setup)
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || amount <= 0}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {children || `Pay $${(amount / 100).toFixed(2)}`}
        </>
      )}
    </Button>
  );
};
