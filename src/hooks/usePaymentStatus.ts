import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        // Verify payment status
        const { data, error } = await supabase.functions.invoke('session-status', {
          body: { session_id: reference }
        });

        if (error) {
          setError('Failed to verify payment status');
          return;
        }
        if (data?.status !== 'complete') {
          setError(data?.status === 'failed' ? 'Payment was declined' : 'Payment was not successful');
          return;
        }

        // Appointment creation block
        let hasCallback = localStorage.getItem('paymentSuccessCallback');
        const serviceId = localStorage.getItem('serviceId');
        const stylistId = localStorage.getItem('stylistId');
        const appointmentDate = localStorage.getItem('appointmentDate');
        const appointmentTime = localStorage.getItem('appointmentTime');
        const appointmentNotes = localStorage.getItem('appointmentNotes');
        if (hasCallback && serviceId && stylistId && appointmentDate && appointmentTime) {
          // Get user
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Generate order_id
            const { data: refData } = await supabase.rpc("generate_appointment_reference");
            const generatedOrderId = refData;

            // Create appointment
            const { data: appointmentData, error: appointmentError } = await supabase
              .from('appointments')
              .insert({
                client_id: user.id,
                service_id: serviceId,
                stylist_id: stylistId,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                notes: appointmentNotes || '',
                status: 'confirmed',
                order_id: generatedOrderId || null
              })
              .select()
              .single();

            if (appointmentError) {
              toast.error("Payment successful but failed to create appointment");
              setSuccess(true); // Allow success, but error shown
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
                    if (earningsError) toast.error('Payment went through, but failed to add funds to specialist account.');
                  } catch (processErr: any) {
                    toast.error('Could not process stylist earnings record.');
                  }
                }
              } catch {}
              // Notifications (optional. Keep simple for now.)
              toast.success('Appointment booked successfully!');
            }
          }
          // Cleanup
          localStorage.removeItem('paymentSuccessCallback');
          localStorage.removeItem('appointmentId');
          localStorage.removeItem('serviceId');
          localStorage.removeItem('stylistId');
          localStorage.removeItem('appointmentDate');
          localStorage.removeItem('appointmentTime');
          localStorage.removeItem('appointmentNotes');
        }
        setSuccess(true);
        toast.success('Payment successful!');
      } catch (err) {
        setError('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };
    checkPaymentStatus();
    // eslint-disable-next-line
  }, [reference]);

  return { loading, success, error } as PaymentStatusResult;
}
