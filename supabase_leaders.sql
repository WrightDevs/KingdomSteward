-- supabase_leaders.sql

-- Policy: Allow Leaders to view giving entries of members within their exact Zone and Church
CREATE POLICY "Leaders can view church member giving entries"
  ON public.giving_entries FOR SELECT
  USING (
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

-- Policy: Allow Leaders to view pledges of members within their exact Zone and Church
CREATE POLICY "Leaders can view church member pledges"
  ON public.pledges FOR SELECT
  USING (
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
