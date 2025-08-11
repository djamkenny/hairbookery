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

      // Get payment data by reference (avoid user filter in case record was created as guest)
      let payment: any = null;
      let { data: foundPayment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('paystack_reference', reference)
        .single();

      if (paymentError || !foundPayment) {
        // Try to verify with Paystack and refresh payment, then refetch
        try {
          await supabase.functions.invoke('session-status', { body: { session_id: reference } });
          const { data: refreshedPayment } = await supabase
            .from('payments')
            .select('*')
            .eq('paystack_reference', reference)
            .single();
          payment = refreshedPayment;
        } catch (e) {
          console.error('Payment refresh error:', e);
        }
      } else {
        payment = foundPayment;
      }

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Security: ensure payment belongs to current user when available
      if (payment.user_id && payment.user_id !== user.id) {
        throw new Error('Payment does not belong to current user');
      }

      // Check if payment is already processed to prevent duplicates
      if (payment.status === 'completed' && payment.appointment_id) {
        console.log('Payment already processed and appointment exists, skipping');
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

      // Guard against empty or invalid mappings (prevents empty insert errors)
      if (!typeMappings || typeMappings.length === 0) {
        console.error('No service type mappings found for IDs:', metadata.serviceTypeIds);
        throw new Error('Selected services could not be found');
      }

      const appointmentServices = typeMappings
        .map((st: any) => ({
          appointment_id: appointment.id,
          service_id: st.service_id,
          service_type_id: st.id,
        }))
        // Filter out any unexpected nulls to avoid FK violations
        .filter((row: any) => row.service_id && row.service_type_id);

      if (appointmentServices.length === 0) {
        console.error('All service mappings were invalid after filtering:', typeMappings);
        throw new Error('Invalid service selection');
      }

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