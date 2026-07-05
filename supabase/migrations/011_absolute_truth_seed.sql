-- ============================================================
-- OS11 Absolute Truth Seed
-- Populates Resources, Roadmap Weeks, Milestones exactly as per manual
-- ============================================================

truncate table public.resources cascade;
truncate table public.roadmap_weeks cascade;
truncate table public.milestones cascade;

-- Resources
insert into public.resources (id, name, order_index) values ('2d613a8c-6b61-4e46-b6ef-d564fe3f56ec', 'Science & Fun', 1);
insert into public.resources (id, name, order_index) values ('2f5fec98-6639-4dc6-8589-13983babf054', 'NCERT', 2);
insert into public.resources (id, name, order_index) values ('f302bd5c-215d-4f7a-b335-757f55d785eb', 'WINR', 3);
insert into public.resources (id, name, order_index) values ('ad839d4f-dc26-4454-a286-0ecd615fa576', 'Board PYQs', 4);
insert into public.resources (id, name, order_index) values ('663ddeba-a9b3-42d4-bdab-7a43961bdcba', 'JEE Theory', 5);
insert into public.resources (id, name, order_index) values ('0506fbac-1d69-4301-9bdb-0f96a206ed54', 'JEE PYQs', 6);
insert into public.resources (id, name, order_index) values ('42d15e7e-fc70-41b4-8b65-c8a976bfab69', 'H.C. Verma', 7);
insert into public.resources (id, name, order_index) values ('e7de9315-10c1-4ec9-9743-c19cbe3d6c48', 'Selected PDFs', 8);
insert into public.resources (id, name, order_index) values ('9bd218bf-a1ad-44ef-85c6-a0852cd679fb', 'Mixed Tests', 9);
insert into public.resources (id, name, order_index) values ('ae4c5a78-ccb6-4f51-9236-33b48ccc7473', 'Sample Papers', 10);
insert into public.resources (id, name, order_index) values ('756d8572-dee6-441f-bb16-418416145a9b', 'Revision', 11);

-- Milestones
insert into public.milestones (id, name, condition) values ('bcd57fc0-edb9-4fff-bbd8-32f8e446c979', 'End of July 2026', 'First full month of the system complete');
insert into public.milestones (id, name, condition) values ('53e0eff0-9a46-4f4f-8638-37396110c96b', 'End of August 2026', 'First full month survived with school tests in the mix');
insert into public.milestones (id, name, condition) values ('2fe44a2e-2186-42e9-b5e6-31e61eaca4ac', 'NDA 2 exam sat (13 Sep 2026)', 'Regardless of how it felt — it''s done, and zero backlog');
insert into public.milestones (id, name, condition) values ('d4ff09b9-9d36-4354-b3e5-d4e3a811fceb', '50% combined syllabus (~Oct 2026)', 'Halfway point');
insert into public.milestones (id, name, condition) values ('4cdd0834-84fa-46d5-b90f-348c21070c75', '75% combined syllabus (~Nov 2026)', 'Preboard-1 window');
insert into public.milestones (id, name, condition) values ('df26e139-eadf-4ece-8947-28cde7445f10', '100% combined syllabus (Dec 2026)', 'The single biggest milestone in this guide');
insert into public.milestones (id, name, condition) values ('3ae042b2-2e5e-4406-b545-dc9e54011c99', 'Preboard-2 complete', 'Full comparison against Preboard-1');
insert into public.milestones (id, name, condition) values ('23217e3e-40b9-4641-aadd-709225d601ba', 'JEE Main Session 1 sat', 'A genuine, prepared attempt');
insert into public.milestones (id, name, condition) values ('72c42b69-dd24-4b8c-adda-72fe524fe2cf', 'Last Board paper submitted', 'The end of the highest-stakes stretch');


DO $$
DECLARE
  v_july_id uuid;
  v_aug_id uuid;
  v_sep_id uuid;
  v_oct_id uuid;
  v_nov_id uuid;
  v_dec_id uuid;
