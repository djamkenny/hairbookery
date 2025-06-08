
-- Create earnings table to track specialist earnings
CREATE TABLE public.specialist_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  gross_amount INTEGER NOT NULL, -- Total payment amount in pesewas
  platform_fee INTEGER NOT NULL, -- Platform commission in pesewas
  net_amount INTEGER NOT NULL, -- Amount due to specialist in pesewas
  platform_fee_percentage DECIMAL(5,2) NOT NULL DEFAULT 15.00, -- Platform fee percentage
  status TEXT NOT NULL DEFAULT 'pending', -- pending, available, withdrawn
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create withdrawal requests table
CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Amount to withdraw in pesewas
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, rejected
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  notes TEXT,
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.specialist_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for specialist_earnings
CREATE POLICY "Stylists can view their own earnings"
ON public.specialist_earnings
FOR SELECT
USING (stylist_id = auth.uid());

CREATE POLICY "Service can insert earnings"
ON public.specialist_earnings
FOR INSERT
WITH CHECK (true); -- Edge functions will use service role

CREATE POLICY "Service can update earnings"
ON public.specialist_earnings
FOR UPDATE
USING (true); -- Edge functions will use service role

-- Create RLS policies for withdrawal_requests
CREATE POLICY "Stylists can view their own withdrawal requests"
ON public.withdrawal_requests
FOR SELECT
USING (stylist_id = auth.uid());

CREATE POLICY "Stylists can create withdrawal requests"
ON public.withdrawal_requests
FOR INSERT
WITH CHECK (stylist_id = auth.uid());

CREATE POLICY "Stylists can update their own pending requests"
ON public.withdrawal_requests
FOR UPDATE
USING (stylist_id = auth.uid() AND status = 'pending');

-- Create indexes for performance
CREATE INDEX idx_specialist_earnings_stylist_id ON public.specialist_earnings(stylist_id);
CREATE INDEX idx_specialist_earnings_status ON public.specialist_earnings(status);
CREATE INDEX idx_withdrawal_requests_stylist_id ON public.withdrawal_requests(stylist_id);
CREATE INDEX idx_withdrawal_requests_status ON public.withdrawal_requests(status);

-- Create triggers for updated_at
CREATE TRIGGER update_specialist_earnings_updated_at
  BEFORE UPDATE ON public.specialist_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to calculate available balance for a stylist
CREATE OR REPLACE FUNCTION public.get_stylist_available_balance(stylist_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  available_balance INTEGER;
BEGIN
  SELECT COALESCE(SUM(net_amount), 0)
  INTO available_balance
  FROM public.specialist_earnings
  WHERE stylist_id = stylist_uuid 
    AND status = 'available';
  
  RETURN available_balance;
END;
$$;
