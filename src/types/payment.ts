
// PSEUDOCODE: Type definitions for payment system

export interface Payment {
  id: string;
  user_id: string;
  stripe_session_id: string;
  stripe_payment_intent_id?: string;
  amount: number; // Amount in cents
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  description?: string;
  service_id?: string;
  appointment_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Subscriber {
  id: string;
  user_id: string;
  email: string;
  stripe_customer_id?: string;
  subscribed: boolean;
  subscription_tier?: 'basic' | 'premium' | 'enterprise';
  stripe_subscription_id?: string;
  subscription_status?: string;
  subscription_start?: string;
  subscription_end?: string;
  trial_end?: string;
  cancel_at_period_end?: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StripeConfig {
  // PSEUDOCODE: Stripe configuration types
  publishableKey: string;
  // Note: Secret key should only be used in edge functions
}

export interface PaymentSession {
  url: string;
  session_id: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // Price in cents
  interval: 'month' | 'year';
  stripe_price_id: string;
  features: string[];
  popular?: boolean;
}

// PSEUDOCODE: Webhook event types
export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

// PSEUDOCODE: Payment method types for future expansion
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'wallet';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
}
