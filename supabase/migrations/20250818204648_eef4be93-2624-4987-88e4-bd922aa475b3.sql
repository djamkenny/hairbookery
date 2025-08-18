-- Add comment field to specialist_ratings table for feedback
ALTER TABLE public.specialist_ratings 
ADD COLUMN comment TEXT;

-- Add index for better performance when querying ratings with comments
CREATE INDEX idx_specialist_ratings_specialist_comment ON public.specialist_ratings(specialist_id) WHERE comment IS NOT NULL;