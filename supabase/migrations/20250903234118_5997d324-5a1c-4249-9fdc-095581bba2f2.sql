-- Remove base_price from cleaning_services table and add total_price column
ALTER TABLE public.cleaning_services DROP COLUMN IF EXISTS base_price;
ALTER TABLE public.cleaning_services ADD COLUMN IF NOT EXISTS total_price integer NOT NULL DEFAULT 0;

-- Update any existing records to use hourly_rate as total_price if needed
UPDATE public.cleaning_services 
SET total_price = COALESCE(hourly_rate * duration_hours, 0) 
WHERE total_price = 0;