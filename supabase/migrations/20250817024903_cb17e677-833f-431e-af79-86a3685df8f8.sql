-- Update RLS policies for direct_messages to work with both auth users and admin sessions
-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can create messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.direct_messages;

-- Create new admin policies that are more flexible
CREATE POLICY "Service can insert messages for admins" 
ON public.direct_messages 
FOR INSERT 
WITH CHECK (sender_type = 'admin');

CREATE POLICY "Service can view all messages for admin interface" 
ON public.direct_messages 
FOR SELECT 
USING (true);

-- Also allow updates and deletes for admin functionality
CREATE POLICY "Service can update messages" 
ON public.direct_messages 
FOR UPDATE 
USING (true);

CREATE POLICY "Service can delete messages for admin" 
ON public.direct_messages 
FOR DELETE 
USING (sender_type = 'admin' OR auth.uid() IS NOT NULL);