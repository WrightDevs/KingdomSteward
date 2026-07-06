-- supabase_admins.sql
-- Super-admins + the RLS that lets them approve churches / leadership claims.
-- The admins table is NOT user-writable — membership is granted only by running
-- SQL here (or via the service role), so nobody can promote themselves.

CREATE TABLE IF NOT EXISTS public.admins (
  user_id    UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins read own" ON public.admins;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- A user can check whether *they* are an admin. No insert/update/delete policy,
-- so the table can only be changed via SQL / service role.
CREATE POLICY "Admins read own" ON public.admins
  FOR SELECT USING (auth.uid() = user_id);

-- Seed the initial super-admin. Matches on auth.users (authoritative email,
-- always populated) so it works even if profiles.email is null. The account
-- must already exist; re-run this block after they sign up if it inserts 0 rows.
INSERT INTO public.admins (user_id)
SELECT id FROM auth.users WHERE lower(email) = lower('itzwright1222@gmail.com')
ON CONFLICT (user_id) DO NOTHING;

-- Per-church Paystack settlement subaccount (created on approval).
ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS paystack_subaccount TEXT;

-- ---- Admin RLS on the leadership tables ----
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins update churches"   ON public.churches;
  DROP POLICY IF EXISTS "Admins read leadership"   ON public.church_leaders;
  DROP POLICY IF EXISTS "Admins update leadership" ON public.church_leaders;
  DROP POLICY IF EXISTS "Admins read profiles"     ON public.profiles;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Admins update churches" ON public.churches
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

CREATE POLICY "Admins read leadership" ON public.church_leaders
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

CREATE POLICY "Admins update leadership" ON public.church_leaders
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

-- Admins can read member profiles (to show names in the approval panel).
CREATE POLICY "Admins read profiles" ON public.profiles
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));
