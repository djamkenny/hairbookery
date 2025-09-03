
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PaymentReturnLoading from "@/components/payment/PaymentReturn/PaymentReturnLoading";
import PaymentReturnResult from "@/components/payment/PaymentReturn/PaymentReturnResult";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { useLaundryPaymentStatus } from "@/hooks/useLaundryPaymentStatus";
import { useCleaningPaymentStatus } from "@/hooks/useCleaningPaymentStatus";
import { supabase } from "@/integrations/supabase/client";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const typeParam = searchParams.get('type'); // Get type from URL parameter
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState<'beauty' | 'laundry' | 'cleaning' | null>(null);

  // Determine payment type based on URL parameter or metadata
  useEffect(() => {
    const checkPaymentType = async () => {
      if (!reference) return;
      
      // First check URL parameter
      if (typeParam === 'cleaning') {
        setPaymentType('cleaning');
        return;
      }
      if (typeParam === 'laundry') {
        setPaymentType('laundry');
        return;
      }
      
      // Fallback to checking payment metadata
      try {
        const { data: payment } = await supabase
          .from('payments')
          .select('metadata')
          .eq('paystack_reference', reference)
          .single();
        
        if (payment?.metadata && typeof payment.metadata === 'object') {
          if ('booking_type' in payment.metadata && payment.metadata.booking_type === 'cleaning') {
            setPaymentType('cleaning');
          } else if ('type' in payment.metadata && payment.metadata.type === 'laundry') {
            setPaymentType('laundry');
          } else {
            setPaymentType('beauty');
          }
        } else {
          setPaymentType('beauty');
        }
      } catch (error) {
        console.error('Error checking payment type:', error);
        setPaymentType('beauty'); // Default to beauty
      }
    };

    checkPaymentType();
  }, [reference, typeParam]);

  const beautyPaymentStatus = usePaymentStatus(paymentType === 'beauty' ? reference : null);
  const laundryPaymentStatus = useLaundryPaymentStatus(paymentType === 'laundry' ? reference : null);
  const cleaningPaymentStatus = useCleaningPaymentStatus(paymentType === 'cleaning' ? reference : null);

  const { loading, success, error } = (() => {
    if (paymentType === 'cleaning') return cleaningPaymentStatus;
    if (paymentType === 'laundry') return laundryPaymentStatus;
    return beautyPaymentStatus;
  })();

  const handleContinue = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_stylist, is_laundry_specialist, is_cleaning_specialist')
          .eq('id', user.id)
          .single();
        if (data?.is_stylist || data?.is_laundry_specialist || data?.is_cleaning_specialist) {
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
