import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BookingData {
  serviceTypeIds: string[];
  stylistId: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
  totalAmount: number;
}

interface PaymentResult {
  success: boolean;
  paymentUrl?: string;
  reference?: string;
  error?: string;
}

export const useBookingPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const initiatePayment = async (bookingData: BookingData): Promise<PaymentResult> => {
    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create payment with booking metadata
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: Math.round(bookingData.totalAmount * 100), // Convert to pesewas
          description: `Booking payment for ${bookingData.serviceTypeIds.length} service(s)`,
          currency: 'GHS',
          metadata: {
            type: 'booking',
            serviceTypeIds: bookingData.serviceTypeIds,
            stylistId: bookingData.stylistId,
            appointmentDate: bookingData.appointmentDate,
            appointmentTime: bookingData.appointmentTime,
            notes: bookingData.notes,
            totalAmount: bookingData.totalAmount
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        paymentUrl: data.url,
        reference: data.reference
      };

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initiate payment'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const processPaymentSuccess = async (reference: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('finalize-booking', {
        body: { reference },
      });

      if (error) {
        console.error('Finalize booking error:', error);
        throw new Error(error.message || 'Failed to finalize booking');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Payment verification failed');
      }

      toast.success('Appointment booked successfully!');
      return true;
    } catch (error: any) {
      console.error('Payment processing error:', error);
      toast.error(error.message || 'Failed to process payment');
      return false;
    }
  };

  return {
    isProcessing,
    initiatePayment,
    processPaymentSuccess
  };
};