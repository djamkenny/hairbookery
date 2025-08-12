-- Storage policies for service images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view service images'
  ) THEN
    CREATE POLICY "Public can view service images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'service-images');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload own service images'
  ) THEN
    CREATE POLICY "Users can upload own service images"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'service-images'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own service images'
  ) THEN
    CREATE POLICY "Users can update own service images"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'service-images'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own service images'
  ) THEN
    CREATE POLICY "Users can delete own service images"
    ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'service-images'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Idempotently ensure stylist-images policies exist too
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view stylist images'
  ) THEN
    CREATE POLICY "Public can view stylist images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'stylist-images');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload own stylist images'
  ) THEN
    CREATE POLICY "Users can upload own stylist images"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'stylist-images'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own stylist images'
  ) THEN
    CREATE POLICY "Users can update own stylist images"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'stylist-images'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own stylist images'
  ) THEN
    CREATE POLICY "Users can delete own stylist images"
    ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'stylist-images'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;