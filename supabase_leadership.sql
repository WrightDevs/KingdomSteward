-- supabase_leadership.sql
-- Church sub-accounts + leadership claims. Re-runnable (safe to apply again).
--
-- A leader onboards, creating (or joining) a church sub-account that holds the
-- church's Espees wallet AND bank account (for card/Paystack settlement), plus a
-- unique invite code used to onboard that church's members without mistakes.
-- Church + claim stay 'pending' until a SUPER-ADMIN approves them (zero-trust).

CREATE TABLE IF NOT EXISTS public.churches (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone          TEXT NOT NULL,
  name          TEXT NOT NULL,
  espees_wallet TEXT,
  status        VARCHAR(16) NOT NULL DEFAULT 'pending',
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (zone, name)
);

-- New columns (added idempotently in case an earlier version already ran).
ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS invite_code    TEXT;
ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS bank_name      TEXT;
ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS bank_code      TEXT;
ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS account_name   TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS churches_invite_code_idx ON public.churches (invite_code);

CREATE TABLE IF NOT EXISTS public.church_leaders (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  church_id  UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  zone       TEXT NOT NULL,
  role       VARCHAR(40) NOT NULL,
  status     VARCHAR(16) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, church_id)
);

CREATE INDEX IF NOT EXISTS church_leaders_user_idx   ON public.church_leaders (user_id);
CREATE INDEX IF NOT EXISTS church_leaders_church_idx ON public.church_leaders (church_id);

ALTER TABLE public.churches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_leaders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Churches readable by authenticated" ON public.churches;
  DROP POLICY IF EXISTS "Churches are readable"              ON public.churches;
  DROP POLICY IF EXISTS "Churches insert pending"            ON public.churches;
  DROP POLICY IF EXISTS "Own leadership select"              ON public.church_leaders;
  DROP POLICY IF EXISTS "Own leadership insert pending"      ON public.church_leaders;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Public read: a prospective member opening a /join/<code> link is not yet
-- authenticated, so the church behind that code must be readable. Names/zones
-- are not sensitive. (Bank/wallet are not shown on the join screen.)
CREATE POLICY "Churches are readable" ON public.churches
  FOR SELECT USING (true);

-- A user may create a church, but only as its creator and only 'pending'.
CREATE POLICY "Churches insert pending" ON public.churches
  FOR INSERT WITH CHECK (auth.uid() = created_by AND status = 'pending');

-- No user UPDATE policy on churches: approving / editing wallet + bank is a
-- super-admin action (service-role route or Supabase dashboard).

CREATE POLICY "Own leadership select" ON public.church_leaders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Own leadership insert pending" ON public.church_leaders
  FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- No user UPDATE policy on church_leaders: only a super-admin approves a claim.
