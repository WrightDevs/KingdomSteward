-- ==========================================
-- Kingdom Steward Master Setup Script
-- ==========================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PROFILES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name  TEXT,
  email      TEXT,
  title      TEXT,
  zone       TEXT,
  church     TEXT,
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add columns (if the table already existed but was missing them)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS church TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Own profile read" ON public.profiles;
  DROP POLICY IF EXISTS "Own profile update" ON public.profiles;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Own profile read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- GIVING ENTRIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.giving_entries (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount     DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  type       VARCHAR(50) NOT NULL,
  notes      TEXT,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.giving_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Own giving select" ON public.giving_entries;
  DROP POLICY IF EXISTS "Own giving insert" ON public.giving_entries;
  DROP POLICY IF EXISTS "Own giving update" ON public.giving_entries;
  DROP POLICY IF EXISTS "Own giving delete" ON public.giving_entries;
  DROP POLICY IF EXISTS "Leaders can view church member giving entries" ON public.giving_entries;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Own giving select"  ON public.giving_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own giving insert"  ON public.giving_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own giving update"  ON public.giving_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own giving delete"  ON public.giving_entries FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- PLEDGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.pledges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  redeemed_amount DECIMAL(12, 2) DEFAULT 0,
  category VARCHAR(50) NOT NULL,
  pledge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pledges ADD COLUMN IF NOT EXISTS redeemed_amount DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Own pledges select" ON public.pledges;
  DROP POLICY IF EXISTS "Own pledges insert" ON public.pledges;
  DROP POLICY IF EXISTS "Own pledges update" ON public.pledges;
  DROP POLICY IF EXISTS "Own pledges delete" ON public.pledges;
  DROP POLICY IF EXISTS "Leaders can view church member pledges" ON public.pledges;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Own pledges select" ON public.pledges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own pledges insert" ON public.pledges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own pledges update" ON public.pledges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own pledges delete" ON public.pledges FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- AUTHENTICATION TRIGGER FIX
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, title, zone, church, phone_number)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'title',
    NEW.raw_user_meta_data->>'zone',
    NEW.raw_user_meta_data->>'church',
    NEW.raw_user_meta_data->>'phone_number'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    title = EXCLUDED.title,
    zone = EXCLUDED.zone,
    church = EXCLUDED.church,
    phone_number = EXCLUDED.phone_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop all possible variations of old triggers on auth.users just in case
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Re-create the master trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
