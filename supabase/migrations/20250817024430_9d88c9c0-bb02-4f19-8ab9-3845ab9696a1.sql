-- Create or update admin user admin@test.com
INSERT INTO public.admin_users (email, password_hash, full_name, role, is_active)
VALUES ('admin@test.com', crypt('admin123', gen_salt('bf')), 'Test Administrator', 'admin', true)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = crypt('admin123', gen_salt('bf')),
  full_name = 'Test Administrator',
  is_active = true,
  updated_at = now();