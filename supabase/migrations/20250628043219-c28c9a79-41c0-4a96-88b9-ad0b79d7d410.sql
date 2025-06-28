
-- Create a function to automatically clean up old notifications
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS TRIGGER AS $$
DECLARE
  notification_count INTEGER;
BEGIN
  -- Count current notifications for this user
  SELECT COUNT(*) INTO notification_count
  FROM public.notifications
  WHERE user_id = NEW.user_id;
  
  -- If we have 20 or more notifications, keep only the newest 10
  IF notification_count >= 20 THEN
    DELETE FROM public.notifications
    WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id
      FROM public.notifications
      WHERE user_id = NEW.user_id
      ORDER BY created_at DESC
      LIMIT 10
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run after each notification insert
DROP TRIGGER IF EXISTS trigger_cleanup_notifications ON public.notifications;
CREATE TRIGGER trigger_cleanup_notifications
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_notifications();
