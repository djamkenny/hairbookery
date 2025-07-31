// Type definitions for Paystack payment system

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  paystack_reference: string;
  paystack_access_code?: string;
  service_id?: string;
  appointment_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  paystack_customer_id?: string;
  paystack_plan_id?: string;
  paystack_subscription_code?: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaystackConfig {
  // Configuration types for Paystack integration
  public_key: string;
  secret_key: string;
  webhook_secret?: string;
}

export interface PaymentSession {
  url: string;
  reference: string;
  access_code: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // Price in kobo (Paystack's smallest currency unit)
  interval: 'monthly' | 'annually';
  paystack_plan_code: string;
  features: string[];
  popular?: boolean;
}

// Webhook event types for Paystack
export interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata?: Record<string, any>;
  };
}

// Payment method types for future expansion
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'mobile_money';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
}