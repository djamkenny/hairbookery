-- Fix the calculate_appointment_revenue function to handle null service prices
CREATE OR REPLACE FUNCTION public.calculate_appointment_revenue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  service_price NUMERIC(10,2) := 0;
  booking_fee NUMERIC(10,2) := 0;
  total_revenue NUMERIC(10,2) := 0;
  appointment_services_data RECORD;
BEGIN
  -- Only process when appointment status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    
    -- Get total service price from appointment_services
    SELECT SUM(COALESCE(s.price, 0))
    INTO service_price
    FROM public.appointment_services aps
    JOIN public.services s ON s.id = aps.service_id
    WHERE aps.appointment_id = NEW.id;
    
    -- Set default to 0 if no services found or prices are null
    service_price := COALESCE(service_price, 0);
    
    -- Calculate booking fee (15% of service price)
    booking_fee := service_price * 0.15;
    
    -- Total revenue is booking fee + service price
    total_revenue := booking_fee + service_price;
    
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
$function$