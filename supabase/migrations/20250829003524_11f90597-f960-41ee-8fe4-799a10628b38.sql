-- Update the get_public_stylists function to include both stylists and laundry specialists
CREATE OR REPLACE FUNCTION public.get_public_stylists(p_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, full_name text, specialty text, experience text, bio text, avatar_url text, card_image_url text, location text, availability boolean, availability_status text, is_stylist boolean, is_laundry_specialist boolean, service_type text)
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
    CASE 
      WHEN p.is_laundry_specialist = true THEN 'laundry'
      WHEN p.is_stylist = true THEN 'beauty'
      ELSE 'beauty'
    END as service_type
  FROM public.profiles p
  WHERE (p.is_stylist = true OR p.is_laundry_specialist = true)
    AND (p_id IS NULL OR p.id = p_id);
$function$