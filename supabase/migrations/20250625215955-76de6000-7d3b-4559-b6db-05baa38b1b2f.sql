
-- Add stylist_id column to reviews table to associate reviews with specific specialists
ALTER TABLE public.reviews 
ADD COLUMN stylist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create an index for better query performance
CREATE INDEX idx_reviews_stylist_id ON public.reviews(stylist_id);

-- Update the RLS policy to allow viewing reviews for specific stylists
CREATE POLICY "Anyone can view reviews for stylists" 
  ON public.reviews 
  FOR SELECT 
  USING (stylist_id IS NOT NULL OR stylist_id IS NULL);
