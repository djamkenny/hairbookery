-- Update the existing admin user to have proper details and ensure password is set correctly
UPDATE public.admin_users 
SET 
  password_hash = crypt('admin123', gen_salt('bf')),
  full_name = 'Test Administrator',
  updated_at = now()
WHERE email = 'admin@test.com';

-- If the admin user doesn't exist, create it
INSERT INTO public.admin_users (email, password_hash, full_name, role, is_active)
SELECT 'admin@test.com', crypt('admin123', gen_salt('bf')), 'Test Administrator', 'admin', true
WHERE NOT EXISTS (SELECT 1 FROM public.admin_users WHERE email = 'admin@test.com');