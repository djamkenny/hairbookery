
-- Add comprehensive RLS policies for admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view other admin accounts
CREATE POLICY "Admins can view admin accounts" 
  ON public.admin_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users a 
      WHERE a.email = current_setting('request.jwt.claims', true)::json->>'email' 
      AND a.is_active = true
    )
  );

-- Add RLS policies for sensitive tables that were missing them
ALTER TABLE public.revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Revenue tracking - only admins and the stylist can view their own revenue
CREATE POLICY "Stylists can view own revenue" 
  ON public.revenue_tracking 
  FOR SELECT 
  USING (stylist_id = auth.uid());

CREATE POLICY "Admins can view all revenue" 
  ON public.revenue_tracking 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users a 
      WHERE a.email = current_setting('request.jwt.claims', true)::json->>'email' 
      AND a.is_active = true
    )
  );

-- Specialist earnings - only the stylist can view their own earnings
CREATE POLICY "Stylists can view own earnings" 
  ON public.specialist_earnings 
  FOR SELECT 
  USING (stylist_id = auth.uid());

CREATE POLICY "Stylists can update own earnings status" 
  ON public.specialist_earnings 
  FOR UPDATE 
  USING (stylist_id = auth.uid());

-- Withdrawal requests - only the stylist can view/create their own requests
CREATE POLICY "Stylists can view own withdrawal requests" 
  ON public.withdrawal_requests 
  FOR SELECT 
  USING (stylist_id = auth.uid());

CREATE POLICY "Stylists can create withdrawal requests" 
  ON public.withdrawal_requests 
  FOR INSERT 
  WITH CHECK (stylist_id = auth.uid());

-- Add database constraints for input validation
ALTER TABLE public.profiles 
  ADD CONSTRAINT valid_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.profiles 
  ADD CONSTRAINT valid_phone_format 
  CHECK (phone IS NULL OR phone ~ '^[\+]?[0-9\-\(\)\s]{7,20}$');

ALTER TABLE public.services 
  ADD CONSTRAINT positive_price 
  CHECK (price > 0);

ALTER TABLE public.services 
  ADD CONSTRAINT positive_duration 
  CHECK (duration > 0);

ALTER TABLE public.specialist_ratings 
  ADD CONSTRAINT valid_rating_range 
  CHECK (rating >= 1 AND rating <= 5);

-- Add audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  user_id UUID,
  details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_logs (event_type, user_id, details, created_at)
  VALUES (event_type, user_id, details, NOW());
EXCEPTION WHEN OTHERS THEN
  -- Log to system if security_logs doesn't exist
  RAISE LOG 'Security Event - Type: %, User: %, Details: %', event_type, user_id, details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create security logs table
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view security logs" 
  ON public.security_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users a 
      WHERE a.email = current_setting('request.jwt.claims', true)::json->>'email' 
      AND a.is_active = true
    )
  );
