-- supabase_subgroups.sql
-- Adds the Zone > Group (church) > Sub-group level.
--
-- Visibility: a leader whose profile has a sub_group is a SUB-GROUP leader and
-- sees ONLY their own sub-group's members in detail. A group-level pastor (no
-- sub_group) sees just group-wide TOTALS via my_group_totals() — never the
-- individual members of any sub-group.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sub_group TEXT;

-- Keep the signup trigger in sync (carry sub_group from auth metadata).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, title, zone, church, sub_group, phone_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'title',
    NEW.raw_user_meta_data->>'zone',
    NEW.raw_user_meta_data->>'church',
    NEW.raw_user_meta_data->>'sub_group',
    NEW.raw_user_meta_data->>'phone_number'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name    = EXCLUDED.full_name,
    email        = EXCLUDED.email,
    title        = EXCLUDED.title,
    zone         = EXCLUDED.zone,
    church       = EXCLUDED.church,
    sub_group    = EXCLUDED.sub_group,
    phone_number = EXCLUDED.phone_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Redefine leader visibility: sees a member only if they share zone + church
-- AND the same NON-EMPTY sub_group. Group-level pastors (empty sub_group) match
-- nobody here, so they get no individual member rows.
CREATE OR REPLACE FUNCTION public.is_church_leader_of(target UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles leader
    JOIN public.profiles member ON member.id = target
    WHERE leader.id = auth.uid()
      AND leader.title IN ('Pastor','Cell Leader','Zonal Pastor','Zonal Secretary','Deacon','Deaconess')
      AND leader.zone = member.zone
      AND leader.church = member.church
      AND coalesce(leader.sub_group, '') <> ''
      AND coalesce(member.sub_group, '') = coalesce(leader.sub_group, '')
  );
$$;

-- Group-wide totals for a group-level pastor: aggregate only, never rows.
CREATE OR REPLACE FUNCTION public.my_group_totals()
RETURNS TABLE(members bigint, given numeric, pledged numeric, redeemed numeric)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  WITH me AS (
    SELECT zone, church FROM public.profiles
    WHERE id = auth.uid()
      AND title IN ('Pastor','Cell Leader','Zonal Pastor','Zonal Secretary','Deacon','Deaconess')
  )
  SELECT
    (SELECT count(*) FROM public.profiles p JOIN me ON p.zone = me.zone AND p.church = me.church),
    coalesce((SELECT sum(g.amount) FROM public.giving_entries g JOIN public.profiles p ON p.id = g.user_id JOIN me ON p.zone = me.zone AND p.church = me.church), 0),
    coalesce((SELECT sum(pl.amount) FROM public.pledges pl JOIN public.profiles p ON p.id = pl.user_id JOIN me ON p.zone = me.zone AND p.church = me.church), 0),
    coalesce((SELECT sum(pl.redeemed_amount) FROM public.pledges pl JOIN public.profiles p ON p.id = pl.user_id JOIN me ON p.zone = me.zone AND p.church = me.church), 0)
  FROM me;
$$;

GRANT EXECUTE ON FUNCTION public.my_group_totals() TO authenticated;
