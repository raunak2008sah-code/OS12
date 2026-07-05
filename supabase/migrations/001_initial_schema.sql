-- ============================================================
-- OS12 Initial Schema Migration
-- Creates: profiles, subjects, chapters, progress, notes, comments, monthly_progress
-- Sets up Row Level Security (RLS) policies
-- ============================================================

-- Profiles table: linked 1:1 with Supabase auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  avatar_url text,
  exam_targets text[],
  theme text default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Subjects table
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  batch_days text[],
  batch_time text,
  is_batch_paced boolean default true
);

-- Chapters table
create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects(id) on delete cascade,
  name text,
  is_placeholder boolean default true,
  phase text,
  month date,
  order_index integer,
  jee_weight text check (jee_weight in ('none', 'standard', 'high')) default 'standard',
  created_at timestamptz default now()
);

-- Progress table (formerly chapter_progress)
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  step_key text not null,
  completed_at timestamptz default now(),
  unique (user_id, chapter_id, step_key)
);

-- Notes table
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references public.chapters(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  visibility text check (visibility in ('private', 'shared')) default 'private',
  content text,
  updated_at timestamptz default now()
);

-- Comments table
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references public.chapters(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text,
  created_at timestamptz default now()
);

-- Monthly Progress table
create table public.monthly_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  month date not null,
  went_well text,
  didnt_go_well text,
  one_change text,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.progress enable row level security;
alter table public.notes enable row level security;
alter table public.comments enable row level security;
alter table public.monthly_progress enable row level security;

-- Profiles: Users can read all profiles, but only update their own
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Subjects: Read-only for authenticated users
create policy "Subjects are viewable by authenticated users"
  on public.subjects for select to authenticated using (true);

-- Chapters: Read-only for authenticated users
create policy "Chapters are viewable by authenticated users"
  on public.chapters for select to authenticated using (true);

-- Progress: Users can read all progress (for compare screen), but only write their own
create policy "Progress is viewable by authenticated users"
  on public.progress for select to authenticated using (true);

create policy "Users can insert their own progress"
  on public.progress for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own progress"
  on public.progress for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can delete their own progress"
  on public.progress for delete to authenticated
  using (user_id = auth.uid());

-- Notes: Users can read their own private notes, and any shared notes
create policy "Users can read own private or shared notes"
  on public.notes for select to authenticated
  using (user_id = auth.uid() or visibility = 'shared');

create policy "Users can insert their own notes"
  on public.notes for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own notes"
  on public.notes for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can delete their own notes"
  on public.notes for delete to authenticated
  using (user_id = auth.uid());

-- Comments: Viewable by all authenticated users, writable by author
create policy "Comments are viewable by authenticated users"
  on public.comments for select to authenticated using (true);

create policy "Users can insert their own comments"
  on public.comments for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own comments"
  on public.comments for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can delete their own comments"
  on public.comments for delete to authenticated
  using (user_id = auth.uid());

-- Monthly Progress: Users can read all (for compare potentially), write own
create policy "Monthly progress is viewable by authenticated users"
  on public.monthly_progress for select to authenticated using (true);

create policy "Users can insert their own monthly progress"
  on public.monthly_progress for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own monthly progress"
  on public.monthly_progress for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can delete their own monthly progress"
  on public.monthly_progress for delete to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- Auth Triggers
-- ============================================================

-- Function: automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Trigger: fire after a new user is created in auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function: auto-update the updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger: auto-update updated_at on profiles
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at();
