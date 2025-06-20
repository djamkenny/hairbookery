
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, Smartphone } from "lucide-react";
import { usePayment } from "./PaymentProvider";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentButtonProps {
  amount: number;
  description: string;
  priceId?: string;
  serviceId?: string;
  appointmentId?: string;
  className?: string;
  children?: React.ReactNode;
  metadata?: Record<string, any>;
  onPaymentSuccess?: () => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  priceId,
  serviceId,
  appointmentId,
  className,
  children,
  metadata,
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const { createPayment } = usePayment();
  const isMobile = useIsMobile();

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      if (amount <= 0) {
        throw new Error("Invalid amount");
      }

      // Convert to pesewas for Paystack
      const amountInPesewas = Math.round(amount * 100);
      const result = await createPayment(amountInPesewas, description, undefined, metadata);

      if (result?.url) {
        if (onPaymentSuccess) {
          localStorage.setItem('paymentSuccessCallback', 'true');
          localStorage.setItem('appointmentId', appointmentId || '');
          localStorage.setItem('serviceId', serviceId || '');
        }
        if (isMobile) {
          window.location.href = result.url;
        } else {
          window.open(result.url, '_blank');
        }
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
          <Smartphone className="mr-2 h-4 w-4" />
          {children || `Pay GH₵${amount.toFixed(2)}`}
        </>
      )}
    </Button>
  );
};
