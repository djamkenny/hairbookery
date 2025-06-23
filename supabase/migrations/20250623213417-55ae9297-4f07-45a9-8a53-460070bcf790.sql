
-- Create a revenue tracking table
CREATE TABLE public.revenue_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stylist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  booking_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  service_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_revenue NUMERIC(10,2) NOT NULL DEFAULT 0,
  revenue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.revenue_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for revenue_tracking
CREATE POLICY "Stylists can view their own revenue"
ON public.revenue_tracking
FOR SELECT
USING (stylist_id = auth.uid());

CREATE POLICY "Service can insert revenue records"
ON public.revenue_tracking
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service can update revenue records"
ON public.revenue_tracking
FOR UPDATE
USING (true);

-- Create indexes for performance
CREATE INDEX idx_revenue_tracking_stylist_id ON public.revenue_tracking(stylist_id);
CREATE INDEX idx_revenue_tracking_date ON public.revenue_tracking(revenue_date);

-- Create trigger for updated_at
CREATE TRIGGER update_revenue_tracking_updated_at
  BEFORE UPDATE ON public.revenue_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to calculate and update revenue
CREATE OR REPLACE FUNCTION public.calculate_appointment_revenue()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  service_price NUMERIC(10,2);
  booking_fee NUMERIC(10,2);
  total_revenue NUMERIC(10,2);
BEGIN
  -- Only process when appointment status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get service price
    SELECT price INTO service_price
    FROM public.services
    WHERE id = NEW.service_id;
    
    -- Calculate booking fee (20% of service price)
    booking_fee := COALESCE(service_price * 0.20, 0);
    
    -- Total revenue is booking fee + service price
    total_revenue := COALESCE(booking_fee + service_price, 0);
    
    -- Insert revenue record
    INSERT INTO public.revenue_tracking (
      stylist_id,
      appointment_id,
      booking_fee,
      service_amount,
      total_revenue,
      revenue_date
    ) VALUES (
      NEW.stylist_id,
      NEW.id,
      booking_fee,
      service_price,
      total_revenue,
      NEW.appointment_date
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically calculate revenue when appointments are completed
CREATE TRIGGER calculate_revenue_on_completion
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_appointment_revenue();

-- Create function to get stylist revenue summary
CREATE OR REPLACE FUNCTION public.get_stylist_revenue_summary(stylist_uuid UUID)
RETURNS TABLE(
  total_revenue NUMERIC,
  total_bookings INTEGER,
  total_booking_fees NUMERIC,
  total_service_revenue NUMERIC,
  avg_booking_value NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(rt.total_revenue), 0) as total_revenue,
    COALESCE(COUNT(rt.id)::INTEGER, 0) as total_bookings,
    COALESCE(SUM(rt.booking_fee), 0) as total_booking_fees,
    COALESCE(SUM(rt.service_amount), 0) as total_service_revenue,
    CASE 
      WHEN COUNT(rt.id) > 0 THEN COALESCE(SUM(rt.total_revenue) / COUNT(rt.id), 0)
      ELSE 0
    END as avg_booking_value
  FROM public.revenue_tracking rt
  WHERE rt.stylist_id = stylist_uuid;
END;
$$;
