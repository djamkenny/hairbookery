
-- PSEUDOCODE: Create payment and subscription tracking tables

-- Create payments table for one-time payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, canceled
  description TEXT,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscribers table for subscription management
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT, -- basic, premium, enterprise
  stripe_subscription_id TEXT,
  subscription_status TEXT, -- active, canceled, past_due, etc.
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payments table
CREATE POLICY "Users can view their own payments"
ON public.payments
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Service can insert payments"
ON public.payments
FOR INSERT
WITH CHECK (true); -- Edge functions will use service role

CREATE POLICY "Service can update payments"
ON public.payments
FOR UPDATE
USING (true); -- Edge functions will use service role

-- Create RLS policies for subscribers table
CREATE POLICY "Users can view their own subscription"
ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Service can insert subscribers"
ON public.subscribers
FOR INSERT
WITH CHECK (true); -- Edge functions will use service role

CREATE POLICY "Service can update subscribers"
ON public.subscribers
FOR UPDATE
USING (true); -- Edge functions will use service role

-- Create indexes for performance
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_stripe_session_id ON public.payments(stripe_session_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX idx_subscribers_email ON public.subscribers(email);
CREATE INDEX idx_subscribers_stripe_customer_id ON public.subscribers(stripe_customer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- PSEUDOCODE: Add comments for future reference
COMMENT ON TABLE public.payments IS 'Tracks one-time payment transactions';
COMMENT ON TABLE public.subscribers IS 'Tracks user subscription status and billing information';
COMMENT ON COLUMN public.payments.amount IS 'Payment amount in cents';
COMMENT ON COLUMN public.payments.metadata IS 'Additional payment metadata from Stripe';
COMMENT ON COLUMN public.subscribers.subscription_tier IS 'User subscription plan level';
COMMENT ON COLUMN public.subscribers.metadata IS 'Additional subscription metadata from Stripe';
