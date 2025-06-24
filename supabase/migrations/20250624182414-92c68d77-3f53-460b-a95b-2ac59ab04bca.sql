
-- First, we need to ensure all users who have submitted reviews have profiles
INSERT INTO public.profiles (id, email)
SELECT DISTINCT r.user_id, au.email 
FROM public.reviews r
JOIN auth.users au ON r.user_id = au.id
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = r.user_id
)
ON CONFLICT (id) DO NOTHING;

-- Now add the proper foreign key constraint
ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
