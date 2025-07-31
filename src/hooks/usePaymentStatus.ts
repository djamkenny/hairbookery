
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { paymentSecurity } from "@/services/security/paymentSecurity";

interface PaymentStatusResult {
  loading: boolean;
  success: boolean;
  error: string | null;
}

export function usePaymentStatus(reference: string | null) {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!reference) {
        setError('No payment reference found');
        setLoading(false);
        return;
      }

      try {
        console.log('Checking localStorage for payment data...');
        
        // Check all possible localStorage keys
        const allKeys = Object.keys(localStorage);
        console.log('All localStorage keys:', allKeys);
        
        // Check if this is a booking payment or regular payment
        let serviceId = localStorage.getItem('bookingServiceId');
        let storedAmount = localStorage.getItem('bookingPaymentAmount');
        let hasCallback = localStorage.getItem('bookingPaymentCallback');
        
        console.log('Booking payment data:', { serviceId, storedAmount, hasCallback });
        
        // If not booking payment, fall back to regular payment keys
        if (!serviceId || !storedAmount) {
          serviceId = localStorage.getItem('serviceId');
          storedAmount = localStorage.getItem('paymentAmount');
          hasCallback = localStorage.getItem('paymentSuccessCallback');
          
          console.log('Regular payment data:', { serviceId, storedAmount, hasCallback });
          
          // Try to get from serviceIds if still not found
          if (!serviceId) {
            const serviceIds = localStorage.getItem('serviceIds');
            if (serviceIds) {
              try {
                const parsed = JSON.parse(serviceIds);
                serviceId = Array.isArray(parsed) ? parsed[0] : parsed;
                console.log('Parsed serviceId from serviceIds:', serviceId);
              } catch (e) {
                console.error('Failed to parse serviceIds:', e);
              }
            }
          }
        }
        
        // Try additional fallback keys that might be used
        if (!serviceId) {
          serviceId = localStorage.getItem('selectedServiceId') || localStorage.getItem('current_service_id');
          console.log('Fallback serviceId:', serviceId);
        }
        
        if (!storedAmount) {
          storedAmount = localStorage.getItem('selectedServiceAmount') || localStorage.getItem('current_payment_amount');
          console.log('Fallback storedAmount:', storedAmount);
        }
        
        console.log('Final payment data:', { serviceId, storedAmount, hasCallback });
        
        // If still missing, try to get from database using the reference
        if (!serviceId || !storedAmount) {
          console.log('Trying to get payment data from database...');
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              // Try multiple approaches to find the payment
              let fetchedPaymentData = null;
              let paymentError = null;
              
              // Try with paystack_reference stored in the database
              const { data: paystackPayment, error: paystackError } = await supabase
                .from('payments')
                .select('service_id, amount')
                .eq('paystack_reference', reference)
                .eq('user_id', user.id)
                .maybeSingle();
              
              if (paystackPayment && !paystackError) {
                fetchedPaymentData = paystackPayment;
                paymentError = paystackError;
              } else {
                // Fallback: try with metadata containing paystack_reference
                const { data: metadataPayment, error: metadataError } = await supabase
                  .from('payments')
                  .select('service_id, amount')
                  .contains('metadata', { paystack_reference: reference })
                  .eq('user_id', user.id)
                  .maybeSingle();
                
                fetchedPaymentData = metadataPayment;
                paymentError = metadataError;
              }
              
              if (fetchedPaymentData && !paymentError) {
                serviceId = serviceId || fetchedPaymentData.service_id;
                storedAmount = storedAmount || fetchedPaymentData.amount.toString();
                console.log('Retrieved payment data from database:', { serviceId, storedAmount });
              }
            }
          } catch (dbError) {
            console.error('Failed to retrieve payment data from database:', dbError);
          }
        }
        
        if (!serviceId || !storedAmount) {
          console.error('Missing payment verification data:', { serviceId, storedAmount });
          setError(`Missing payment verification data. ServiceId: ${serviceId ? 'found' : 'missing'}, Amount: ${storedAmount ? 'found' : 'missing'}`);
          setLoading(false);
          return;
        }

        const expectedAmount = parseInt(storedAmount);

        // Verify payment with enhanced security
        const verification = await paymentSecurity.verifyPaymentAmount(
          reference, 
          expectedAmount, 
          serviceId
        );

        if (!verification.isValid) {
          setError(verification.error || 'Payment verification failed');
          setLoading(false);
          return;
        }

        // Appointment creation block with enhanced validation (only for booking payments)
        const stylistId = localStorage.getItem('stylistId');
        const appointmentDate = localStorage.getItem('appointmentDate');
        const appointmentTime = localStorage.getItem('appointmentTime');
        const appointmentNotes = localStorage.getItem('appointmentNotes');

        if (hasCallback && serviceId && stylistId && appointmentDate && appointmentTime) {
          // Get user
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Validate appointment data - compare dates only, not time
            const currentDate = new Date();
            const selectedDate = new Date(appointmentDate);
            
            // Set both dates to midnight for fair comparison
            currentDate.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);
            
            if (selectedDate < currentDate) {
              setError('Invalid appointment date');
              setLoading(false);
              return;
            }

            // Generate order_id
            const { data: refData } = await supabase.rpc("generate_appointment_reference");
            const generatedOrderId = refData;

            // Sanitize notes
            const sanitizedNotes = appointmentNotes ? 
              appointmentNotes.substring(0, 500).replace(/[<>]/g, '') : '';

            // Create appointment with validation
            const { data: appointmentData, error: appointmentError } = await supabase
              .from('appointments')
              .insert({
                client_id: user.id,
                service_id: serviceId,
                stylist_id: stylistId,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                notes: sanitizedNotes,
                status: 'confirmed',
                order_id: generatedOrderId || null
              })
              .select()
              .single();

            if (appointmentError) {
              console.error('Appointment creation error:', appointmentError);
              toast.error("Payment successful but failed to create appointment");
              setSuccess(true);
            } else {
              // Link payment to appointment
              try {
                const { data: payment } = await supabase
                  .from('payments')
                  .select('id')
                  .eq('user_id', user.id)
                  .eq('service_id', serviceId)
                  .eq('status', 'completed')
                  .is('appointment_id', null)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .maybeSingle();

                if (payment?.id && appointmentData?.id) {
                  await supabase
                    .from('payments')
                    .update({ appointment_id: appointmentData.id })
                    .eq('id', payment.id);
                }

                // Process earnings
                if (appointmentData?.id) {
                  try {
                    const { error: earningsError } = await supabase.functions.invoke('process-earnings', {
                      body: { appointment_id: appointmentData.id }
                    });
                    if (earningsError) {
                      console.error('Earnings processing error:', earningsError);
                      toast.error('Payment successful, but failed to process stylist earnings.');
                    }
                  } catch (processErr: any) {
                    console.error('Earnings processing error:', processErr);
                    toast.error('Could not process stylist earnings record.');
                  }
                }
              } catch (linkError) {
                console.error('Payment linking error:', linkError);
              }

              toast.success('Appointment booked successfully!');
            }
          }

          // Cleanup localStorage for both booking and regular payment keys
          const keysToRemove = [
            'paymentSuccessCallback',
            'bookingPaymentCallback',
            'appointmentId',
            'serviceId',
            'bookingServiceId',
            'serviceIds',
            'stylistId',
            'appointmentDate',
            'appointmentTime',
            'appointmentNotes',
            'paymentAmount',
            'bookingPaymentAmount'
          ];
          
          keysToRemove.forEach(key => localStorage.removeItem(key));
        }

        setSuccess(true);
        toast.success('Payment successful!');
      } catch (err: any) {
        console.error('Payment status check error:', err);
        setError('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [reference]);

  return { loading, success, error } as PaymentStatusResult;
}
