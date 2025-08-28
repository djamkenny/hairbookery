-- Create laundry orders table
CREATE TABLE public.laundry_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  specialist_id UUID,
  order_number TEXT UNIQUE NOT NULL DEFAULT 'LDR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 99999 + 1)::TEXT, 5, '0'),
  service_type TEXT NOT NULL DEFAULT 'standard', -- standard, express, dry_clean
  pickup_address TEXT NOT NULL,
  pickup_instructions TEXT,
  delivery_address TEXT,
  delivery_instructions TEXT,
  pickup_date DATE NOT NULL,
  pickup_time TEXT NOT NULL,
  delivery_date DATE,
  delivery_time TEXT,
  status TEXT NOT NULL DEFAULT 'pending_pickup',
  amount INTEGER, -- in pesewas/cents
  payment_id UUID,
  items_description TEXT,
  special_instructions TEXT,
  weight_kg DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pickup_completed_at TIMESTAMP WITH TIME ZONE,
  washing_started_at TIMESTAMP WITH TIME ZONE,
  ready_at TIMESTAMP WITH TIME ZONE,
  out_for_delivery_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.laundry_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for laundry orders
CREATE POLICY "Users can create their own laundry orders" 
ON public.laundry_orders 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can view their own laundry orders" 
ON public.laundry_orders 
FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() = specialist_id);

CREATE POLICY "Users can update their own laundry orders" 
ON public.laundry_orders 
FOR UPDATE 
USING (auth.uid() = client_id OR auth.uid() = specialist_id);

CREATE POLICY "Specialists can view assigned laundry orders" 
ON public.laundry_orders 
FOR SELECT 
USING (auth.uid() = specialist_id);

-- Create laundry service types table
CREATE TABLE public.laundry_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_per_kg INTEGER NOT NULL, -- price per kg in pesewas/cents
  base_price INTEGER NOT NULL DEFAULT 0, -- minimum charge
  turnaround_days INTEGER NOT NULL DEFAULT 2,
  is_express BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for laundry services
ALTER TABLE public.laundry_services ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing laundry services
CREATE POLICY "Anyone can view laundry services" 
ON public.laundry_services 
FOR SELECT 
USING (true);

-- Insert default laundry services
INSERT INTO public.laundry_services (name, description, price_per_kg, base_price, turnaround_days, is_express) VALUES
('Standard Wash & Fold', 'Regular washing, drying, and folding service', 800, 1500, 3, false),
('Express Service', 'Same day or next day service', 1200, 2500, 1, true),
('Dry Cleaning', 'Professional dry cleaning for delicate items', 1500, 3000, 2, false),
('Ironing Service', 'Professional pressing and ironing', 600, 1000, 2, false);

-- Create laundry order status history table
CREATE TABLE public.laundry_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.laundry_orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for status history
ALTER TABLE public.laundry_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies for status history
CREATE POLICY "Users can view status history for their orders" 
ON public.laundry_status_history 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.laundry_orders 
  WHERE id = order_id AND (client_id = auth.uid() OR specialist_id = auth.uid())
));

CREATE POLICY "Specialists can insert status updates" 
ON public.laundry_status_history 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.laundry_orders 
  WHERE id = order_id AND specialist_id = auth.uid()
));

-- Add laundry specialist flag to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_laundry_specialist BOOLEAN DEFAULT false,
ADD COLUMN service_areas TEXT[]; -- areas they serve for pickup/delivery

-- Create trigger to update updated_at column
CREATE TRIGGER update_laundry_orders_updated_at
  BEFORE UPDATE ON public.laundry_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to insert status history when status changes
CREATE OR REPLACE FUNCTION public.insert_laundry_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO public.laundry_status_history (order_id, status, updated_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER laundry_status_change_trigger
  AFTER UPDATE ON public.laundry_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.insert_laundry_status_history();

-- Create function to get laundry specialist orders
CREATE OR REPLACE FUNCTION public.get_laundry_specialist_orders(specialist_uuid uuid)
RETURNS TABLE(
  id uuid,
  client_id uuid,
  order_number text,
  service_type text,
  pickup_address text,
  delivery_address text,
  pickup_date date,
  pickup_time text,
  delivery_date date,
  delivery_time text,
  status text,
  amount integer,
  items_description text,
  weight_kg numeric,
  created_at timestamp with time zone,
  client_name text,
  client_phone text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lo.id,
    lo.client_id,
    lo.order_number,
    lo.service_type,
    lo.pickup_address,
    lo.delivery_address,
    lo.pickup_date,
    lo.pickup_time,
    lo.delivery_date,
    lo.delivery_time,
    lo.status,
    lo.amount,
    lo.items_description,
    lo.weight_kg,
    lo.created_at,
    p.full_name as client_name,
    p.phone as client_phone
  FROM public.laundry_orders lo
  LEFT JOIN public.profiles p ON p.id = lo.client_id
  WHERE lo.specialist_id = specialist_uuid
  ORDER BY lo.created_at DESC;
END;
$$;