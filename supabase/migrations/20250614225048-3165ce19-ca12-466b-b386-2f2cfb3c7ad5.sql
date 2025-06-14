
-- Step 1: Attempt to link orphaned payments to their corresponding appointments
-- This is for older records where the direct link might be missing.
UPDATE public.payments p
SET appointment_id = a.id
FROM public.appointments a
WHERE p.service_id = a.service_id 
  AND p.user_id = a.client_id
  AND p.appointment_id IS NULL
  AND a.status = 'completed';

-- Step 2: Update payment statuses to 'completed' for all completed appointments
-- This ensures that any payment associated with a completed appointment is also marked as completed.
UPDATE public.payments p
SET status = 'completed'
FROM public.appointments a
WHERE p.appointment_id = a.id
  AND a.status = 'completed'
  AND p.status != 'completed';

-- Step 3: Clear out any old earnings data and regenerate it from scratch
-- This ensures a clean slate and accurate calculation based on the corrected data.
TRUNCATE public.specialist_earnings;

INSERT INTO public.specialist_earnings (
  stylist_id,
  appointment_id,
  payment_id,
  gross_amount,
  platform_fee,
  net_amount,
  platform_fee_percentage,
  status
)
SELECT DISTINCT
  a.stylist_id,
  p.appointment_id,
  p.id as payment_id,
  p.amount as gross_amount,
  ROUND(p.amount * 0.15) as platform_fee,
  p.amount - ROUND(p.amount * 0.15) as net_amount,
  15.00 as platform_fee_percentage,
  'available' as status
FROM public.payments p
JOIN public.appointments a ON p.appointment_id = a.id
WHERE p.status = 'completed'
  AND p.appointment_id IS NOT NULL
  AND a.stylist_id IS NOT NULL;
