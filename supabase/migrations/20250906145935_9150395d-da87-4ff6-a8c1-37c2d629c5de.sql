-- Fix database security vulnerabilities by adding secure search_path to all functions
-- This prevents SQL injection and privilege escalation attacks

-- Fix remaining functions that aren't referenced by triggers
DROP FUNCTION IF EXISTS public.get_stylist_revenue_summary(uuid);
CREATE OR REPLACE FUNCTION public.get_stylist_revenue_summary(stylist_uuid uuid)
 RETURNS TABLE(total_revenue numeric, total_bookings integer, total_booking_fees numeric, total_service_revenue numeric, avg_booking_value numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Fix function: get_stylist_earnings
DROP FUNCTION IF EXISTS public.get_stylist_earnings(uuid);
CREATE OR REPLACE FUNCTION public.get_stylist_earnings(stylist_uuid uuid)
 RETURNS TABLE(id uuid, stylist_id uuid, appointment_id uuid, payment_id uuid, gross_amount integer, platform_fee integer, net_amount integer, platform_fee_percentage numeric, status text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Fix function: get_stylist_available_balance
DROP FUNCTION IF EXISTS public.get_stylist_available_balance(uuid);
CREATE OR REPLACE FUNCTION public.get_stylist_available_balance(stylist_uuid uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Fix function: authenticate_admin
DROP FUNCTION IF EXISTS public.authenticate_admin(text, text);
CREATE OR REPLACE FUNCTION public.authenticate_admin(p_email text, p_password text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  admin_record RECORD;
  password_match BOOLEAN;
BEGIN
  -- Find admin user by email
  SELECT * INTO admin_record
  FROM public.admin_users
  WHERE email = p_email AND is_active = true;
  
  -- Check if admin exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  -- Verify password (using crypt extension)
  SELECT (admin_record.password_hash = crypt(p_password, admin_record.password_hash)) INTO password_match;
  
  IF NOT password_match THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  -- Update last login time
  UPDATE public.admin_users 
  SET last_login_at = now(), updated_at = now()
  WHERE id = admin_record.id;
  
  -- Return success with admin data
  RETURN json_build_object(
    'success', true,
    'admin', json_build_object(
      'id', admin_record.id,
      'email', admin_record.email,
      'full_name', admin_record.full_name,
      'role', admin_record.role
    )
  );
END;
$function$;

-- Fix function: create_admin_user
DROP FUNCTION IF EXISTS public.create_admin_user(text, text, text);
CREATE OR REPLACE FUNCTION public.create_admin_user(p_email text, p_password text, p_full_name text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  admin_id UUID;
BEGIN
  -- Check if admin already exists
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE email = p_email) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Admin user already exists'
    );
  END IF;
  
  -- Insert new admin user with hashed password
  INSERT INTO public.admin_users (email, password_hash, full_name)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), p_full_name)
  RETURNING id INTO admin_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Admin user created successfully',
    'admin_id', admin_id
  );
END;
$function$;

-- Fix function: calculate_appointment_revenue
DROP FUNCTION IF EXISTS public.calculate_appointment_revenue();
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

-- Fix function: check_stylist_availability
DROP FUNCTION IF EXISTS public.check_stylist_availability(uuid, date);
CREATE OR REPLACE FUNCTION public.check_stylist_availability(stylist_uuid uuid, check_date date DEFAULT CURRENT_DATE)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  stylist_availability boolean;
  daily_limit integer;
  appointments_count integer;
  result jsonb;
