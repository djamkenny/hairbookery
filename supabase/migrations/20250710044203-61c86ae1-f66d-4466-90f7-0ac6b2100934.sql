
-- Add admin policies for support_tickets table
CREATE POLICY "Admins can view all tickets" 
  ON public.support_tickets 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id::text = auth.uid()::text 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can update all tickets" 
  ON public.support_tickets 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id::text = auth.uid()::text 
      AND is_active = true
    )
  );

-- Add admin policies for chat_messages table  
CREATE POLICY "Admins can view all messages" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id::text = auth.uid()::text 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can create messages" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id::text = auth.uid()::text 
      AND is_active = true
    )
  );
