-- Harden function with explicit search_path to satisfy linter
CREATE OR REPLACE FUNCTION public.get_public_stylists(p_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  full_name text,
  specialty text,
  experience text,
  bio text,
  avatar_url text,
  card_image_url text,
  location text,
  availability boolean,
  availability_status text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
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
    p.availability_status
  FROM public.profiles p
  WHERE p.is_stylist = true
    AND (p_id IS NULL OR p.id = p_id);
$$;