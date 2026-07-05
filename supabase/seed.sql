-- ============================================================
-- OS12 Seed Data
-- ============================================================

-- Insert exactly TWO allow-listed users into auth.users (for local development)
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'raunak@os12.app', crypt('password123', gen_salt('bf')), now(), now(), now(), '', '', '', ''),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aartuu@os12.app', crypt('password123', gen_salt('bf')), now(), now(), now(), '', '', '', '')
on conflict (id) do nothing;

update public.profiles set display_name = 'Raunak' where email = 'raunak@os12.app';
update public.profiles set display_name = 'Aartuu' where email = 'aartuu@os12.app';

-- ============================================================
-- Reference Data: Subjects
-- ============================================================
insert into public.subjects (id, slug, name, batch_days, batch_time, is_batch_paced)
values
  ('33333333-3333-3333-3333-333333333331', 'math', 'Mathematics', '{"Mon", "Wed", "Fri"}', '10:00 AM', true),
  ('33333333-3333-3333-3333-333333333332', 'physics', 'Physics', '{"Tue", "Thu", "Sat"}', '10:00 AM', true),
  ('33333333-3333-3333-3333-333333333333', 'chemistry', 'Chemistry', '{"Mon", "Wed", "Fri"}', '2:00 PM', true)
on conflict (id) do nothing;

-- ============================================================
-- Reference Data: Chapters
-- ============================================================
insert into public.chapters (id, subject_id, name, is_placeholder, phase, month, order_index, jee_weight)
values
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331', 'Functions & Relations', false, 'Phase 1', '2026-06-01', 1, 'high'),
  ('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333332', 'Kinematics', false, 'Phase 1', '2026-06-01', 1, 'standard'),
  ('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333333', 'Atomic Structure', false, 'Phase 1', '2026-06-01', 1, 'standard')
on conflict (id) do nothing;

-- ============================================================
-- Reference Data: Roadmap Phases & Months
-- ============================================================
insert into public.roadmap_phases (id, name, description, start_date, end_date, order_index)
values
  ('55555555-5555-5555-5555-555555555551', 'Foundation', 'Building core concepts', '2026-06-01', '2026-08-31', 1),
  ('55555555-5555-5555-5555-555555555552', 'Advanced', 'Deep diving into complex topics', '2026-09-01', '2026-11-30', 2)
on conflict (id) do nothing;

insert into public.roadmap_months (id, phase_id, name, month_date, focus_area, order_index)
values
  ('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', 'June', '2026-06-01', 'Basics of Mechanics & Calculus', 1),
  ('66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555551', 'July', '2026-07-01', 'Electromagnetism Introduction', 2)
on conflict (id) do nothing;
