-- Add property details fields to cleaning_services table
ALTER TABLE cleaning_services 
ADD COLUMN property_type TEXT,
ADD COLUMN square_footage INTEGER,
ADD COLUMN num_rooms INTEGER,
ADD COLUMN num_bathrooms INTEGER;