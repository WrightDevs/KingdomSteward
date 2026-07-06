-- supabase_leader_invite.sql
-- Super-admin creates a church and issues its first LEADER invite link (fixes
-- the chicken-and-egg: links-only signup otherwise blocks a new church's first
-- leader). Also closes a leak: churches were world-readable (exposing
-- invite_code / leader_code / wallet / bank). Lookups now go through
-- SECURITY DEFINER functions that return only zone + name.

ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS leader_code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS churches_leader_code_idx ON public.churches (leader_code);

-- ---- Lock down direct reads of churches ----
DO $$ BEGIN
  DROP POLICY IF EXISTS "Churches are readable"      ON public.churches;
  DROP POLICY IF EXISTS "Churches select for members" ON public.churches;
  DROP POLICY IF EXISTS "Admins insert churches"     ON public.churches;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Only the creator, an admin, or a leader of the church can read the row directly.
CREATE POLICY "Churches select for members" ON public.churches FOR SELECT
USING (
  auth.uid() = created_by
  OR EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.church_leaders l WHERE l.church_id = churches.id AND l.user_id = auth.uid())
);

-- Admins may create an already-approved church (leaders still create 'pending').
CREATE POLICY "Admins insert churches" ON public.churches FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

-- ---- Safe public lookups (return zone + name only, not codes/wallet/bank) ----
CREATE OR REPLACE FUNCTION public.church_by_invite(p_code text)
RETURNS TABLE(zone text, name text)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT zone, name FROM public.churches WHERE invite_code = p_code LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.church_by_invite(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.church_by_leader_code(p_code text)
RETURNS TABLE(zone text, name text)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT zone, name FROM public.churches WHERE leader_code = p_code LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.church_by_leader_code(text) TO anon, authenticated;

-- ---- Claim leadership via the admin-issued code (auto-approved) ----
CREATE OR REPLACE FUNCTION public.claim_leader(p_code text, p_role text, p_sub_group text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c_id uuid; c_zone text; c_name text;
BEGIN
  SELECT id, zone, name INTO c_id, c_zone, c_name FROM public.churches WHERE leader_code = p_code;
  IF c_id IS NULL THEN RAISE EXCEPTION 'invalid leader code'; END IF;

  INSERT INTO public.church_leaders (user_id, church_id, zone, role, status)
  VALUES (auth.uid(), c_id, c_zone, p_role, 'approved')
  ON CONFLICT (user_id, church_id) DO UPDATE SET status = 'approved', role = EXCLUDED.role;

  UPDATE public.profiles
  SET title = p_role, zone = c_zone, church = c_name, sub_group = NULLIF(p_sub_group, '')
  WHERE id = auth.uid();

  RETURN c_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.claim_leader(text, text, text) TO authenticated;
