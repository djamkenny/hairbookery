-- Add paystack specific columns to payments table
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS paystack_reference TEXT,
ADD COLUMN IF NOT EXISTS paystack_access_code TEXT;