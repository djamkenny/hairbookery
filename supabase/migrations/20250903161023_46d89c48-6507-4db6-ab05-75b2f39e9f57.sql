-- Fix availability_status for laundry specialists who should be available
-- Update availability_status to 'available' for users who have availability = true but availability_status = 'unavailable'
-- This only applies when they haven't explicitly set their status to unavailable in settings

UPDATE public.profiles 
SET availability_status = 'available' 
WHERE availability = true 
  AND availability_status = 'unavailable'
  AND (is_stylist = true OR is_laundry_specialist = true);

-- Create or replace function to automatically set availability_status based on availability setting
CREATE OR REPLACE FUNCTION public.update_availability_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If availability is being set to true, ensure availability_status is 'available'
  IF NEW.availability = true AND OLD.availability = false THEN
    NEW.availability_status = 'available';
  END IF;
  
  -- If availability is being set to false, set availability_status to 'unavailable'
  IF NEW.availability = false AND OLD.availability = true THEN
    NEW.availability_status = 'unavailable';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically update availability_status when availability changes
DROP TRIGGER IF EXISTS trigger_update_availability_status ON public.profiles;
CREATE TRIGGER trigger_update_availability_status
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_availability_status();