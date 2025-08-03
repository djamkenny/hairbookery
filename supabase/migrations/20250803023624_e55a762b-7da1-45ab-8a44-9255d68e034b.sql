-- Allow stylists to view client profiles for their appointments
CREATE POLICY "Stylists can view client profiles for their appointments" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM appointments 
    WHERE appointments.client_id = profiles.id 
      AND appointments.stylist_id = auth.uid()
  )
);