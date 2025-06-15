
import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PaymentReturnLoading from "@/components/payment/PaymentReturn/PaymentReturnLoading";
import PaymentReturnResult from "@/components/payment/PaymentReturn/PaymentReturnResult";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { supabase } from "@/integrations/supabase/client";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const navigate = useNavigate();

  const { loading, success, error } = usePaymentStatus(reference);

  const handleContinue = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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
    } catch {
      navigate('/');
    }
  };

  if (loading) return <PaymentReturnLoading />;
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
