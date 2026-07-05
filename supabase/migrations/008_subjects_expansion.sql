-- ============================================================
-- OS12 Subjects Expansion Migration
-- Alters: chapters (adds difficulty, priority, estimated_hours)
-- Creates: mistakes
-- ============================================================

-- Alter chapters table
alter table public.chapters add column if not exists difficulty text check (difficulty in ('easy', 'medium', 'hard')) default 'medium';
alter table public.chapters add column if not exists priority text check (priority in ('low', 'medium', 'high')) default 'medium';
alter table public.chapters add column if not exists estimated_hours integer default 4;

-- Mistakes table
create table public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  chapter_id uuid references public.chapters(id) on delete cascade not null,
  content text not null,
  tags text[] default array[]::text[],
  is_resolved boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

alter table public.mistakes enable row level security;

-- Users can read their own mistakes
create policy "Users can read own mistakes"
  on public.mistakes for select to authenticated
  using (user_id = auth.uid());

-- Users can insert their own mistakes
create policy "Users can insert own mistakes"
  on public.mistakes for insert to authenticated
  with check (user_id = auth.uid());

-- Users can update their own mistakes
create policy "Users can update own mistakes"
  on public.mistakes for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Users can delete their own mistakes
create policy "Users can delete own mistakes"
  on public.mistakes for delete to authenticated
  using (user_id = auth.uid());

-- Auto-update updated_at on mistakes
create trigger mistakes_updated_at
  before update on public.mistakes
  for each row
  execute function public.update_updated_at();

-- Ensure performance indexes
create index if not exists idx_mistakes_chapter on public.mistakes (chapter_id);
create index if not exists idx_mistakes_user on public.mistakes (user_id);
