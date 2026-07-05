-- ============================================================
-- OS12 Settings Schema Migration
-- Expands the profiles table with real-world localization and user preferences
-- ============================================================

-- Add new columns if they do not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='timezone') THEN
        ALTER TABLE public.profiles ADD COLUMN timezone text DEFAULT 'Asia/Kolkata';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='time_format') THEN
        ALTER TABLE public.profiles ADD COLUMN time_format text DEFAULT '12h';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='week_starts_on') THEN
        ALTER TABLE public.profiles ADD COLUMN week_starts_on integer DEFAULT 1; -- 1 = Monday, 0 = Sunday
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='target_hours_per_day') THEN
        ALTER TABLE public.profiles ADD COLUMN target_hours_per_day integer DEFAULT 8;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='accent_color') THEN
        ALTER TABLE public.profiles ADD COLUMN accent_color text DEFAULT 'blue';
    END IF;
END $$;
