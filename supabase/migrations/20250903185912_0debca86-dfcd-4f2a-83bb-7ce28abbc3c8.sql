-- Allow anonymous users to view services (for browsing specialists)
-- But keep other operations (INSERT, UPDATE, DELETE) restricted to authenticated users

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;

-- Create a new policy that allows anonymous users to view services
CREATE POLICY "Public can view services" 
ON public.services 
FOR SELECT 
USING (true);

-- Ensure the existing policies for modifications remain secure
-- These policies already exist and are properly secured