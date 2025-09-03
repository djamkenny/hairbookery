-- Add cleaning specialist support to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_cleaning_specialist boolean DEFAULT false;

-- Create cleaning_services table
CREATE TABLE public.cleaning_services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  base_price integer NOT NULL DEFAULT 0, -- in cents
  hourly_rate integer, -- in cents per hour  
  duration_hours integer DEFAULT 2,
  service_category text NOT NULL, -- 'home', 'office', 'deep', 'carpet', 'post_construction'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on cleaning_services
ALTER TABLE public.cleaning_services ENABLE ROW LEVEL SECURITY;

-- Create policies for cleaning_services
CREATE POLICY "Anyone can view cleaning services" 
ON public.cleaning_services 
FOR SELECT 
USING (true);

CREATE POLICY "Cleaning specialists can create services" 
ON public.cleaning_services 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_cleaning_specialist = true
));

CREATE POLICY "Cleaning specialists can update services" 
ON public.cleaning_services 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_cleaning_specialist = true
));

CREATE POLICY "Cleaning specialists can delete services" 
ON public.cleaning_services 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_cleaning_specialist = true
));

-- Create cleaning_orders table
CREATE TABLE public.cleaning_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL,
  specialist_id uuid,
  order_number text NOT NULL DEFAULT (
    'CLN-' || to_char(now(), 'YYYYMMDD') || '-' || 
    lpad(floor(random() * 99999 + 1)::text, 5, '0')
  ),
  service_type text NOT NULL, -- 'home', 'office', 'deep', 'carpet', 'post_construction'
  property_type text NOT NULL, -- 'apartment', 'house', 'office'
  num_rooms integer,
  num_bathrooms integer,
  square_footage integer,
  service_date date NOT NULL,
  service_time text NOT NULL,
  duration_hours integer NOT NULL DEFAULT 2,
  service_address text NOT NULL,
  special_instructions text,
  addon_services text[], -- array of addon service names
  amount integer, -- in cents
  payment_id uuid,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Customer information
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL
);

-- Enable RLS on cleaning_orders
ALTER TABLE public.cleaning_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for cleaning_orders
CREATE POLICY "Users can create their own cleaning orders" 
ON public.cleaning_orders 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can view their own cleaning orders" 
ON public.cleaning_orders 
FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() = specialist_id);

CREATE POLICY "Users can update their own cleaning orders" 
ON public.cleaning_orders 
FOR UPDATE 
USING (auth.uid() = client_id OR auth.uid() = specialist_id);

-- Create trigger for updated_at
CREATE TRIGGER update_cleaning_services_updated_at
BEFORE UPDATE ON public.cleaning_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cleaning_orders_updated_at
BEFORE UPDATE ON public.cleaning_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Drop and recreate the get_public_stylists function with cleaning specialist support
DROP FUNCTION IF EXISTS public.get_public_stylists(uuid);

CREATE OR REPLACE FUNCTION public.get_public_stylists(p_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(id uuid, full_name text, specialty text, experience text, bio text, avatar_url text, card_image_url text, location text, availability boolean, availability_status text, is_stylist boolean, is_laundry_specialist boolean, is_cleaning_specialist boolean, service_type text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.full_name,
    p.specialty,
    p.experience,
    p.bio,
    p.avatar_url,
    p.card_image_url,
    p.location,
    p.availability,
    p.availability_status,
    p.is_stylist,
    p.is_laundry_specialist,
    p.is_cleaning_specialist,
    CASE 
      WHEN p.is_cleaning_specialist = true THEN 'cleaning'
      WHEN p.is_laundry_specialist = true THEN 'laundry'
      WHEN p.is_stylist = true THEN 'beauty'
      ELSE 'beauty'
    END as service_type
  FROM public.profiles p
  WHERE (p.is_stylist = true OR p.is_laundry_specialist = true OR p.is_cleaning_specialist = true)
    AND (p_id IS NULL OR p.id = p_id);
$function$;

-- Update check_stylist_availability function to include cleaning specialists
CREATE OR REPLACE FUNCTION public.check_stylist_availability(stylist_uuid uuid, check_date date DEFAULT CURRENT_DATE)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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