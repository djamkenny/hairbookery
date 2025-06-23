
-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true);

-- Create policy to allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload service images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to view all service images (public)
CREATE POLICY "Anyone can view service images" ON storage.objects
FOR SELECT USING (bucket_id = 'service-images');

-- Create policy to allow users to update their own service images
CREATE POLICY "Users can update their own service images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to delete their own service images
CREATE POLICY "Users can delete their own service images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'service-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
