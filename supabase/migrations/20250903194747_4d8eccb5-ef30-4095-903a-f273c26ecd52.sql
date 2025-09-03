-- Update check_stylist_availability function to work with both beauty and laundry specialists
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
  -- Get stylist availability settings - check for both beauty and laundry specialists
  SELECT availability, daily_appointment_limit
  INTO stylist_availability, daily_limit
  FROM public.profiles
  WHERE id = stylist_uuid AND (is_stylist = true OR is_laundry_specialist = true);
  
  -- If stylist not found or not available
  IF NOT FOUND OR NOT stylist_availability THEN
    RETURN jsonb_build_object(
      'available', false,
      'status', 'unavailable',
      'reason', 'Specialist is currently unavailable'
    );
  END IF;
  
  -- Count appointments for the given date (both beauty and laundry appointments)
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