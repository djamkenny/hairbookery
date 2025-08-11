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

      // Create a single appointment for multiple services
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          client_id: user.id,
          service_id: null, // No specific service for multi-service appointments
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

      // Link all services and their types to the single appointment
      const { data: typeMappings, error: typeFetchError } = await supabase
        .from('service_types')
        .select('id, service_id')
        .in('id', (metadata.serviceTypeIds || []));

      if (typeFetchError) {
        console.error('Failed to fetch service type mappings:', typeFetchError);
        throw new Error('Failed to link services to appointment');
      }

      const appointmentServices = (typeMappings || []).map((st: any) => ({
        appointment_id: appointment.id,
        service_id: st.service_id,
        service_type_id: st.id
      }));

      const { error: servicesError } = await supabase
        .from('appointment_services')
        .insert(appointmentServices);

      if (servicesError) {
        console.error('Appointment services linking error:', servicesError);
        throw new Error('Failed to link services to appointment');
      }

      // Link payment to the appointment
      await supabase
        .from('payments')
        .update({ 
          appointment_id: appointment.id,
          status: 'completed'
        })
        .eq('id', payment.id);

      // Process earnings for the stylist
      try {
        await supabase.functions.invoke('process-earnings', {
          body: { appointment_id: appointment.id }
        });
      } catch (earningsError) {
        console.error('Earnings processing error:', earningsError);
      }

      toast.success(`Successfully booked appointment with ${(metadata.serviceTypeIds || []).length} service(s)!`);
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