-- ============================================================
-- OS12 Reference Data Schema Migration
-- Creates: roadmap_phases, roadmap_months
-- ============================================================

-- Roadmap Phases table
create table public.roadmap_phases (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  order_index integer not null,
  created_at timestamptz default now()
);

-- Roadmap Months table
create table public.roadmap_months (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid references public.roadmap_phases(id) on delete cascade,
  name text not null,
  month_date date not null,
  focus_area text,
  order_index integer not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

alter table public.roadmap_phases enable row level security;
alter table public.roadmap_months enable row level security;

-- Read-only for authenticated users
create policy "Roadmap phases are viewable by authenticated users"
  on public.roadmap_phases for select to authenticated using (true);

create policy "Roadmap months are viewable by authenticated users"
  on public.roadmap_months for select to authenticated using (true);
