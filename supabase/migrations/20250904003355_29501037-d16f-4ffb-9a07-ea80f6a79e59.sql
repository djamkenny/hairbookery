-- Add addons column to cleaning_services table to store specialist-defined add-on services
ALTER TABLE cleaning_services 
ADD COLUMN addons JSONB DEFAULT '[]'::jsonb;