import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CleaningBookingData {
  serviceType: string;
  serviceDate: string;
  serviceTime: string;
  serviceAddress: string;
  propertyType?: string;
  numRooms?: number;
  numBathrooms?: number;
  squareFootage?: number;
  specialInstructions?: string;
  selectedAddons: string[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  specialistId?: string;
}

export interface CleaningPaymentResult {
  success: boolean;
  paymentUrl?: string;
  reference?: string;
  error?: string;
}

export const useCleaningBooking = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const initiateCleaningPayment = async (bookingData: CleaningBookingData): Promise<CleaningPaymentResult> => {
    setIsProcessing(true);
    
    try {
      console.log('Initiating cleaning payment:', bookingData);
      
      const { data, error } = await supabase.functions.invoke('create-cleaning-payment', {
        body: bookingData
      });

      if (error) {
        console.error('Payment initiation error:', error);
        return {
          success: false,
          error: error.message || 'Failed to initiate payment'
        };
      }

      if (!data.success) {
        console.error('Payment failed:', data.error);
        return {
          success: false,
          error: data.error || 'Payment initiation failed'
        };
      }

      console.log('Payment initiated successfully:', data);
      
      return {
        success: true,
        paymentUrl: data.paymentUrl,
        reference: data.reference
      };

    } catch (error: any) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const processCleaningPaymentSuccess = async (reference: string): Promise<boolean> => {
    try {
      console.log('Processing cleaning payment success for reference:', reference);
      
      const { data, error } = await supabase.functions.invoke('finalize-cleaning-booking', {
        body: { reference }
      });

      if (error) {
        console.error('Finalization error:', error);
        toast.error('Failed to finalize booking');
        return false;
      }

      if (!data.success) {
        console.error('Finalization failed:', data.error);
        toast.error(data.error || 'Failed to finalize booking');
        return false;
      }

      console.log('Cleaning booking finalized:', data);
      toast.success('Cleaning service booked successfully!');
      return true;

    } catch (error: any) {
      console.error('Payment finalization error:', error);
      toast.error('Failed to finalize booking');
      return false;
    }
  };

  return {
    isProcessing,
    initiateCleaningPayment,
    processCleaningPaymentSuccess
  };
};