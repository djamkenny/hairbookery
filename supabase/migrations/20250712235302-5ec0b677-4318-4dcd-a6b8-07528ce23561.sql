-- Insert admin user for the current user
INSERT INTO public.admin_users (id, email, password_hash, full_name)
VALUES 
  ('40268754-05b1-4c49-8c50-219bd8075219', 'beamahnenoch5@gmail.com', 'temp_hash', 'BarberingGod')
ON CONFLICT (email) DO NOTHING;