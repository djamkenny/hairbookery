
-- Create favorites table to store user's favorite stylists
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stylist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stylist_id)
);

-- Create loyalty points table to track user points
CREATE TABLE public.loyalty_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  earned_from TEXT, -- description of how points were earned
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

-- RLS policies for favorites
CREATE POLICY "Users can view their own favorites" 
  ON public.favorites 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
  ON public.favorites 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON public.favorites 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for loyalty points
CREATE POLICY "Users can view their own loyalty points" 
  ON public.loyalty_points 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create loyalty points" 
  ON public.loyalty_points 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create trigger to update loyalty points updated_at timestamp
CREATE TRIGGER update_loyalty_points_updated_at 
  BEFORE UPDATE ON public.loyalty_points 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get user's total loyalty points
CREATE OR REPLACE FUNCTION get_user_loyalty_points(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_points INTEGER;
BEGIN
  SELECT COALESCE(SUM(points), 0)
  INTO total_points
  FROM public.loyalty_points
  WHERE user_id = user_uuid;
  
  RETURN total_points;
END;
$$;

-- Function to award loyalty points for completed appointments
CREATE OR REPLACE FUNCTION award_loyalty_points_for_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Award 10 points when appointment status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.loyalty_points (user_id, points, earned_from, appointment_id)
    VALUES (NEW.client_id, 10, 'Completed appointment', NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically award points when appointments are completed
CREATE TRIGGER award_loyalty_points_trigger
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION award_loyalty_points_for_appointment();
