-- Fix database security vulnerabilities by adding secure search_path to all functions
-- This prevents SQL injection and privilege escalation attacks

-- Fix function: generate_appointment_reference
DROP FUNCTION IF EXISTS public.generate_appointment_reference();
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

-- Fix function: update_updated_at_column
DROP FUNCTION IF EXISTS public.update_updated_at_column();
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

-- Fix function: get_user_loyalty_points
DROP FUNCTION IF EXISTS public.get_user_loyalty_points(uuid);
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

-- Fix function: award_loyalty_points_for_appointment
DROP FUNCTION IF EXISTS public.award_loyalty_points_for_appointment();
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

-- Fix function: update_support_ticket_timestamp
DROP FUNCTION IF EXISTS public.update_support_ticket_timestamp();
CREATE OR REPLACE FUNCTION public.update_support_ticket_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix function: get_admin_total_users_count
DROP FUNCTION IF EXISTS public.get_admin_total_users_count();
CREATE OR REPLACE FUNCTION public.get_admin_total_users_count()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  total_count INTEGER;
  admin_exists BOOLEAN;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id::text = auth.uid()::text AND is_active = true
  ) INTO admin_exists;
  
  -- If not an admin, return 0
  IF NOT admin_exists THEN
    RETURN 0;
  END IF;
  
  -- Get total count of all profiles (bypasses RLS due to SECURITY DEFINER)
  SELECT COUNT(*)::INTEGER
  INTO total_count
  FROM public.profiles;
  
  RETURN total_count;
END;
$function$;

-- Fix function: get_admin_active_stylists_count
DROP FUNCTION IF EXISTS public.get_admin_active_stylists_count();
CREATE OR REPLACE FUNCTION public.get_admin_active_stylists_count()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  stylist_count INTEGER;
  admin_exists BOOLEAN;
BEGIN
  -- Check if the current user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id::text = auth.uid()::text AND is_active = true
  ) INTO admin_exists;
  
  -- If not an admin, return 0
  IF NOT admin_exists THEN
    RETURN 0;
  END IF;
  
  -- Get count of active stylists (bypasses RLS due to SECURITY DEFINER)
  SELECT COUNT(*)::INTEGER
  INTO stylist_count
  FROM public.profiles
  WHERE is_stylist = true AND availability = true;
  
  RETURN stylist_count;
END;
$function$;

-- Fix function: get_stylist_withdrawals
DROP FUNCTION IF EXISTS public.get_stylist_withdrawals(uuid);
CREATE OR REPLACE FUNCTION public.get_stylist_withdrawals(stylist_uuid uuid)
 RETURNS TABLE(id uuid, stylist_id uuid, amount integer, status text, bank_name text, account_number text, account_name text, notes text, processed_at timestamp with time zone, processed_by uuid, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    wr.id,
    wr.stylist_id,
    wr.amount,
    wr.status,
    wr.bank_name,
    wr.account_number,
    wr.account_name,
    wr.notes,
    wr.processed_at,
    wr.processed_by,
    wr.created_at,
    wr.updated_at
  FROM public.withdrawal_requests wr
  WHERE wr.stylist_id = stylist_uuid
  ORDER BY wr.created_at DESC;
END;
$function$;

-- Fix function: create_withdrawal_request
DROP FUNCTION IF EXISTS public.create_withdrawal_request(uuid, integer, text, text, text, text);
CREATE OR REPLACE FUNCTION public.create_withdrawal_request(p_stylist_id uuid, p_amount integer, p_bank_name text, p_account_number text, p_account_name text, p_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  withdrawal_id UUID;
  available_balance INTEGER;
BEGIN
  -- Check available balance
  SELECT public.get_stylist_available_balance(p_stylist_id) INTO available_balance;
  
  IF p_amount > available_balance THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %, Requested: %', available_balance, p_amount;
  END IF;
  
  -- Insert withdrawal request
  INSERT INTO public.withdrawal_requests (
    stylist_id,
    amount,
    bank_name,
    account_number,
    account_name,
    notes,
    status
  ) VALUES (
    p_stylist_id,
    p_amount,
    p_bank_name,
    p_account_number,
    p_account_name,
    p_notes,
    'pending'
  ) RETURNING id INTO withdrawal_id;
  
  RETURN withdrawal_id;
END;
$function$;

-- Fix function: create_notification
DROP FUNCTION IF EXISTS public.create_notification(uuid, text, text, text, uuid, text, text);
CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_title text, p_message text, p_type text, p_related_id uuid DEFAULT NULL::uuid, p_action_url text DEFAULT NULL::text, p_priority text DEFAULT 'normal'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    related_id,
    action_url,
    priority,
    is_read
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_related_id,
    p_action_url,
    p_priority,
    false
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- Fix function: create_complete_admin_user
DROP FUNCTION IF EXISTS public.create_complete_admin_user(text, text, text);
CREATE OR REPLACE FUNCTION public.create_complete_admin_user(p_email text, p_password text, p_full_name text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  admin_id UUID;
  auth_response JSONB;
BEGIN
  -- Check if admin already exists
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE email = p_email) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Admin user already exists'
    );
  END IF;
  
  -- Insert admin user with hashed password using crypt
  INSERT INTO public.admin_users (email, password_hash, full_name, role, is_active)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), p_full_name, 'admin', true)
  RETURNING id INTO admin_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Admin user created successfully',
    'admin_id', admin_id,
    'note', 'Please create corresponding Supabase auth user manually'
  );
END;
$function$;