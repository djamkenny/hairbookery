import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BookingData {
  serviceIds: string[];
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
          description: `Booking payment for ${bookingData.serviceIds.length} service(s)`,
          currency: 'GHS',
          metadata: {
            type: 'booking',
            serviceIds: bookingData.serviceIds,
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
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get payment data
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('paystack_reference', reference)
        .eq('user_id', user.id)
        .single();

      if (paymentError || !payment) {
        throw new Error('Payment not found');
      }

      // Check if payment is already processed to prevent duplicates
      if (payment.status === 'completed') {
        console.log('Payment already processed, skipping appointment creation');
        return true;
      }

      const metadata = payment.metadata as any;
      if (metadata?.type !== 'booking') {
        throw new Error('Invalid payment type');
      }

      // Generate order ID
      const { data: orderId } = await supabase.rpc("generate_appointment_reference");

      // Create appointments for each service
      const appointments = [];
      for (const serviceId of metadata.serviceIds) {
        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .insert({
            client_id: user.id,
            service_id: serviceId,
            stylist_id: metadata.stylistId,
            appointment_date: metadata.appointmentDate,
            appointment_time: metadata.appointmentTime,
            notes: metadata.notes || '',
            status: 'confirmed',
            order_id: orderId || null
          })
          .select()
          .single();

        if (appointmentError) {
          console.error('Appointment creation error:', appointmentError);
          throw new Error('Failed to create appointment');
        }

        appointments.push(appointment);
      }

      // Link payment to first appointment
      if (appointments.length > 0) {
        await supabase
          .from('payments')
          .update({ 
            appointment_id: appointments[0].id,
            status: 'completed'
          })
          .eq('id', payment.id);

        // Process earnings for the stylist
        try {
          await supabase.functions.invoke('process-earnings', {
            body: { appointment_id: appointments[0].id }
          });
        } catch (earningsError) {
          console.error('Earnings processing error:', earningsError);
        }
      }

      toast.success(`Successfully booked ${appointments.length} appointment(s)!`);
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