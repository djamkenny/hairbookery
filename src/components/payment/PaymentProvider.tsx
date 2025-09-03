import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentContextType {
  isSubscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  createPayment: (amount: number, description: string, priceId?: string, metadata?: Record<string, any>) => Promise<{ url: string; sessionId: string; reference: string } | null>;
  checkSessionStatus: (sessionId: string) => Promise<{ status: string; customer_email: string } | null>;
}

const PaymentContext = createContext<PaymentContextType | null>(null);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within PaymentProvider");
  }
  return context;
};

interface PaymentProviderProps {
  children: React.ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Note: Subscription checking would be implemented with Paystack in the future
  // For now, this is disabled since we removed Stripe-specific edge functions

  // Create one-time payment using Paystack
  const createPayment = async (
    amount: number, 
    description: string, 
    priceId?: string,
    metadata?: Record<string, any>
  ): Promise<{ url: string; sessionId: string; reference: string } | null> => {
    try {
      if (amount <= 0) {
        throw new Error("Amount must be positive");
      }
      // The amount is already in pesewas when passed from PaymentForm
      const amountInPesewas = Math.round(amount);

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          amount: amountInPesewas, 
          description, 
          currency: 'GHS', // Ghana Cedis
          metadata: metadata || {}
        }
      });
      
      if (error) throw error;
      return {
        url: data.url,
        sessionId: data.sessionId,
        reference: data.reference
      };
    } catch (error) {
      toast.error("Failed to create payment");
      return null;
    }
  };

  // Check session status using Paystack verification
  const checkSessionStatus = async (sessionId: string): Promise<{ status: string; customer_email: string } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('session-status', {
        body: { session_id: sessionId }
      });
      
      if (error) throw error;
      
      return {
        status: data.status,
        customer_email: data.customer_email
      };
    } catch (error) {
      toast.error("Failed to check session status");
      return null;
    }
  };


  // Initialize - set defaults for non-subscription app
  useEffect(() => {
    setLoading(false);
  }, []);

  const value: PaymentContextType = {
    isSubscribed,
    subscriptionTier,
    subscriptionEnd,
    loading,
    createPayment,
    checkSessionStatus,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
