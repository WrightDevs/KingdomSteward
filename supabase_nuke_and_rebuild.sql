-- ==============================================================================
-- ☢️ KINGDOM STEWARD: NUKE AND REBUILD SCRIPT ☢️
-- ==============================================================================
-- WARNING: This script drops all tables and data before recreating them.
-- It guarantees a 100% clean slate, resolving all "ghost trigger" or schema conflicts.

-- ------------------------------------------------------------------------------
-- 1. NUKE PHASE (Drop everything)
-- ------------------------------------------------------------------------------

-- Drop all tables (CASCADE forces the drop even if other objects depend on them)
DROP TABLE IF EXISTS public.giving_entries CASCADE;
DROP TABLE IF EXISTS public.pledges CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop all functions and triggers dynamically from auth.users
DO $$ 
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_schema = 'auth' AND event_object_table = 'users'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users CASCADE', trigger_record.trigger_name);
    END LOOP;
END $$;

-- Drop the function explicitly
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ------------------------------------------------------------------------------
-- 2. REBUILD PHASE (Create cleanly)
-- ------------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE public.profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL,
  avatar_url   TEXT,
  title        TEXT,
  zone         TEXT,
  church       TEXT,
  phone_number TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- GIVING ENTRIES
CREATE TABLE public.giving_entries (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount     DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  type       VARCHAR(50) NOT NULL,
  notes      TEXT,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_giving_user_date ON public.giving_entries(user_id, date DESC);
CREATE INDEX idx_giving_user_type ON public.giving_entries(user_id, type);

ALTER TABLE public.giving_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own giving select"  ON public.giving_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own giving insert"  ON public.giving_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own giving update"  ON public.giving_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own giving delete"  ON public.giving_entries FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Leaders can view church member giving entries" ON public.giving_entries FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles leader
    WHERE leader.id = auth.uid()
    AND leader.title IN ('Pastor', 'Cell Leader', 'Zonal Pastor', 'Zonal Secretary', 'Deacon', 'Deaconess')
    AND EXISTS (
      SELECT 1 FROM public.profiles member
      WHERE member.id = giving_entries.user_id
      AND member.church = leader.church
      AND member.zone = leader.zone
    )
  )
);

-- PLEDGES
CREATE TABLE public.pledges (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount          DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  redeemed_amount DECIMAL(12, 2) DEFAULT 0,
  category        VARCHAR(50) NOT NULL,
  pledge_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT pledges_status_check CHECK (status IN ('pending', 'partially_redeemed', 'redeemed', 'overdue'))
);

CREATE INDEX idx_pledges_user_id  ON public.pledges(user_id);
CREATE INDEX idx_pledges_due_date ON public.pledges(due_date);
CREATE INDEX idx_pledges_status   ON public.pledges(status);

ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own pledges select" ON public.pledges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own pledges insert" ON public.pledges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own pledges update" ON public.pledges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own pledges delete" ON public.pledges FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Leaders can view church member pledges" ON public.pledges FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles leader
    WHERE leader.id = auth.uid()
    AND leader.title IN ('Pastor', 'Cell Leader', 'Zonal Pastor', 'Zonal Secretary', 'Deacon', 'Deaconess')
    AND EXISTS (
      SELECT 1 FROM public.profiles member
      WHERE member.id = pledges.user_id
      AND member.church = leader.church
      AND member.zone = leader.zone
    )
  )
);

-- ------------------------------------------------------------------------------
-- 3. TRIGGER REBUILD PHASE
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, title, zone, church, phone_number)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown User'),
    NEW.email,
    NEW.raw_user_meta_data->>'title',
    NEW.raw_user_meta_data->>'zone',
    NEW.raw_user_meta_data->>'church',
    NEW.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- DONE. Database is now 100% clean and perfectly configured.
-- ==============================================================================