BEGIN
  SELECT id INTO v_july_id FROM public.roadmap_months WHERE name = 'July 2026' LIMIT 1;
  SELECT id INTO v_aug_id FROM public.roadmap_months WHERE name = 'August 2026' LIMIT 1;
  SELECT id INTO v_sep_id FROM public.roadmap_months WHERE name = 'September 2026' LIMIT 1;
  SELECT id INTO v_oct_id FROM public.roadmap_months WHERE name = 'October 2026' LIMIT 1;
  SELECT id INTO v_nov_id FROM public.roadmap_months WHERE name = 'November 2026' LIMIT 1;
  SELECT id INTO v_dec_id FROM public.roadmap_months WHERE name = 'December 2026' LIMIT 1;

  IF v_july_id IS NOT NULL THEN
    insert into public.roadmap_weeks (month_id, week_number, focus, books_practice, checkpoint) values 
    (v_july_id, 1, 'System setup, not syllabus speed', 'Lecture + NCERT reading only', 'All 4 trackers live by Sunday'),
    (v_july_id, 2, 'Add board-practice layer', '+ WINR, + light Board PYQs', 'WINR running for every finished chapter'),
    (v_july_id, 3, 'Add the JEE layer on top of board depth', '+ JEE theory add-on, + light JEE PYQs', 'First NDA diagnostic mock'),
    (v_july_id, 4, 'Full pipeline live end to end', 'All resources active in sequence', 'Backlog = 0 on 31 July');
  END IF;

  IF v_aug_id IS NOT NULL THEN
    insert into public.roadmap_weeks (month_id, week_number, focus, books_practice, checkpoint) values 
    (v_aug_id, 1, 'Hold pace through first school test', 'NCERT + WINR volume increases', 'Test-week mode declared in advance'),
    (v_aug_id, 2, 'Bring H.C. Verma into the workflow', 'First high-weightage Physics chapter', 'H.C. Verma opened for 1 chapter only'),
    (v_aug_id, 3, 'Trial the Class 11 refresh ritual', 'Prerequisite refresh before new topic', 'Refresh ritual completed once'),
    (v_aug_id, 4, 'Full-month cumulative test', 'NDA GAT reading habit begins', '31 Aug: Backlog = 0');
  END IF;
  
  IF v_sep_id IS NOT NULL THEN
    insert into public.roadmap_weeks (month_id, week_number, focus, books_practice, checkpoint) values 
    (v_sep_id, 1, 'Normal rhythm + NDA final-topic revision', 'NCERT/WINR continue; NDA layered', 'No board/JEE slippage'),
    (v_sep_id, 2, 'NDA intensive; exam sat Sunday', 'NDA revision within pre-declared cap', 'NDA 2 exam sat on 13 Sept'),
    (v_sep_id, 3, 'Planned recovery, then full resumption', '14-15 Sept: revision only, no new content', 'Full rhythm back in 48 hrs'),
    (v_sep_id, 4, 'Full pace restored and stress-tested', 'NCERT/WINR/JEE PYQs back to full volume', '30 Sept: NDA complete, backlog=0');
  END IF;

  IF v_oct_id IS NOT NULL THEN
    insert into public.roadmap_weeks (month_id, week_number, focus, books_practice, checkpoint) values 
    (v_oct_id, 1, 'Full pace + Class 11 rotation topic 1', 'NCERT/WINR/JEE PYQs at full volume', 'JEE-weight tagging applied'),
    (v_oct_id, 2, 'Festival-adjusted week', 'Reduced hours, pre-declared in advance', 'Festival-mode plan followed'),
    (v_oct_id, 3, 'JEE PYQ tracker review', 'Chapter-wise gaps identified explicitly', 'Tracker current and gaps named'),
    (v_oct_id, 4, 'Monthly revision + first mixed mock', 'All resources at full volume', '~50% syllabus, mock attempted');
  END IF;

  IF v_nov_id IS NOT NULL THEN
    insert into public.roadmap_weeks (month_id, week_number, focus, books_practice, checkpoint) values 
    (v_nov_id, 1, 'New content + preboard review begins', 'NCERT/WINR continue; preboard review', 'Preboard review plan in place'),
    (v_nov_id, 2, 'Preboard exam-week mode', 'Revision-heavy: formula sheets, PYQs, sample papers', '70/30 split'),
    (v_nov_id, 3, 'Preboard-1 sat; result analysis', 'Every mistake logged into error notebook', 'Named weak-chapter list created'),
    (v_nov_id, 4, 'New content resumes + first full JEE mock', 'Remaining chapters + first full-length JEE Main mock', '~70-75% syllabus');
  END IF;

  IF v_dec_id IS NOT NULL THEN
    insert into public.roadmap_weeks (month_id, week_number, focus, books_practice, checkpoint) values 
    (v_dec_id, 1, 'Finish remaining new chapters', 'Last new chapter targeted by 20 Dec', 'On track for 20 Dec completion'),
    (v_dec_id, 2, 'Preboard-2 exam mode', 'Revision-heavy: formula sheets, PYQs, sample papers', 'Preboard-2 readiness'),
    (v_dec_id, 3, 'Preboard-2 sat; deep error analysis', 'Formula sheets finalized; full notebook read-through', 'Formula sheets + error notebook complete'),
    (v_dec_id, 4, 'Full-syllabus revision begins', 'Weekly full-length JEE Main mocks start', '31 Dec: 100% syllabus, backlog=0');
  END IF;

END $$;
