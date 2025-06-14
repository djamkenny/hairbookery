
-- Create a comprehensive notifications table if it doesn't exist with proper structure
-- First, let's check if we need to modify the existing notifications table
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create an enum for notification types if it doesn't exist
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'appointment_created',
        'appointment_confirmed', 
        'appointment_canceled',
        'appointment_completed',
        'payment_received',
        'payment_failed',
        'earnings_available',
        'system_alert'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create an enum for notification priority
DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Enable RLS if not already enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to generate appointment reference IDs
CREATE OR REPLACE FUNCTION generate_appointment_reference()
RETURNS TEXT AS $$
DECLARE
  reference_id TEXT;
BEGIN
  -- Generate format: APT-YYYYMMDD-XXXXX (where XXXXX is random 5 digit number)
  reference_id := 'APT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999 + 1)::TEXT, 5, '0');
  
  -- Check if this reference already exists, if so, generate a new one
  WHILE EXISTS (SELECT 1 FROM public.appointments WHERE order_id = reference_id) LOOP
    reference_id := 'APT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999 + 1)::TEXT, 5, '0');
  END LOOP;
  
  RETURN reference_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_related_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    related_id,
    action_url,
    priority,
    is_read
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_related_id,
    p_action_url,
    p_priority,
    false
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
