-- supabase_leader_members.sql
-- Let title-holding leaders read their church members' profiles, giving, and
-- pledges. Uses a SECURITY DEFINER helper so the policy can compare the leader
-- vs member profiles WITHOUT tripping profiles' own row-level security (which
-- would otherwise hide members from inside the policy, or recurse).

CREATE OR REPLACE FUNCTION public.is_church_leader_of(target UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles leader
    JOIN public.profiles member ON member.id = target
    WHERE leader.id = auth.uid()

    
      AND leader.title IN ('Pastor','Cell Leader','Zonal Pastor','Zonal Secretary','Deacon','Deaconess')
      AND leader.zone = member.zone
      AND leader.church = member.church
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_church_leader_of(UUID) TO authenticated;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Leaders can view church member giving entries" ON public.giving_entries;
  DROP POLICY IF EXISTS "Leaders can view church member pledges"        ON public.pledges;
  DROP POLICY IF EXISTS "Leaders read member profiles"                  ON public.profiles;
  DROP POLICY IF EXISTS "Leaders read member giving"                    ON public.giving_entries;
  DROP POLICY IF EXISTS "Leaders read member pledges"                   ON public.pledges;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "Leaders read member profiles" ON public.profiles
  FOR SELECT USING (public.is_church_leader_of(id));

CREATE POLICY "Leaders read member giving" ON public.giving_entries
  FOR SELECT USING (public.is_church_leader_of(user_id));

CREATE POLICY "Leaders read member pledges" ON public.pledges
  FOR SELECT USING (public.is_church_leader_of(user_id));
