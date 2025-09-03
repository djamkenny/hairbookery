-- Add specialist_id column to laundry_services table
ALTER TABLE public.laundry_services 
ADD COLUMN specialist_id UUID REFERENCES public.profiles(id);

-- Add specialist_id column to cleaning_services table  
ALTER TABLE public.cleaning_services 
ADD COLUMN specialist_id UUID REFERENCES public.profiles(id);

-- Update RLS policies for laundry_services to filter by specialist_id
DROP POLICY IF EXISTS "Laundry specialists can create services" ON public.laundry_services;
DROP POLICY IF EXISTS "Laundry specialists can update services" ON public.laundry_services;
DROP POLICY IF EXISTS "Laundry specialists can delete services" ON public.laundry_services;

CREATE POLICY "Laundry specialists can create their own services" 
ON public.laundry_services 
FOR INSERT 
WITH CHECK (
  auth.uid() = specialist_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_laundry_specialist = true
  )
);

CREATE POLICY "Laundry specialists can update their own services" 
ON public.laundry_services 
FOR UPDATE 
USING (
  auth.uid() = specialist_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_laundry_specialist = true
  )
);

CREATE POLICY "Laundry specialists can delete their own services" 
ON public.laundry_services 
FOR DELETE 
USING (
  auth.uid() = specialist_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_laundry_specialist = true
  )
);

CREATE POLICY "Laundry specialists can view their own services" 
ON public.laundry_services 
FOR SELECT 
USING (auth.uid() = specialist_id);

-- Update RLS policies for cleaning_services to filter by specialist_id
DROP POLICY IF EXISTS "Cleaning specialists can create services" ON public.cleaning_services;
DROP POLICY IF EXISTS "Cleaning specialists can update services" ON public.cleaning_services;  
DROP POLICY IF EXISTS "Cleaning specialists can delete services" ON public.cleaning_services;

CREATE POLICY "Cleaning specialists can create their own services" 
ON public.cleaning_services 
FOR INSERT 
WITH CHECK (
  auth.uid() = specialist_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_cleaning_specialist = true
  )
);

CREATE POLICY "Cleaning specialists can update their own services" 
ON public.cleaning_services 
FOR UPDATE 
USING (
  auth.uid() = specialist_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_cleaning_specialist = true
  )
);

CREATE POLICY "Cleaning specialists can delete their own services" 
ON public.cleaning_services 
FOR DELETE 
USING (
  auth.uid() = specialist_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_cleaning_specialist = true
  )
);

CREATE POLICY "Cleaning specialists can view their own services" 
ON public.cleaning_services 
FOR SELECT 
USING (auth.uid() = specialist_id);