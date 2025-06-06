
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentContextType {
  isSubscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  createPayment: (amount: number, description: string) => Promise<string | null>;
  createSubscription: (priceId: string, planType: string) => Promise<string | null>;
  openCustomerPortal: () => Promise<void>;
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

  // PSEUDOCODE: Check subscription status
  const checkSubscription = async () => {
    try {
      setLoading(true);
      // TODO: Call check-subscription edge function
      // TODO: Update state with subscription status
      // TODO: Handle authentication errors
      // TODO: Update local state with response data
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      // TODO: Update state variables from response
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

  // PSEUDOCODE: Create one-time payment
  const createPayment = async (amount: number, description: string): Promise<string | null> => {
    try {
      // TODO: Validate amount is positive
      // TODO: Call create-payment edge function
      // TODO: Handle authentication requirements
      // TODO: Return checkout URL for redirection
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { amount, description }
      });
      
      if (error) throw error;
      
      return data.url;
    } catch (error) {
      console.error("Payment creation failed:", error);
      toast.error("Failed to create payment");
      return null;
    }
  };

  // PSEUDOCODE: Create subscription
  const createSubscription = async (priceId: string, planType: string): Promise<string | null> => {
    try {
      // TODO: Validate priceId and planType
      // TODO: Call create-subscription edge function
      // TODO: Handle existing subscription scenarios
      // TODO: Return checkout URL for subscription
      
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

  // PSEUDOCODE: Open customer portal
  const openCustomerPortal = async () => {
    try {
      // TODO: Call customer-portal edge function
      // TODO: Open portal in new tab
      // TODO: Handle no subscription scenarios
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      window.open(data.url, '_blank');
    } catch (error) {
      console.error("Portal creation failed:", error);
      toast.error("Failed to open customer portal");
    }
  };

  // PSEUDOCODE: Initialize subscription check on mount
  useEffect(() => {
    // TODO: Check if user is authenticated
    // TODO: Call checkSubscription if authenticated
    // TODO: Set up periodic subscription checks
    
    checkSubscription();
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
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
