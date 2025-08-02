-- Create a security definer function to get active stylists count for admins
CREATE OR REPLACE FUNCTION public.get_admin_active_stylists_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
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
$function$