-- ============================================================
-- OS12 Chapter Workflow Updates
-- ============================================================

-- Add unique constraint to notes so we can upsert
alter table public.notes add constraint notes_chapter_id_user_id_key unique (chapter_id, user_id);
