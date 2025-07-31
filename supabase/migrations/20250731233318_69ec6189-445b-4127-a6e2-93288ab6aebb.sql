-- Add paystack_transaction_id column to payments table
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS paystack_transaction_id TEXT;