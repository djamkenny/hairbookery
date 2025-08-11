-- Allow multiple service types under the same base service for a single appointment
-- by changing the unique constraint from (appointment_id, service_id) to (appointment_id, service_id, service_type_id)

BEGIN;

-- Drop old unique constraint if it exists
ALTER TABLE public.appointment_services
  DROP CONSTRAINT IF EXISTS appointment_services_appointment_id_service_id_key;

-- Add new unique constraint including service_type_id
ALTER TABLE public.appointment_services
  ADD CONSTRAINT appointment_services_unique_appointment_service_type
  UNIQUE (appointment_id, service_id, service_type_id);

-- Safety: prevent duplicate rows when service_type_id is NULL
CREATE UNIQUE INDEX IF NOT EXISTS appointment_services_unique_null_type
  ON public.appointment_services (appointment_id, service_id)
  WHERE service_type_id IS NULL;

COMMIT;