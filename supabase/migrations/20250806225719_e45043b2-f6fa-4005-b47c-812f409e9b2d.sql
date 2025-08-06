-- Add category support to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT;

-- Create service categories table for predefined categories
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default service categories
INSERT INTO service_categories (name, description, display_order, icon) VALUES
('Hair Cutting & Styling', 'Professional cuts, trims, and styling services', 1, 'scissors'),
('Hair Coloring', 'Color treatments, highlights, and color corrections', 2, 'palette'),
('Hair Treatments', 'Deep conditioning, keratin, and therapeutic treatments', 3, 'droplet'),
('Braiding & Protective Styles', 'Traditional braids, twists, and protective styling', 4, 'grid'),
('Extensions & Weaves', 'Hair extensions, weave installation, and maintenance', 5, 'plus'),
('Special Occasion', 'Wedding, event styling, and formal updos', 6, 'star'),
('Mens Grooming', 'Haircuts, beard styling, and mens treatments', 7, 'user'),
('Nail Services', 'Manicures, pedicures, and nail art', 8, 'hand')
ON CONFLICT (name) DO NOTHING;

-- Create user service preferences table to save selections
CREATE TABLE IF NOT EXISTS user_service_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id UUID NOT NULL,
  stylist_id UUID,
  preference_order INTEGER DEFAULT 0,
  last_selected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, service_id, stylist_id)
);

-- Enable RLS on new tables
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_service_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_categories (read-only for everyone)
CREATE POLICY "Anyone can view service categories"
ON service_categories FOR SELECT
USING (true);

-- RLS policies for user_service_preferences
CREATE POLICY "Users can view their own service preferences"
ON user_service_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service preferences"
ON user_service_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service preferences"
ON user_service_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service preferences"
ON user_service_preferences FOR DELETE
USING (auth.uid() = user_id);

-- Update existing services with default categories based on their names
UPDATE services SET category = CASE
  WHEN LOWER(name) LIKE '%cut%' OR LOWER(name) LIKE '%trim%' OR LOWER(name) LIKE '%style%' OR LOWER(name) LIKE '%blow%' THEN 'Hair Cutting & Styling'
  WHEN LOWER(name) LIKE '%color%' OR LOWER(name) LIKE '%highlight%' OR LOWER(name) LIKE '%balayage%' THEN 'Hair Coloring'
  WHEN LOWER(name) LIKE '%condition%' OR LOWER(name) LIKE '%treatment%' OR LOWER(name) LIKE '%keratin%' THEN 'Hair Treatments'
  WHEN LOWER(name) LIKE '%braid%' OR LOWER(name) LIKE '%twist%' OR LOWER(name) LIKE '%cornrow%' OR LOWER(name) LIKE '%loc%' THEN 'Braiding & Protective Styles'
  WHEN LOWER(name) LIKE '%extension%' OR LOWER(name) LIKE '%weave%' THEN 'Extensions & Weaves'
  WHEN LOWER(name) LIKE '%manicure%' OR LOWER(name) LIKE '%pedicure%' OR LOWER(name) LIKE '%nail%' THEN 'Nail Services'
  WHEN LOWER(name) LIKE '%men%' OR LOWER(name) LIKE '%beard%' OR LOWER(name) LIKE '%fade%' THEN 'Mens Grooming'
  ELSE 'Hair Cutting & Styling'
END
WHERE category IS NULL;