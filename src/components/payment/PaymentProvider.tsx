
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentContextType {
  isSubscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  createPayment: (amount: number, description: string, priceId?: string) => Promise<{ clientSecret: string; sessionId: string; url: string } | null>;
  createSubscription: (priceId: string, planType: string) => Promise<string | null>;
  openCustomerPortal: () => Promise<void>;
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

  // Check subscription status
  const checkSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setIsSubscribed(data.subscribed || false);
      setSubscriptionTier(data.subscription_tier || null);
      setSubscriptionEnd(data.subscription_end || null);
    } catch (error) {
      console.error("Subscription check failed:", error);
      toast.error("Failed to check subscription status");
    } finally {
      setLoading(false);
    }
  };

  // Create one-time payment (based on your Flask /create-checkout-session)
  const createPayment = async (
    amount: number, 
    description: string, 
    priceId?: string
  ): Promise<{ clientSecret: string; sessionId: string; url: string } | null> => {
    try {
      if (amount <= 0) {
        throw new Error("Amount must be positive");
      }

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { amount, description, priceId }
      });
      
      if (error) throw error;
      
      return {
        clientSecret: data.clientSecret,
        sessionId: data.sessionId,
        url: data.url
      };
    } catch (error) {
      console.error("Payment creation failed:", error);
      toast.error("Failed to create payment");
      return null;
    }
  };

  // Check session status (based on your Flask /session-status)
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
      console.error("Session status check failed:", error);
      toast.error("Failed to check session status");
      return null;
    }
  };

  // Create subscription
  const createSubscription = async (priceId: string, planType: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { priceId, planType }
      });
      
      if (error) throw error;
      
      return data.url;
    } catch (error) {
      console.error("Subscription creation failed:", error);
      toast.error("Failed to create subscription");
      return null;
    }
  };

  // Open customer portal
  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      window.open(data.url, '_blank');
    } catch (error) {
      console.error("Portal creation failed:", error);
      toast.error("Failed to open customer portal");
    }
  };

  // Initialize subscription check on mount
  useEffect(() => {
    const { data: { user } } = supabase.auth.getUser();
    if (user) {
      checkSubscription();
    }
  }, []);

  const value: PaymentContextType = {
    isSubscribed,
    subscriptionTier,
    subscriptionEnd,
    loading,
    checkSubscription,
    createPayment,
    createSubscription,
    openCustomerPortal,
    checkSessionStatus,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
