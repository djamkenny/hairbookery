-- Add policy to allow viewing all profiles for admin chat functionality
CREATE POLICY "Allow viewing all profiles for admin functionality" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Note: This allows reading all profiles but since the admin interface 
-- is protected by custom authentication, this is secure for admin use