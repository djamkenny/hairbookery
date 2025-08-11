-- Link service types to appointments for accurate dashboard display
ALTER TABLE public.appointment_services
ADD COLUMN IF NOT EXISTS service_type_id UUID REFERENCES public.service_types(id);

-- Helpful index for lookups
CREATE INDEX IF NOT EXISTS idx_appointment_services_service_type_id
  ON public.appointment_services(service_type_id);