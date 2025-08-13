-- Fix admin RLS policies to use email-based verification from JWT claims instead of matching admin_users.id to auth.uid(),
-- which prevented admins from accessing messages unless their admin_users.id equaled the Supabase Auth user id.

-- DIRECT MESSAGES
DROP POLICY IF EXISTS "Admins can create messages" ON public.direct_messages;
CREATE POLICY "Admins can create messages"
ON public.direct_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE lower(au.email) = lower((auth.jwt() ->> 'email'))
      AND au.is_active = true
  )
  AND sender_type = 'admin'
);

DROP POLICY IF EXISTS "Admins can view all messages" ON public.direct_messages;
CREATE POLICY "Admins can view all messages"
ON public.direct_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE lower(au.email) = lower((auth.jwt() ->> 'email'))
      AND au.is_active = true
  )
);

-- CHAT MESSAGES (support ticket messages)
DROP POLICY IF EXISTS "Admins can create messages" ON public.chat_messages;
CREATE POLICY "Admins can create messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE lower(au.email) = lower((auth.jwt() ->> 'email'))
      AND au.is_active = true
  )
);

DROP POLICY IF EXISTS "Admins can view all messages" ON public.chat_messages;
CREATE POLICY "Admins can view all messages"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE lower(au.email) = lower((auth.jwt() ->> 'email'))
      AND au.is_active = true
  )
);

-- SUPPORT TICKETS
DROP POLICY IF EXISTS "Admins can update all tickets" ON public.support_tickets;
CREATE POLICY "Admins can update all tickets"
ON public.support_tickets
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE lower(au.email) = lower((auth.jwt() ->> 'email'))
      AND au.is_active = true
  )
);

DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE lower(au.email) = lower((auth.jwt() ->> 'email'))
      AND au.is_active = true
  )
);
