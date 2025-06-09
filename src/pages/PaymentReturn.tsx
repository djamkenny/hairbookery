
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const reference = searchParams.get('reference');
        
        if (!reference) {
          setError('No payment reference found');
          setLoading(false);
          return;
        }

        console.log('Checking payment status for reference:', reference);

        // Call our session status function to verify payment
        const { data, error } = await supabase.functions.invoke('session-status', {
          body: { session_id: reference }
        });

        console.log('Payment verification response:', data, error);

        if (error) {
          console.error('Payment verification error:', error);
          setError('Failed to verify payment status');
        } else if (data?.status === 'complete') {
          setSuccess(true);
          toast.success('Payment successful!');
          
          // Check if there's a pending appointment confirmation
          const hasCallback = localStorage.getItem('paymentSuccessCallback');
          const appointmentId = localStorage.getItem('appointmentId');
          const serviceId = localStorage.getItem('serviceId');
          
          if (hasCallback && serviceId) {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              // Create appointment after successful payment
              const { data: appointmentData, error: appointmentError } = await supabase
                .from('appointments')
                .insert({
                  client_id: user.id,
                  service_id: serviceId,
                  stylist_id: localStorage.getItem('stylistId') || '',
                  appointment_date: localStorage.getItem('appointmentDate') || '',
                  appointment_time: localStorage.getItem('appointmentTime') || '',
                  notes: localStorage.getItem('appointmentNotes') || '',
                  status: 'confirmed'
                })
                .select()
                .single();
                
              if (appointmentError) {
                console.error('Error creating appointment:', appointmentError);
                toast.error('Payment successful but failed to create appointment');
              } else {
                console.log('Appointment created successfully:', appointmentData);
                toast.success('Appointment booked successfully!');
              }
            }
            
            // Clean up localStorage
            localStorage.removeItem('paymentSuccessCallback');
            localStorage.removeItem('appointmentId');
            localStorage.removeItem('serviceId');
            localStorage.removeItem('stylistId');
            localStorage.removeItem('appointmentDate');
            localStorage.removeItem('appointmentTime');
            localStorage.removeItem('appointmentNotes');
          }
        } else {
          setError(data?.status === 'failed' ? 'Payment was declined' : 'Payment was not successful');
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        setError('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  const handleContinue = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Navigate based on user type
      if (user) {
        // Check if user is stylist
        const { data } = await supabase
          .from('profiles')
          .select('is_stylist')
          .eq('id', user.id)
          .single();
          
        if (data?.is_stylist) {
          navigate('/stylist-dashboard');
        } else {
          navigate('/profile');
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h2 className="text-lg font-semibold mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground text-center">
              Please wait while we confirm your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {success ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-xl">
            {success ? 'Payment Successful!' : 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {success
              ? 'Your payment has been processed successfully. Your appointment has been confirmed.'
              : error || 'There was an issue processing your payment. Please try again.'}
          </p>
          
          <div className="flex gap-2">
            <Button onClick={handleContinue} className="flex-1">
              {success ? 'Continue' : 'Try Again'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentReturn;
