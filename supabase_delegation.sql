-- supabase_delegation.sql
-- Delegated invite chain (scales — super-admin is not a bottleneck):
--   super-admin  -> invites ZONAL pastors
--   zonal pastor -> invites GROUP pastors (creates the group/church)
--   group pastor -> invites SUB-GROUP leaders
--   sub-group leader -> shares the member /join link
-- Every leader onboarding goes through one leader_invites row (scoped + auditable).

CREATE TABLE IF NOT EXISTS public.leader_invites (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code       TEXT UNIQUE NOT NULL,
  tier       TEXT NOT NULL,                 -- zonal | group | subgroup
  zone       TEXT,
  church     TEXT,
  sub_group  TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.leader_invites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Invites readable by creator or admin" ON public.leader_invites;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
CREATE POLICY "Invites readable by creator or admin" ON public.leader_invites FOR SELECT
USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

-- Titles
-- zonal = 'Zonal Pastor' / 'Zonal Secretary'; group-level = other leader titles with no sub_group.

-- Mint an invite for the tier directly below the caller. Returns the code.
CREATE OR REPLACE FUNCTION public.mint_leader_invite(p_tier text, p_zone text, p_church text, p_sub_group text)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me RECORD; new_code text; is_admin boolean;
BEGIN
  SELECT title, zone, church, coalesce(sub_group,'') AS sub_group INTO me
  FROM public.profiles WHERE id = auth.uid();
  SELECT EXISTS(SELECT 1 FROM public.admins WHERE user_id = auth.uid()) INTO is_admin;
  new_code := replace(gen_random_uuid()::text, '-', '');
  new_code := substr(new_code, 1, 10);

  IF p_tier = 'zonal' THEN
    IF NOT is_admin THEN RAISE EXCEPTION 'only a super-admin can invite zonal pastors'; END IF;
    IF coalesce(p_zone,'') = '' THEN RAISE EXCEPTION 'zone required'; END IF;
    INSERT INTO public.leader_invites(code, tier, zone, created_by)
    VALUES (new_code, 'zonal', p_zone, auth.uid());

  ELSIF p_tier = 'group' THEN
    IF me.title NOT IN ('Zonal Pastor','Zonal Secretary') THEN RAISE EXCEPTION 'only a zonal pastor can invite group pastors'; END IF;
    IF coalesce(p_church,'') = '' THEN RAISE EXCEPTION 'group/church required'; END IF;
    -- Ensure the group (church) record exists (approved) in the zonal pastor's zone.
    INSERT INTO public.churches(zone, name, status, created_by)
    VALUES (me.zone, p_church, 'approved', auth.uid())
    ON CONFLICT (zone, name) DO NOTHING;
    INSERT INTO public.leader_invites(code, tier, zone, church, created_by)
    VALUES (new_code, 'group', me.zone, p_church, auth.uid());

  ELSIF p_tier = 'subgroup' THEN
    IF me.title NOT IN ('Pastor','Cell Leader','Zonal Pastor','Zonal Secretary','Deacon','Deaconess','Church Admin')
       OR me.sub_group <> '' OR coalesce(me.church,'') = '' THEN
      RAISE EXCEPTION 'only a group pastor can invite sub-group leaders';
    END IF;
    IF coalesce(p_sub_group,'') = '' THEN RAISE EXCEPTION 'sub-group name required'; END IF;
    INSERT INTO public.leader_invites(code, tier, zone, church, sub_group, created_by)
    VALUES (new_code, 'subgroup', me.zone, me.church, p_sub_group, auth.uid());
  ELSE
    RAISE EXCEPTION 'invalid tier';
  END IF;

  RETURN new_code;
END; $$;
GRANT EXECUTE ON FUNCTION public.mint_leader_invite(text, text, text, text) TO authenticated;

-- Public display of an invite's scope (no ids/secrets).
CREATE OR REPLACE FUNCTION public.leader_invite_info(p_code text)
RETURNS TABLE(tier text, zone text, church text, sub_group text)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT tier, zone, church, sub_group FROM public.leader_invites WHERE code = p_code AND used_by IS NULL LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.leader_invite_info(text) TO anon, authenticated;

-- Accept an invite after signing up: sets scope + approved claim, marks used.
CREATE OR REPLACE FUNCTION public.accept_leader_invite(p_code text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv RECORD; new_title text; c_id uuid;
BEGIN
  SELECT * INTO inv FROM public.leader_invites WHERE code = p_code AND used_by IS NULL;
  IF inv.code IS NULL THEN RAISE EXCEPTION 'invalid or used invite'; END IF;

  new_title := CASE inv.tier WHEN 'zonal' THEN 'Zonal Pastor' WHEN 'group' THEN 'Pastor' ELSE 'Cell Leader' END;

  UPDATE public.profiles
  SET title = new_title, zone = inv.zone, church = inv.church, sub_group = NULLIF(inv.sub_group,'')
  WHERE id = auth.uid();

  IF inv.church IS NOT NULL THEN
    SELECT id INTO c_id FROM public.churches WHERE zone = inv.zone AND name = inv.church;
    IF c_id IS NOT NULL THEN
      INSERT INTO public.church_leaders(user_id, church_id, zone, role, status)
      VALUES (auth.uid(), c_id, inv.zone, new_title, 'approved')
      ON CONFLICT (user_id, church_id) DO UPDATE SET status = 'approved', role = EXCLUDED.role;
    END IF;
  END IF;

  UPDATE public.leader_invites SET used_by = auth.uid(), used_at = NOW() WHERE code = p_code;
END; $$;
GRANT EXECUTE ON FUNCTION public.accept_leader_invite(text) TO authenticated;

-- Zone-wide totals for a zonal pastor (all groups in their zone), aggregate only.
CREATE OR REPLACE FUNCTION public.my_zone_totals()
RETURNS TABLE(members bigint, given numeric, pledged numeric, redeemed numeric)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  WITH me AS (SELECT zone FROM public.profiles WHERE id = auth.uid() AND title IN ('Zonal Pastor','Zonal Secretary'))
  SELECT
    (SELECT count(*) FROM public.profiles p JOIN me ON p.zone = me.zone),
    coalesce((SELECT sum(g.amount) FROM public.giving_entries g JOIN public.profiles p ON p.id = g.user_id JOIN me ON p.zone = me.zone), 0),
    coalesce((SELECT sum(pl.amount) FROM public.pledges pl JOIN public.profiles p ON p.id = pl.user_id JOIN me ON p.zone = me.zone), 0),
    coalesce((SELECT sum(pl.redeemed_amount) FROM public.pledges pl JOIN public.profiles p ON p.id = pl.user_id JOIN me ON p.zone = me.zone), 0)
  FROM me;
$$;
GRANT EXECUTE ON FUNCTION public.my_zone_totals() TO authenticated;
