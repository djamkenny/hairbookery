-- Remove individual property columns and add property_details JSON column
ALTER TABLE cleaning_services 
DROP COLUMN IF EXISTS property_type,
DROP COLUMN IF EXISTS square_footage,
DROP COLUMN IF EXISTS num_rooms,
DROP COLUMN IF EXISTS num_bathrooms,
ADD COLUMN property_details JSONB DEFAULT '[]'::jsonb;