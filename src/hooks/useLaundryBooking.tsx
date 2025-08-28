import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LaundryBookingData } from "@/types/laundry";

interface LaundryPaymentResult {
  success: boolean;
  paymentUrl?: string;
  reference?: string;
  error?: string;
}

export const useLaundryBooking = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const initiateLaundryPayment = async (bookingData: LaundryBookingData): Promise<LaundryPaymentResult> => {
    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create payment for laundry service
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: Math.round(bookingData.totalAmount * 100), // Convert to pesewas
          description: `Laundry service - ${bookingData.serviceType}`,
          currency: 'GHS',
          metadata: {
            type: 'laundry',
            serviceType: bookingData.serviceType,
            pickupAddress: bookingData.pickupAddress,
            deliveryAddress: bookingData.deliveryAddress,
            pickupDate: bookingData.pickupDate,
            pickupTime: bookingData.pickupTime,
            deliveryDate: bookingData.deliveryDate,
            deliveryTime: bookingData.deliveryTime,
            itemsDescription: bookingData.itemsDescription,
            specialInstructions: bookingData.specialInstructions,
            estimatedWeight: bookingData.estimatedWeight,
            totalAmount: bookingData.totalAmount,
            pickupInstructions: bookingData.pickupInstructions,
            deliveryInstructions: bookingData.deliveryInstructions
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
      console.error('Laundry payment initiation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initiate payment'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const processLaundryPaymentSuccess = async (reference: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('finalize-laundry-booking', {
        body: { reference },
      });

      if (error) {
        console.error('Finalize laundry booking error:', error);
        throw new Error(error.message || 'Failed to finalize laundry booking');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Payment verification failed');
      }

      toast.success('Laundry order placed successfully!');
      return true;
    } catch (error: any) {
      console.error('Laundry payment processing error:', error);
      toast.error(error.message || 'Failed to process payment');
      return false;
    }
  };

  return {
    isProcessing,
    initiateLaundryPayment,
    processLaundryPaymentSuccess
  };
};