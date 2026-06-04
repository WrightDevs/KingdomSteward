-- Run this in your Supabase SQL Editor to add the new profile fields and fix constraints

-- 1. Add new columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS zone TEXT,
ADD COLUMN IF NOT EXISTS church TEXT;

-- 2. Drop the old strict check constraint on giving categories to allow new ones
ALTER TABLE public.giving_entries 
DROP CONSTRAINT IF EXISTS giving_entries_type_check;

-- 3. Increase the max length of the type column just in case
ALTER TABLE public.giving_entries 
ALTER COLUMN type TYPE VARCHAR(50);

-- 4. Update the trigger function to capture these fields on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, title, zone, church)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'title',
    NEW.raw_user_meta_data->>'zone',
    NEW.raw_user_meta_data->>'church'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Backfill any missing profiles for older users
INSERT INTO public.profiles (id, full_name, title, zone, church)
SELECT 
  id, 
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'title',
  raw_user_meta_data->>'zone',
  raw_user_meta_data->>'church'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
