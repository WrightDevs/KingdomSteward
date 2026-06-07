-- ==============================================================================
-- SYNC PROFILES SCRIPT
-- ==============================================================================
-- Run this script if you wiped your database but didn't delete your users 
-- from the Supabase Authentication dashboard. This copies all users from 
-- auth.users back into the public.profiles table!

INSERT INTO public.profiles (id, full_name, email, title, zone, church, phone_number)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', 'Unknown User'),
  email,
  raw_user_meta_data->>'title',
  raw_user_meta_data->>'zone',
  raw_user_meta_data->>'church',
  raw_user_meta_data->>'phone_number'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
