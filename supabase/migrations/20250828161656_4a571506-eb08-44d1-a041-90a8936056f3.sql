-- Fix search path for new laundry functions
CREATE OR REPLACE FUNCTION public.insert_laundry_status_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Set search path for security
  SET search_path = public;
  
  IF NEW.status != OLD.status THEN
    INSERT INTO public.laundry_status_history (order_id, status, updated_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix search path for laundry specialist orders function
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
SET search_path = public
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