BEGIN
  -- Get stylist availability settings - check for all specialist types
  SELECT availability, daily_appointment_limit
  INTO stylist_availability, daily_limit
  FROM public.profiles
  WHERE id = stylist_uuid AND (is_stylist = true OR is_laundry_specialist = true OR is_cleaning_specialist = true);
  
  -- If stylist not found or not available
  IF NOT FOUND OR NOT stylist_availability THEN
    RETURN jsonb_build_object(
      'available', false,
      'status', 'unavailable',
      'reason', 'Specialist is currently unavailable'
    );
  END IF;
  
  -- Count appointments for the given date (beauty, laundry, and cleaning appointments)
  SELECT (
    COALESCE((
      SELECT COUNT(*)::integer
      FROM public.appointments
      WHERE stylist_id = stylist_uuid 
        AND appointment_date = check_date
        AND status NOT IN ('canceled', 'completed')
    ), 0) +
    COALESCE((
      SELECT COUNT(*)::integer
      FROM public.laundry_orders
      WHERE specialist_id = stylist_uuid 
        AND pickup_date = check_date
        AND status NOT IN ('canceled', 'delivered')
    ), 0) +
    COALESCE((
      SELECT COUNT(*)::integer
      FROM public.cleaning_orders
      WHERE specialist_id = stylist_uuid 
        AND service_date = check_date
        AND status NOT IN ('canceled', 'completed')
    ), 0)
  ) INTO appointments_count;
  
  -- Check if limit is reached
  IF appointments_count >= daily_limit THEN
    RETURN jsonb_build_object(
      'available', false,
      'status', 'full',
      'reason', 'Fully booked for this date',
      'appointments_count', appointments_count,
      'daily_limit', daily_limit
    );
  END IF;
  
  -- Return available status
  RETURN jsonb_build_object(
    'available', true,
    'status', 'available',
    'appointments_count', appointments_count,
    'daily_limit', daily_limit,
    'slots_remaining', daily_limit - appointments_count
  );
END;
$function$;

-- Fix function: cleanup_old_notifications
DROP FUNCTION IF EXISTS public.cleanup_old_notifications();
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

-- Fix function: get_laundry_specialist_orders
DROP FUNCTION IF EXISTS public.get_laundry_specialist_orders(uuid);
CREATE OR REPLACE FUNCTION public.get_laundry_specialist_orders(specialist_uuid uuid)
 RETURNS TABLE(id uuid, client_id uuid, order_number text, service_type text, pickup_address text, delivery_address text, pickup_date date, pickup_time text, delivery_date date, delivery_time text, status text, amount integer, items_description text, weight_kg numeric, created_at timestamp with time zone, client_name text, client_phone text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    lo.id,
    lo.client_id,
    lo.order_number,
    lo.service_type,
    lo.pickup_address,
    lo.delivery_address,
    lo.pickup_date,
    lo.pickup_time,
    lo.delivery_date,
    lo.delivery_time,
    lo.status,
    lo.amount,
    lo.items_description,
    lo.weight_kg,
    lo.created_at,
    p.full_name as client_name,
    p.phone as client_phone
  FROM public.laundry_orders lo
  LEFT JOIN public.profiles p ON p.id = lo.client_id
  WHERE lo.specialist_id = specialist_uuid
  ORDER BY lo.created_at DESC;
END;
$function$;

-- Fix function: check_service_permissions
DROP FUNCTION IF EXISTS public.check_service_permissions();
CREATE OR REPLACE FUNCTION public.check_service_permissions()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  _user_id uuid;
  is_stylist boolean;
BEGIN
  -- Get the current user ID
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object(
      'canCreate', false,
      'canUpdate', false,
      'canDelete', false,
      'error', 'Not authenticated'
    );
  END IF;
  
  -- Check if user is a stylist
  SELECT p.is_stylist INTO is_stylist
  FROM public.profiles p
  WHERE p.id = _user_id;
  
  IF is_stylist IS NULL OR is_stylist = false THEN
    RETURN jsonb_build_object(
      'canCreate', false,
      'canUpdate', false,
      'canDelete', false,
      'error', 'User is not a stylist',
      'user_id', _user_id
    );
  END IF;
  
  -- Return permissions
  RETURN jsonb_build_object(
    'canCreate', true,
    'canUpdate', true,
    'canDelete', true,
    'user_id', _user_id,
    'is_stylist', is_stylist
  );
END;
$function$;