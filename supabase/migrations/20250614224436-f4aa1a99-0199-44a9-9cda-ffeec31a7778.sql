
-- First, let's delete any existing earnings records to avoid duplicates.
-- We will regenerate them with the correct logic.
TRUNCATE public.specialist_earnings;

-- Then, populate earnings for existing completed payments,
-- this time getting the stylist from the appointment record for better accuracy.
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
  AND a.stylist_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.specialist_earnings se 
    WHERE se.payment_id = p.id
  );
