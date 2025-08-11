-- Restrict public access to sensitive profile data while keeping safe stylist info available

-- 1) Remove public row-level access to profiles (stylist rows)
DROP POLICY IF EXISTS "Public read access for stylists" ON public.profiles;

-- 2) Create a safe RPC that returns only non-sensitive fields for stylists
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

-- 3) Allow both anonymous site visitors and logged-in users to execute the RPC
GRANT EXECUTE ON FUNCTION public.get_public_stylists(uuid) TO anon, authenticated;
