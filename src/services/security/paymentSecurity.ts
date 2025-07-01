
import { supabase } from "@/integrations/supabase/client";

export interface PaymentVerificationResult {
  isValid: boolean;
  error?: string;
  amount?: number;
  status?: string;
}

export const paymentSecurity = {
  // Verify payment amount server-side
  async verifyPaymentAmount(
    sessionId: string, 
    expectedAmount: number, 
    serviceId: string
  ): Promise<PaymentVerificationResult> {
    try {
      // Get the actual service price from database
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('price')
        .eq('id', serviceId)
        .single();

      if (serviceError || !service) {
        return { isValid: false, error: 'Service not found' };
      }

      // Verify the expected amount matches the service price
      if (expectedAmount !== service.price) {
        return { 
          isValid: false, 
          error: 'Amount mismatch - potential tampering detected' 
        };
      }

      // Verify payment status with Paystack
      const { data, error } = await supabase.functions.invoke('session-status', {
        body: { session_id: sessionId }
      });

      if (error) {
        return { isValid: false, error: 'Payment verification failed' };
      }

      if (data?.status !== 'complete') {
        return { 
          isValid: false, 
          error: 'Payment not completed',
          status: data?.status 
        };
      }

      // Verify the payment amount matches what was charged
      if (data.amount && data.amount !== expectedAmount) {
        return { 
          isValid: false, 
          error: 'Payment amount mismatch' 
        };
      }

      return { 
        isValid: true, 
        amount: data.amount || expectedAmount,
        status: data.status 
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return { isValid: false, error: 'Verification failed' };
    }
  },

  // Validate payment transition
  validatePaymentTransition(oldStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'pending': ['completed', 'failed', 'canceled'],
      'completed': [], // No transitions from completed
      'failed': ['pending'], // Can retry
      'canceled': ['pending'] // Can retry
    };

    return validTransitions[oldStatus]?.includes(newStatus) || false;
  },

  // Sanitize payment metadata
  sanitizePaymentMetadata(metadata: any): any {
    if (!metadata || typeof metadata !== 'object') {
      return {};
    }

    const sanitized: any = {};
    const allowedKeys = ['user_id', 'service_id', 'appointment_id', 'description'];

    for (const key of allowedKeys) {
      if (metadata[key]) {
        sanitized[key] = String(metadata[key]).substring(0, 255);
      }
    }

    return sanitized;
  }
};
