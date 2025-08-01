import { useEffect, useState } from "react";
import { useBookingPayment } from "./useBookingPayment";

interface PaymentStatusResult {
  loading: boolean;
  success: boolean;
  error: string | null;
}

export function usePaymentStatus(reference: string | null): PaymentStatusResult {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { processPaymentSuccess } = useBookingPayment();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!reference) {
        setError('No payment reference found');
        setLoading(false);
        return;
      }

      try {
        const result = await processPaymentSuccess(reference);
        setSuccess(result);
        if (!result) {
          setError('Payment verification failed');
        }
      } catch (err: any) {
        console.error('Payment status check error:', err);
        setError(err.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [reference, processPaymentSuccess]);

  return { loading, success, error };
}