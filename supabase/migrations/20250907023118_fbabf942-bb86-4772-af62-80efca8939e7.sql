-- Fix database security vulnerabilities by updating functions in place
-- Add secure search_path to functions that are referenced by triggers

-- Update functions that are referenced by triggers (can't be dropped)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_appointment_revenue()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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
$function$;

CREATE OR REPLACE FUNCTION public.insert_laundry_status_history()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO public.laundry_status_history (order_id, status, updated_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_user_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.profiles
  SET 
    full_name = NEW.raw_user_meta_data->>'full_name',
    phone = NEW.raw_user_meta_data->>'phone',
    specialty = NEW.raw_user_meta_data->>'specialty',
    experience = NEW.raw_user_meta_data->>'experience',
    bio = NEW.raw_user_meta_data->>'bio',
    is_stylist = COALESCE((NEW.raw_user_meta_data->>'is_stylist')::BOOLEAN, false),
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    specialty,
    experience,
    bio,
    is_stylist
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'specialty',
    NEW.raw_user_meta_data->>'experience',
    NEW.raw_user_meta_data->>'bio',
    COALESCE((NEW.raw_user_meta_data->>'is_stylist')::BOOLEAN, false)
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  notification_count INTEGER;
BEGIN
  -- Count current notifications for this user
  SELECT COUNT(*) INTO notification_count
  FROM public.notifications
  WHERE user_id = NEW.user_id;
  
  -- If we have 20 or more notifications, keep only the newest 10
  IF notification_count >= 20 THEN
    DELETE FROM public.notifications
    WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id
      FROM public.notifications
      WHERE user_id = NEW.user_id
      ORDER BY created_at DESC
      LIMIT 10
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Now fix the other functions that can be safely replaced
CREATE OR REPLACE FUNCTION public.generate_appointment_reference()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  reference_id TEXT;
BEGIN
  -- Generate format: APT-YYYYMMDD-XXXXX (where XXXXX is random 5 digit number)
  reference_id := 'APT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999 + 1)::TEXT, 5, '0');
  
  -- Check if this reference already exists, if so, generate a new one
  WHILE EXISTS (SELECT 1 FROM public.appointments WHERE order_id = reference_id) LOOP
    reference_id := 'APT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999 + 1)::TEXT, 5, '0');
  END LOOP;
  
  RETURN reference_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_loyalty_points(user_uuid uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  total_points INTEGER;
BEGIN
  SELECT COALESCE(SUM(points), 0)
  INTO total_points
  FROM public.loyalty_points
  WHERE user_id = user_uuid;
  
  RETURN total_points;
END;
$function$;

CREATE OR REPLACE FUNCTION public.award_loyalty_points_for_appointment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Award 10 points when appointment status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.loyalty_points (user_id, points, earned_from, appointment_id)
    VALUES (NEW.client_id, 10, 'Completed appointment', NEW.id);
  END IF;
  
  RETURN NEW;
END;
$function$;