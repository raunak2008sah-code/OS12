-- ============================================================
-- OS12 Roadmap Expansion Migration
-- Creates: roadmap_milestones, roadmap_month_workloads, roadmap_month_resources
-- Alters: chapters (adds week_number)
-- ============================================================

-- Add week_number to chapters
alter table public.chapters add column if not exists week_number integer check (week_number between 1 and 5);

-- Roadmap Milestones table
create table public.roadmap_milestones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  target_date date not null,
  status text check (status in ('upcoming', 'completed', 'missed')) default 'upcoming',
  created_at timestamptz default now()
);

-- Roadmap Month Workloads table
create table public.roadmap_month_workloads (
  id uuid primary key default gen_random_uuid(),
  month_id uuid references public.roadmap_months(id) on delete cascade unique,
  lecture_load integer check (lecture_load between 0 and 10) not null,
  practice_load integer check (practice_load between 0 and 10) not null,
  revision_load integer check (revision_load between 0 and 10) not null,
  testing_load integer check (testing_load between 0 and 10) not null,
  created_at timestamptz default now()
);

-- Roadmap Month Resources table
create table public.roadmap_month_resources (
  id uuid primary key default gen_random_uuid(),
  month_id uuid references public.roadmap_months(id) on delete cascade,
  resource_name text not null,
  status text check (status in ('Inactive', 'Active', 'Heavy Focus', 'Revision', 'Completed')) not null,
  order_index integer not null default 0,
  created_at timestamptz default now(),
  unique (month_id, resource_name)
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

alter table public.roadmap_milestones enable row level security;
alter table public.roadmap_month_workloads enable row level security;
alter table public.roadmap_month_resources enable row level security;

-- Read-only for authenticated users
create policy "Milestones are viewable by authenticated users"
  on public.roadmap_milestones for select to authenticated using (true);

create policy "Month workloads are viewable by authenticated users"
  on public.roadmap_month_workloads for select to authenticated using (true);

create policy "Month resources are viewable by authenticated users"
  on public.roadmap_month_resources for select to authenticated using (true);

-- Seed some default milestones based on the manual
insert into public.roadmap_milestones (name, description, target_date) values
  ('NDA 2 2026', 'National Defence Academy Exam', '2026-09-06'),
  ('Preboards', 'School Preboard Examinations', '2026-12-15'),
  ('Syllabus Complete', 'Deadline for all initial learning', '2026-12-31'),
  ('JEE Main Session 1', 'Joint Entrance Examination', '2027-01-24'),
  ('CBSE Board Exams', 'Class 12 Boards', '2027-02-15')
on conflict do nothing;

-- Ensure performance indexes
create index if not exists idx_roadmap_month_resources_month on public.roadmap_month_resources (month_id);
