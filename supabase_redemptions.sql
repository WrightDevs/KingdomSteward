-- supabase_redemptions.sql
-- Records each pledge redemption attempt and its payment lifecycle.
-- A pledge is only marked redeemed after the payment is confirmed server-side
-- (Espees APPROVED), so this table is the audit trail for money movement.

CREATE TABLE IF NOT EXISTS public.redemptions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pledge_id       UUID NOT NULL REFERENCES public.pledges(id) ON DELETE CASCADE,
  amount_ngn      DECIMAL(12, 2) NOT NULL CHECK (amount_ngn > 0),
  amount_esp      DECIMAL(14, 4) NOT NULL CHECK (amount_esp > 0),
  method          VARCHAR(20) NOT NULL DEFAULT 'espees',   -- espees | paystack
  status          VARCHAR(24) NOT NULL DEFAULT 'initiated',-- initiated | awaiting_payment | confirmed | failed
  payment_ref     TEXT,                                    -- Espees payment_ref
  provider_status TEXT,                                    -- last raw status/message from the provider
  confirmed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS redemptions_user_idx   ON public.redemptions (user_id);
CREATE INDEX IF NOT EXISTS redemptions_pledge_idx ON public.redemptions (pledge_id);

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Own redemptions select" ON public.redemptions;
  DROP POLICY IF EXISTS "Own redemptions insert" ON public.redemptions;
  DROP POLICY IF EXISTS "Own redemptions update" ON public.redemptions;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Own redemptions select" ON public.redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own redemptions insert" ON public.redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own redemptions update" ON public.redemptions FOR UPDATE USING (auth.uid() = user_id);
