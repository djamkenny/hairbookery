-- Create appointment_services junction table for multiple services per appointment
CREATE TABLE public.appointment_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(appointment_id, service_id)
);

-- Enable RLS
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;

-- Create policies for appointment_services
CREATE POLICY "Users can view appointment services for their appointments" 
ON public.appointment_services 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.appointments 
    WHERE appointments.id = appointment_services.appointment_id 
    AND (appointments.client_id = auth.uid() OR appointments.stylist_id = auth.uid())
  )
);

CREATE POLICY "Users can create appointment services for their appointments" 
ON public.appointment_services 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.appointments 
    WHERE appointments.id = appointment_services.appointment_id 
    AND appointments.client_id = auth.uid()
  )
);

-- Also make service_id nullable in appointments table for backward compatibility
-- but we'll use the new junction table for multiple services
ALTER TABLE public.appointments ALTER COLUMN service_id DROP NOT NULL;