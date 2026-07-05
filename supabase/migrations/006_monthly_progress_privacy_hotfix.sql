-- ============================================================
-- OS12 Monthly Progress Privacy Hotfix
-- ============================================================

-- Drop the overly permissive select policy
drop policy if exists "Monthly progress is viewable by authenticated users" on public.monthly_progress;

-- Create strict isolation policy for reading monthly progress
create policy "Users can read own monthly progress"
  on public.monthly_progress for select to authenticated
  using (user_id = auth.uid());
