
-- Create a table for reviews
CREATE TABLE public.reviews (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read reviews (public reviews)
CREATE POLICY "Anyone can view reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (true);

-- Create a policy that allows anyone to insert reviews (public submission)
CREATE POLICY "Anyone can create reviews" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (true);
