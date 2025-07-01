
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
        const serviceId = localStorage.getItem('serviceId');
        const storedAmount = localStorage.getItem('paymentAmount');
        
        if (!serviceId || !storedAmount) {
          setError('Missing payment verification data');
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

        // Appointment creation block with enhanced validation
        let hasCallback = localStorage.getItem('paymentSuccessCallback');
        const stylistId = localStorage.getItem('stylistId');
        const appointmentDate = localStorage.getItem('appointmentDate');
        const appointmentTime = localStorage.getItem('appointmentTime');
        const appointmentNotes = localStorage.getItem('appointmentNotes');

        if (hasCallback && serviceId && stylistId && appointmentDate && appointmentTime) {
          // Get user
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Validate appointment data
            const currentDate = new Date();
            const selectedDate = new Date(appointmentDate);
            
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

          // Cleanup localStorage
          const keysToRemove = [
            'paymentSuccessCallback',
            'appointmentId',
            'serviceId',
            'stylistId',
            'appointmentDate',
            'appointmentTime',
            'appointmentNotes',
            'paymentAmount'
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
