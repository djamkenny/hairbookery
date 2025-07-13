-- Create direct_messages table for simple chat
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  sender_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for direct messages
CREATE POLICY "Users can view their own messages" 
ON public.direct_messages 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own messages" 
ON public.direct_messages 
FOR INSERT 
WITH CHECK (user_id = auth.uid() AND sender_type = 'user');

CREATE POLICY "Admins can view all messages" 
ON public.direct_messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE id::text = auth.uid()::text AND is_active = true
));

CREATE POLICY "Admins can create messages" 
ON public.direct_messages 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE id::text = auth.uid()::text AND is_active = true
) AND sender_type = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_direct_messages_updated_at
BEFORE UPDATE ON public.direct_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();