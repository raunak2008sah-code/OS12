-- ============================================================
-- OS12 Performance Optimization Indexes
-- ============================================================

-- Accelerate Progress lookups by user and chapter
create index if not exists idx_progress_user_chapter on public.progress (user_id, chapter_id);

-- Accelerate Notes lookups (used heavily on chapter detail page)
create index if not exists idx_notes_user_chapter on public.notes (user_id, chapter_id);

-- Accelerate Comments lookups (used on chapter detail page)
create index if not exists idx_comments_chapter on public.comments (chapter_id);

-- Accelerate Monthly Progress lookups
create index if not exists idx_monthly_progress_user_month on public.monthly_progress (user_id, month);

-- Accelerate Roadmap ordering
create index if not exists idx_roadmap_phases_order on public.roadmap_phases (order_index);
create index if not exists idx_roadmap_months_order on public.roadmap_months (order_index);
create index if not exists idx_chapters_order on public.chapters (order_index);
