
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PaymentReturnLoading from "@/components/payment/PaymentReturn/PaymentReturnLoading";
import PaymentReturnResult from "@/components/payment/PaymentReturn/PaymentReturnResult";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { useLaundryPaymentStatus } from "@/hooks/useLaundryPaymentStatus";
import { supabase } from "@/integrations/supabase/client";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState<'beauty' | 'laundry' | null>(null);

  // Determine payment type based on metadata
  useEffect(() => {
    const checkPaymentType = async () => {
      if (!reference) return;
      
      try {
        const { data: payment } = await supabase
          .from('payments')
          .select('metadata')
          .eq('paystack_reference', reference)
          .single();
        
        if (payment?.metadata && typeof payment.metadata === 'object' && 'type' in payment.metadata && payment.metadata.type === 'laundry') {
          setPaymentType('laundry');
        } else {
          setPaymentType('beauty');
        }
      } catch (error) {
        console.error('Error checking payment type:', error);
        setPaymentType('beauty'); // Default to beauty
      }
    };

    checkPaymentType();
  }, [reference]);

  const beautyPaymentStatus = usePaymentStatus(paymentType === 'beauty' ? reference : null);
  const laundryPaymentStatus = useLaundryPaymentStatus(paymentType === 'laundry' ? reference : null);

  const { loading, success, error } = paymentType === 'laundry' ? laundryPaymentStatus : beautyPaymentStatus;

  const handleContinue = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_stylist, is_laundry_specialist')
          .eq('id', user.id)
          .single();
        if (data?.is_stylist || data?.is_laundry_specialist) {
          navigate('/stylist-dashboard');
        } else {
          navigate('/profile');
        }
      } else {
        navigate('/');
      }
    } catch {
      navigate('/');
    }
  };

  if (loading || !paymentType) return <PaymentReturnLoading />;
  return (
    <PaymentReturnResult
      success={success}
      error={error}
      onContinue={handleContinue}
      onGoHome={() => navigate('/')}
    />
  );
};

export default PaymentReturn;
