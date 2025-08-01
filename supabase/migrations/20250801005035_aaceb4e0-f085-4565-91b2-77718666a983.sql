-- Add metadata column to notifications table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'metadata'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN metadata jsonb;
    END IF;
END $$;