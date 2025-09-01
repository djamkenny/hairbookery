import { useEffect, useState } from "react";
import { useLaundryBooking } from "./useLaundryBooking";

interface LaundryPaymentStatusResult {
  loading: boolean;
  success: boolean;
  error: string | null;
}

export function useLaundryPaymentStatus(reference: string | null): LaundryPaymentStatusResult {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { processLaundryPaymentSuccess } = useLaundryBooking();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!reference) {
        setError('No payment reference found');
        setLoading(false);
        return;
      }

      try {
        const result = await processLaundryPaymentSuccess(reference);
        setSuccess(result);
        if (!result) {
          setError('Payment verification failed');
        }
      } catch (err: any) {
        console.error('Laundry payment status check error:', err);
        setError(err.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [reference]);

  return { loading, success, error };
}