
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { usePayment } from "./PaymentProvider";

interface PaymentButtonProps {
  amount: number;
  description: string;
  serviceId?: string;
  appointmentId?: string;
  className?: string;
  children?: React.ReactNode;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  serviceId,
  appointmentId,
  className,
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const { createPayment } = usePayment();

  // PSEUDOCODE: Handle payment creation
  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // TODO: Validate amount is positive
      // TODO: Validate user is authenticated
      // TODO: Create payment session with metadata
      // TODO: Redirect to Stripe checkout
      
      const checkoutUrl = await createPayment(amount, description);
      
      if (checkoutUrl) {
        // TODO: Open checkout in new tab or same window
        window.open(checkoutUrl, '_blank');
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
