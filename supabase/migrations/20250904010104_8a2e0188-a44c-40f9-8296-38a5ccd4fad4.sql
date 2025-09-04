-- Revert cleaning services to simple service types only
ALTER TABLE cleaning_services 
DROP COLUMN IF EXISTS property_details,
DROP COLUMN IF EXISTS total_price,
DROP COLUMN IF EXISTS addons,
DROP COLUMN IF EXISTS hourly_rate;

-- Add property details back to cleaning_orders for client selection
ALTER TABLE cleaning_orders
ADD COLUMN IF NOT EXISTS num_rooms INTEGER,
ADD COLUMN IF NOT EXISTS num_bathrooms INTEGER,
ADD COLUMN IF NOT EXISTS square_footage INTEGER,
ADD COLUMN IF NOT EXISTS property_type TEXT;