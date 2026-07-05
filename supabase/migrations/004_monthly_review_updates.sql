-- ============================================================
-- OS12 Monthly Review Updates
-- ============================================================

-- Add new columns for the updated reflection schema
alter table public.monthly_progress 
  add column if not exists lessons_learned text,
  add column if not exists goals_next_month text,
  add column if not exists updated_at timestamptz default now();

-- Add a unique constraint on (user_id, month) to allow upserts
alter table public.monthly_progress 
  add constraint monthly_progress_user_id_month_key unique (user_id, month);
