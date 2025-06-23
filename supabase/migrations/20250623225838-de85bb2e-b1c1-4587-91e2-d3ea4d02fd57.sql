
-- Create admin_users table for admin authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to view their own data
CREATE POLICY "Admin users can view their own data" 
  ON public.admin_users 
  FOR SELECT 
  USING (auth.uid()::text = id::text);

-- Create policy for admin users to update their own data
CREATE POLICY "Admin users can update their own data" 
  ON public.admin_users 
  FOR UPDATE 
  USING (auth.uid()::text = id::text);

-- Create function to authenticate admin users
CREATE OR REPLACE FUNCTION public.authenticate_admin(
  p_email TEXT,
  p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record RECORD;
  password_match BOOLEAN;
BEGIN
  -- Find admin user by email
  SELECT * INTO admin_record
  FROM public.admin_users
  WHERE email = p_email AND is_active = true;
  
  -- Check if admin exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  -- Verify password (using crypt extension)
  SELECT (admin_record.password_hash = crypt(p_password, admin_record.password_hash)) INTO password_match;
  
  IF NOT password_match THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  -- Update last login time
  UPDATE public.admin_users 
  SET last_login_at = now(), updated_at = now()
  WHERE id = admin_record.id;
  
  -- Return success with admin data
  RETURN json_build_object(
    'success', true,
    'admin', json_build_object(
      'id', admin_record.id,
      'email', admin_record.email,
      'full_name', admin_record.full_name,
      'role', admin_record.role
    )
  );
END;
$$;

-- Create function to create admin user with hashed password
CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Check if admin already exists
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE email = p_email) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Admin user already exists'
    );
  END IF;
  
  -- Insert new admin user with hashed password
  INSERT INTO public.admin_users (email, password_hash, full_name)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), p_full_name)
  RETURNING id INTO admin_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Admin user created successfully',
    'admin_id', admin_id
  );
END;
$$;

-- Insert a default admin user (email: admin@admin.com, password: admin123)
SELECT public.create_admin_user('admin@admin.com', 'admin123', 'System Administrator');
