
-- Add availability and daily appointment limit columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS availability BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS daily_appointment_limit INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available';

-- Create a function to check if a stylist is available for a given date
CREATE OR REPLACE FUNCTION public.check_stylist_availability(
  stylist_uuid uuid,
  check_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stylist_availability boolean;
  daily_limit integer;
  appointments_count integer;
  result jsonb;
BEGIN
  -- Get stylist availability settings
  SELECT availability, daily_appointment_limit
  INTO stylist_availability, daily_limit
  FROM public.profiles
  WHERE id = stylist_uuid AND is_stylist = true;
  
  -- If stylist not found or not available
  IF NOT FOUND OR NOT stylist_availability THEN
    RETURN jsonb_build_object(
      'available', false,
      'status', 'unavailable',
      'reason', 'Stylist is currently unavailable'
    );
  END IF;
  
  -- Count appointments for the given date
  SELECT COUNT(*)::integer
  INTO appointments_count
  FROM public.appointments
  WHERE stylist_id = stylist_uuid 
    AND appointment_date = check_date
    AND status NOT IN ('canceled', 'completed');
  
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
$$;

-- Create a trigger to update availability status when appointments change
CREATE OR REPLACE FUNCTION public.update_stylist_availability_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  availability_info jsonb;
BEGIN
  -- Check availability for the stylist
  SELECT public.check_stylist_availability(
    COALESCE(NEW.stylist_id, OLD.stylist_id),
    COALESCE(NEW.appointment_date, OLD.appointment_date)
  ) INTO availability_info;
  
  -- Update the stylist's availability status
  UPDATE public.profiles
  SET availability_status = CASE 
    WHEN (availability_info->>'available')::boolean THEN 'available'
    WHEN availability_info->>'status' = 'full' THEN 'full'
    ELSE 'unavailable'
  END,
  updated_at = now()
  WHERE id = COALESCE(NEW.stylist_id, OLD.stylist_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for appointment changes
DROP TRIGGER IF EXISTS update_availability_on_appointment_change ON public.appointments;
CREATE TRIGGER update_availability_on_appointment_change
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_stylist_availability_status();
