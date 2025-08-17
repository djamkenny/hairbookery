-- First, let's check if admin_users table exists and create it if needed
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admin users to read their own data
CREATE POLICY "Admin users can read their own data" 
ON public.admin_users 
FOR SELECT 
USING (auth.jwt() ->> 'email' = email);

-- Insert a default admin user (you can change these credentials)
-- Password: 'admin123' (bcrypt hashed)
INSERT INTO public.admin_users (email, password_hash, name, role) 
VALUES (
  'admin@example.com', 
  '$2b$10$rQpJZKTQ8GHLj8tR4K5Jie.8YvKJDFkYGH5Jp8YvKJDFkYGH5Jp8Yv', 
  'Admin User', 
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();