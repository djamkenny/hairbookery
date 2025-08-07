-- Create service_types table for service variations
CREATE TABLE public.service_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration INTEGER NOT NULL, -- duration in minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;

-- Create policies for service_types
CREATE POLICY "Anyone can view service types" 
ON public.service_types 
FOR SELECT 
USING (true);

CREATE POLICY "Stylists can create service types for their services" 
ON public.service_types 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.services 
    WHERE services.id = service_types.service_id 
    AND services.stylist_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_stylist = true
    )
  )
);

CREATE POLICY "Stylists can update service types for their services" 
ON public.service_types 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.services 
    WHERE services.id = service_types.service_id 
    AND services.stylist_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_stylist = true
    )
  )
);

CREATE POLICY "Stylists can delete service types for their services" 
ON public.service_types 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.services 
    WHERE services.id = service_types.service_id 
    AND services.stylist_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_stylist = true
    )
  )
);

-- Add foreign key constraint
ALTER TABLE public.service_types 
ADD CONSTRAINT fk_service_types_service_id 
FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;

-- Create trigger for updated_at
CREATE TRIGGER update_service_types_updated_at
BEFORE UPDATE ON public.service_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update services table to remove individual pricing since it will be in service_types
-- Keep price and duration for backward compatibility but they'll represent base/default values
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS is_base_service BOOLEAN DEFAULT false;

-- Update existing services to be base services
UPDATE public.services SET is_base_service = true WHERE price IS NOT NULL;