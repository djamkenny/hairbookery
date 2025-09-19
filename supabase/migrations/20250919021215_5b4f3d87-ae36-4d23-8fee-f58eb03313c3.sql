-- Add portfolio_images field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_images TEXT[] DEFAULT '{}';

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can upload their portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their portfolio images" ON storage.objects;  
DROP POLICY IF EXISTS "Users can delete their portfolio images" ON storage.objects;

-- Create storage policies for stylist-images bucket to allow portfolio uploads
CREATE POLICY "Users can upload their portfolio images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'stylist-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view portfolio images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'stylist-images');

CREATE POLICY "Users can update their portfolio images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'stylist-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their portfolio images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'stylist-images' AND auth.uid()::text = (storage.foldername(name))[1]);