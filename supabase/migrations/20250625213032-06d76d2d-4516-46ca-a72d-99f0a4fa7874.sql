
-- Update the RLS policy to allow everyone to view reviews (not just authenticated users)
DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;

-- Create a new policy that allows anyone (including non-authenticated users) to view reviews
CREATE POLICY "Anyone can view reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (true);
