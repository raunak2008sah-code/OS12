-- ============================================================
-- OS10 Absolute Truth Schema Migration
-- Completely normalizes the database to match the Operating Manual
-- ============================================================

-- Clean up old overlapping tables
drop table if exists public.progress cascade;
drop table if exists public.monthly_progress cascade;

-- RESOURCES
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  order_index integer not null
);

-- CHAPTER PROGRESS
create table if not exists public.chapter_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  status text not null default 'Lecture Pending',
  completed_at timestamptz,
  unique (user_id, chapter_id)
);

-- RESOURCE PROGRESS
create table if not exists public.resource_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  resource_id uuid references public.resources(id) on delete cascade,
  status text not null default 'pending', -- pending, in_progress, completed
  completed_at timestamptz,
  unique (user_id, chapter_id, resource_id)
);

-- ROADMAP WEEKS
create table if not exists public.roadmap_weeks (
  id uuid primary key default gen_random_uuid(),
  month_id uuid references public.roadmap_months(id) on delete cascade,
  week_number integer not null,
  focus text not null,
  books_practice text not null,
  checkpoint text not null,
  created_at timestamptz default now()
);

-- ROADMAP TASKS
create table if not exists public.roadmap_tasks (
  id uuid primary key default gen_random_uuid(),
  week_id uuid references public.roadmap_weeks(id) on delete cascade,
  task_name text not null,
  is_completed boolean default false,
  created_at timestamptz default now()
);

-- MILESTONES
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  condition text not null,
  target_date date,
  created_at timestamptz default now()
);

-- FORMULA SHEET
create table if not exists public.formula_sheet (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  content text not null,
  last_reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, chapter_id)
);

-- REVISION
create table if not exists public.revision (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  revision_day integer not null, -- 1, 3, 7, 21, 45
  status text not null default 'pending',
  completed_at timestamptz,
  unique (user_id, chapter_id, revision_day)
);

-- BACKLOG
create table if not exists public.backlog (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  escalation_level text not null default 'yellow', -- yellow, orange, red
  cleared_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, chapter_id)
);

-- MONTHLY REVIEWS
create table if not exists public.monthly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  month text not null,
  went_well text not null,
  didnt_go_well text not null,
  change_for_next_month text not null,
  created_at timestamptz default now(),
  unique (user_id, month)
);

-- WEEKLY REVIEWS
create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  week_date date not null,
  planned_vs_done text not null,
  has_backlog boolean not null,
  energy_level integer not null check (energy_level between 1 and 5),
  adjustment_needed text,
  created_at timestamptz default now(),
  unique (user_id, week_date)
);

-- COMPARE PROFILES
create table if not exists public.compare_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  friend_id uuid references auth.users(id) on delete cascade,
  status text default 'pending',
  created_at timestamptz default now(),
  unique(user_id, friend_id)
);

-- RLS
alter table public.resources enable row level security;
create policy "Resources viewable by authenticated users" on public.resources for select to authenticated using (true);

alter table public.chapter_progress enable row level security;
create policy "Users can manage own chapter_progress" on public.chapter_progress for all to authenticated using (auth.uid() = user_id);

alter table public.resource_progress enable row level security;
create policy "Users can manage own resource_progress" on public.resource_progress for all to authenticated using (auth.uid() = user_id);

alter table public.roadmap_weeks enable row level security;
create policy "Roadmap weeks viewable by authenticated" on public.roadmap_weeks for select to authenticated using (true);

alter table public.roadmap_tasks enable row level security;
create policy "Roadmap tasks viewable by authenticated" on public.roadmap_tasks for select to authenticated using (true);

alter table public.milestones enable row level security;
create policy "Milestones viewable by authenticated" on public.milestones for select to authenticated using (true);

alter table public.formula_sheet enable row level security;
create policy "Users can manage own formula_sheet" on public.formula_sheet for all to authenticated using (auth.uid() = user_id);

alter table public.revision enable row level security;
create policy "Users can manage own revision" on public.revision for all to authenticated using (auth.uid() = user_id);

alter table public.backlog enable row level security;
create policy "Users can manage own backlog" on public.backlog for all to authenticated using (auth.uid() = user_id);

alter table public.monthly_reviews enable row level security;
create policy "Users can manage own monthly_reviews" on public.monthly_reviews for all to authenticated using (auth.uid() = user_id);

alter table public.weekly_reviews enable row level security;
create policy "Users can manage own weekly_reviews" on public.weekly_reviews for all to authenticated using (auth.uid() = user_id);

alter table public.compare_profiles enable row level security;
create policy "Users can manage own compare_profiles" on public.compare_profiles for all to authenticated using (auth.uid() = user_id);
create policy "Users can see profiles comparing with them" on public.compare_profiles for select to authenticated using (auth.uid() = friend_id);
