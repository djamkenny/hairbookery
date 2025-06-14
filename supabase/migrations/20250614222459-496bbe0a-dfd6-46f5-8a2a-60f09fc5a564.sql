
-- Create earnings table to track specialist earnings
CREATE TABLE IF NOT EXISTS public.specialist_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  gross_amount INTEGER NOT NULL, -- Total payment amount in pesewas
  platform_fee INTEGER NOT NULL, -- Platform commission in pesewas
  net_amount INTEGER NOT NULL, -- Amount due to specialist in pesewas
  platform_fee_percentage DECIMAL(5,2) NOT NULL DEFAULT 15.00, -- Platform fee percentage
  status TEXT NOT NULL DEFAULT 'available', -- pending, available, withdrawn
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create withdrawal requests table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
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
CREATE INDEX IF NOT EXISTS idx_specialist_earnings_stylist_id ON public.specialist_earnings(stylist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_earnings_status ON public.specialist_earnings(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_stylist_id ON public.withdrawal_requests(stylist_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);

-- Create triggers for updated_at
CREATE TRIGGER update_specialist_earnings_updated_at
  BEFORE UPDATE ON public.specialist_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to get stylist earnings
CREATE OR REPLACE FUNCTION public.get_stylist_earnings(stylist_uuid UUID)
RETURNS TABLE(
  id UUID,
  stylist_id UUID,
  appointment_id UUID,
  payment_id UUID,
  gross_amount INTEGER,
  platform_fee INTEGER,
  net_amount INTEGER,
  platform_fee_percentage DECIMAL,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    se.id,
    se.stylist_id,
    se.appointment_id,
    se.payment_id,
    se.gross_amount,
    se.platform_fee,
    se.net_amount,
    se.platform_fee_percentage,
    se.status,
    se.created_at,
    se.updated_at
  FROM public.specialist_earnings se
  WHERE se.stylist_id = stylist_uuid
  ORDER BY se.created_at DESC;
END;
$$;

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

-- Populate earnings for existing completed payments
INSERT INTO public.specialist_earnings (
  stylist_id,
  appointment_id,
  payment_id,
  gross_amount,
  platform_fee,
  net_amount,
  platform_fee_percentage,
  status
)
SELECT DISTINCT
  s.stylist_id,
  p.appointment_id,
  p.id as payment_id,
  p.amount as gross_amount,
  ROUND(p.amount * 0.15) as platform_fee,
  p.amount - ROUND(p.amount * 0.15) as net_amount,
  15.00 as platform_fee_percentage,
  'available' as status
FROM public.payments p
JOIN public.services s ON p.service_id = s.id
WHERE p.status = 'completed'
  AND s.stylist_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.specialist_earnings se 
    WHERE se.payment_id = p.id
  );
