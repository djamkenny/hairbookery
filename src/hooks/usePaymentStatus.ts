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
        // Clear any previous error before processing
        setError(null);
        const result = await processPaymentSuccess(reference);
        
        if (result) {
          setSuccess(true);
        } else {
          setSuccess(false);
          setError('Payment verification failed');
        }
      } catch (err: any) {
        console.error('Payment status check error:', err);
        setSuccess(false);
        setError(err.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [reference]); // Removed processPaymentSuccess from dependencies to prevent re-runs

  return { loading, success, error };
}