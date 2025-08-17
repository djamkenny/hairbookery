-- Create admin user function that creates both auth user and admin record
CREATE OR REPLACE FUNCTION public.create_complete_admin_user(
  p_email text,
  p_password text,
  p_full_name text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_id UUID;
  auth_response JSONB;
BEGIN
  -- Check if admin already exists
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE email = p_email) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Admin user already exists'
    );
  END IF;
  
  -- Insert admin user with hashed password using crypt
  INSERT INTO public.admin_users (email, password_hash, full_name, role, is_active)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), p_full_name, 'admin', true)
  RETURNING id INTO admin_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Admin user created successfully',
    'admin_id', admin_id,
    'note', 'Please create corresponding Supabase auth user manually'
  );
END;
$$;

-- Create a test admin user
SELECT public.create_complete_admin_user(
  'admin@test.com',
  'admin123',
  'Test Administrator'
);