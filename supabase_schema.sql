-- Kingdom Steward Full Database Schema (V3 - with Expanded Ministry Arms)
-- Run this entire script in the Supabase SQL Editor to set up a new project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name  TEXT,
  title      TEXT,
  zone       TEXT,
  church     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Giving Entries Table
-- We removed the strict CHECK constraint on type to allow for future ministry arms to be added 
-- easily from the frontend without needing to alter the database schema every time.
CREATE TABLE IF NOT EXISTS giving_entries (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount     DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  type       VARCHAR(50) NOT NULL,
  notes      TEXT,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Force drop the check constraint and alter the column in case the table already existed from V1
ALTER TABLE public.giving_entries DROP CONSTRAINT IF EXISTS giving_entries_type_check;
ALTER TABLE public.giving_entries ALTER COLUMN type TYPE VARCHAR(50);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_giving_user_date ON giving_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_giving_user_type ON giving_entries(user_id, type);

-- 4. Row Level Security (RLS)
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent errors on re-run
DROP POLICY IF EXISTS "Own profile read" ON profiles;
DROP POLICY IF EXISTS "Own profile update" ON profiles;
DROP POLICY IF EXISTS "Own giving select" ON giving_entries;
DROP POLICY IF EXISTS "Own giving insert" ON giving_entries;
DROP POLICY IF EXISTS "Own giving update" ON giving_entries;
DROP POLICY IF EXISTS "Own giving delete" ON giving_entries;

-- Profiles Policies
CREATE POLICY "Own profile read"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Own profile update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Giving Entries Policies
CREATE POLICY "Own giving select"  ON giving_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own giving insert"  ON giving_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own giving update"  ON giving_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own giving delete"  ON giving_entries FOR DELETE USING (auth.uid() = user_id);

-- 5. Auto-create profile on signup trigger
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

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- FIX FOR "ERROR SAVING ENTRY" (Missing profiles constraint)
-- If you created users BEFORE running the profile trigger, they will not have
-- a row in the `profiles` table, causing the giving insert to fail.
-- Run this insert block to backfill any missing profiles:
-- =========================================================================
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
