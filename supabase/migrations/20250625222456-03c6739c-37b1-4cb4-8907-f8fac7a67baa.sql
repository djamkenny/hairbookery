
-- Create specialist_ratings table for client-to-specialist ratings
CREATE TABLE public.specialist_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specialist_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, specialist_id)
);

-- Enable RLS
ALTER TABLE public.specialist_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view all specialist ratings" 
  ON public.specialist_ratings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own specialist ratings" 
  ON public.specialist_ratings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own specialist ratings" 
  ON public.specialist_ratings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own specialist ratings" 
  ON public.specialist_ratings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_specialist_ratings_updated_at
  BEFORE UPDATE ON public.specialist_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
