# Phase 3 — Database Schema Audit

## Evolution of the Schema
The database schema has undergone a significant pivot over 13 migrations. Initially, progress was tracked in a generic `progress` table via a `step_key`. In Migration 010 ("Absolute Truth Schema"), the database was forcefully normalized to match the Operating Manual, introducing distinct tables for `chapter_progress`, `resource_progress`, `roadmap_weeks`, `milestones`, `revision`, `backlog`, and `reviews`.

## Current Core Tables (Post-Migration 010)

| Table | Purpose | Keys / Constraints |
|---|---|---|
| `profiles` | User settings & metadata | PK: `id` (references `auth.users`) |
| `subjects` | Core subjects (Physics, Math, etc.) | PK: `id` |
| `chapters` | Topics to study | PK: `id`, FK: `subject_id` |
| `resources` | Study materials (NCERT, PYQs, etc) | PK: `id` |
| `chapter_progress` | Overall 10-stage status per chapter | Unique: `(user_id, chapter_id)` |
| `resource_progress` | Granular resource status per chapter | Unique: `(user_id, chapter_id, resource_id)` |
| `milestones` | Key deadlines / exams | PK: `id` |
| `revision` | Spaced repetition tracker (days 1,3,7,21,45) | Unique: `(user_id, chapter_id, revision_day)` |
| `backlog` | Urgent unfinished tasks | Unique: `(user_id, chapter_id)` |
| `notes` | User-written markdown notes | Unique: `(chapter_id, user_id)` |
| `mistakes` | Logged errors/tags | PK: `id`, FK: `user_id`, `chapter_id` |
| `formula_sheets` | Chapter formulas (Migration 010 created `formula_sheet`, see bug note) | Unique: `(user_id, chapter_id)` |
| `comments` | Shared discussion per chapter | PK: `id`, FK: `user_id`, `chapter_id` |

---

## Row Level Security (RLS) Configuration

- **Read Access:** Mostly open. `subjects`, `chapters`, `resources`, `milestones`, `roadmap_*` are open to `authenticated` users via `USING (true)`.
- **Write Access:** Strictly isolated. Users can only insert/update/delete their own rows in `chapter_progress`, `resource_progress`, `notes`, `mistakes`, etc., using `auth.uid() = user_id`.
- **Privacy Hotfix:** Migration 006 fixed an overly permissive read policy on monthly reviews, ensuring strict isolation for personal reflections.

## Discovered Inconsistencies & Bugs

### 1. The `formula_sheet` vs `formula_sheets` Bug (CRITICAL)
- Migration 010 creates a table named `formula_sheet` (singular).
- `src/lib/supabase/queries.ts` attempts to query `.from('formula_sheets')` (plural).
- `src/app/settings/SettingsPage.tsx` attempts to export and delete from `.from('formula_sheets')`.
- **Impact:** Feature is completely broken in production.

### 2. Disconnected Settings Data
- Migration 012 adds `timezone`, `time_format`, `week_starts_on`, `target_hours_per_day`, `accent_color` to `profiles`.
- The application (`SettingsPage.tsx`) strictly uses `localStorage` for these settings. It never queries or mutates the `profiles` table for them.
- **Impact:** User settings are tied to the browser, not the account.

### 3. Missing Default Seed for Users
- The seed files (`009`, `011`, `013`) populate the core curriculum (subjects, chapters, milestones, roadmap).
- When a user logs in, their progress tables (`chapter_progress`, `resource_progress`, `revision`) are entirely empty until they explicitly interact with a UI element to create a row.
- `queries.ts` often assumes an empty array `[]` means "not started", but joining logic in components sometimes struggles when rows don't exist yet (e.g. `currentStatus = progress?.status || 'Lecture Pending'`). This relies heavily on frontend fallback logic.

### 4. Progress Table Orphan
- Migration 010 drops `public.progress` and `public.monthly_progress`.
- Ensure no frontend queries are still hitting these tables. `queries.ts` has been updated to use `chapter_progress`, but residual types might exist.
