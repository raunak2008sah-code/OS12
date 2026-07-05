-- ============================================================
-- OS12 Full Roadmap Data Migration
-- Ensures every month has Workloads, Resources, Weeks, and Milestones
-- ============================================================

DO $$
DECLARE
  v_jul uuid; v_aug uuid; v_sep uuid; v_oct uuid; v_nov uuid; v_dec uuid;
  v_jan uuid; v_feb uuid; v_mar uuid; v_apr uuid; v_may uuid; v_jun uuid;
BEGIN
  SELECT id INTO v_jul FROM public.roadmap_months WHERE name = 'July 2026' LIMIT 1;
  SELECT id INTO v_aug FROM public.roadmap_months WHERE name = 'August 2026' LIMIT 1;
  SELECT id INTO v_sep FROM public.roadmap_months WHERE name = 'September 2026' LIMIT 1;
  SELECT id INTO v_oct FROM public.roadmap_months WHERE name = 'October 2026' LIMIT 1;
  SELECT id INTO v_nov FROM public.roadmap_months WHERE name = 'November 2026' LIMIT 1;
  SELECT id INTO v_dec FROM public.roadmap_months WHERE name = 'December 2026' LIMIT 1;
  SELECT id INTO v_jan FROM public.roadmap_months WHERE name = 'January 2027' LIMIT 1;
  SELECT id INTO v_feb FROM public.roadmap_months WHERE name = 'February 2027' LIMIT 1;
  SELECT id INTO v_mar FROM public.roadmap_months WHERE name = 'March 2027' LIMIT 1;
  SELECT id INTO v_apr FROM public.roadmap_months WHERE name = 'April 2027' LIMIT 1;
  SELECT id INTO v_may FROM public.roadmap_months WHERE name = 'May 2027' LIMIT 1;
  SELECT id INTO v_jun FROM public.roadmap_months WHERE name = 'June 2027' LIMIT 1;

  -- 1. WORKLOADS
  delete from public.roadmap_month_workloads;
  insert into public.roadmap_month_workloads (month_id, lecture_load, practice_load, revision_load, testing_load) values
  (v_jul, 8, 8, 4, 0),
  (v_aug, 8, 10, 4, 2),
  (v_sep, 6, 8, 6, 6),
  (v_oct, 8, 10, 6, 4),
  (v_nov, 6, 8, 8, 6),
  (v_dec, 4, 10, 8, 8),
  (v_jan, 0, 10, 10, 10),
  (v_feb, 0, 8, 10, 6),
  (v_mar, 0, 6, 10, 8),
  (v_apr, 0, 10, 8, 10),
  (v_may, 0, 10, 8, 10),
  (v_jun, 0, 8, 8, 10);

  -- 2. RESOURCES
  delete from public.roadmap_month_resources;
  
  -- July
  insert into public.roadmap_month_resources (month_id, resource_name, status, order_index) values
  (v_jul, 'Science & Fun', 'Heavy Focus', 1), (v_jul, 'NCERT', 'Active', 2), (v_jul, 'WINR', 'Active', 3);
  
  -- August
  insert into public.roadmap_month_resources (month_id, resource_name, status, order_index) values
  (v_aug, 'Science & Fun', 'Active', 1), (v_aug, 'NCERT', 'Heavy Focus', 2), (v_aug, 'WINR', 'Heavy Focus', 3), (v_aug, 'H.C. Verma', 'Active', 4);
  
  -- September
  insert into public.roadmap_month_resources (month_id, resource_name, status, order_index) values
  (v_sep, 'Science & Fun', 'Active', 1), (v_sep, 'NCERT', 'Revision', 2), (v_sep, 'WINR', 'Revision', 3), (v_sep, 'Board PYQs', 'Heavy Focus', 4), (v_sep, 'Mixed Tests', 'Active', 5);
  
  -- October
  insert into public.roadmap_month_resources (month_id, resource_name, status, order_index) values
  (v_oct, 'Science & Fun', 'Active', 1), (v_oct, 'JEE Theory', 'Heavy Focus', 2), (v_oct, 'JEE PYQs', 'Heavy Focus', 3), (v_oct, 'H.C. Verma', 'Active', 4);
  
  -- November
  insert into public.roadmap_month_resources (month_id, resource_name, status, order_index) values
  (v_nov, 'Science & Fun', 'Inactive', 1), (v_nov, 'Board PYQs', 'Heavy Focus', 2), (v_nov, 'Sample Papers', 'Heavy Focus', 3), (v_nov, 'Revision', 'Active', 4);
  
  -- December
  insert into public.roadmap_month_resources (month_id, resource_name, status, order_index) values
  (v_dec, 'Sample Papers', 'Heavy Focus', 1), (v_dec, 'JEE PYQs', 'Heavy Focus', 2), (v_dec, 'Mixed Tests', 'Heavy Focus', 3), (v_dec, 'Revision', 'Heavy Focus', 4);

  -- January
  insert into public.roadmap_month_resources (month_id, resource_name, status, order_index) values
  (v_jan, 'JEE PYQs', 'Heavy Focus', 1), (v_jan, 'Mixed Tests', 'Heavy Focus', 2), (v_jan, 'Revision', 'Heavy Focus', 3);

  -- February
  insert into public.roadmap_month_resources (month_id, resource_name, status, order_index) values
  (v_feb, 'NCERT', 'Revision', 1), (v_feb, 'Board PYQs', 'Heavy Focus', 2), (v_feb, 'Sample Papers', 'Heavy Focus', 3);

  -- March
  insert into public.roadmap_month_resources (month_id, resource_name, status, order_index) values
  (v_mar, 'NCERT', 'Revision', 1), (v_mar, 'Board PYQs', 'Heavy Focus', 2), (v_mar, 'Sample Papers', 'Heavy Focus', 3);

  -- April
  insert into public.roadmap_month_resources (month_id, resource_name, status, order_index) values
  (v_apr, 'JEE PYQs', 'Heavy Focus', 1), (v_apr, 'Mixed Tests', 'Heavy Focus', 2), (v_apr, 'Selected PDFs', 'Active', 3);

  -- May
  insert into public.roadmap_month_resources (month_id, resource_name, status, order_index) values
  (v_may, 'JEE PYQs', 'Heavy Focus', 1), (v_may, 'Mixed Tests', 'Heavy Focus', 2), (v_may, 'Selected PDFs', 'Heavy Focus', 3);

  -- June
  insert into public.roadmap_month_resources (month_id, resource_name, status, order_index) values
  (v_jun, 'JEE PYQs', 'Heavy Focus', 1), (v_jun, 'Mixed Tests', 'Heavy Focus', 2), (v_jun, 'Selected PDFs', 'Heavy Focus', 3);


  -- 3. MILESTONES (For Jan - Jun, since Jul-Dec are in 011_absolute_truth_seed)
  -- The app maps milestones to months by target_date. Let's ensure there is at least one milestone per month.
  -- Let's just create new ones and delete old ones to be safe, or just insert the missing ones.
  -- From 011:
  -- Jul: End of July 2026 (target_date needs to be in July 2026)
  -- Aug: End of August 2026
  -- Sep: NDA 2 exam sat (13 Sep 2026)
  -- Oct: 50% combined syllabus (~Oct 2026)
  -- Nov: 75% combined syllabus (~Nov 2026)
  -- Dec: 100% combined syllabus (Dec 2026), Preboard-2 complete
  -- Jan: JEE Main Session 1 sat
  -- Mar: Last Board paper submitted
  -- Wait, I'll update all target_dates so they show up correctly in the month breakdown!
  
  delete from public.milestones;
  insert into public.milestones (id, name, condition, target_date) values 
  (gen_random_uuid(), 'End of July 2026', 'First full month of the system complete', '2026-07-31'),
  (gen_random_uuid(), 'End of August 2026', 'First full month survived with school tests in the mix', '2026-08-31'),
  (gen_random_uuid(), 'NDA 2 Exam', 'Regardless of how it felt — it''s done, and zero backlog', '2026-09-13'),
  (gen_random_uuid(), '50% Syllabus', 'Halfway point', '2026-10-31'),
  (gen_random_uuid(), '75% Syllabus / Preboard-1', 'Preboard-1 window', '2026-11-30'),
  (gen_random_uuid(), '100% Syllabus', 'The single biggest milestone in this guide', '2026-12-15'),
  (gen_random_uuid(), 'Preboard-2 Complete', 'Full comparison against Preboard-1', '2026-12-31'),
  (gen_random_uuid(), 'JEE Main Session 1', 'A genuine, prepared attempt', '2027-01-24'),
  (gen_random_uuid(), 'English Board Exam', 'First major board paper', '2027-02-28'),
  (gen_random_uuid(), 'Last Board Paper', 'The end of the highest-stakes stretch', '2027-03-31'),
  (gen_random_uuid(), 'JEE Main Session 2', 'Final Main attempt', '2027-04-15'),
  (gen_random_uuid(), 'JEE Advanced Prep Milestone', 'Sustained advanced practice', '2027-05-31'),
  (gen_random_uuid(), 'JEE Advanced', 'The final exam', '2027-06-30');


  -- 4. WEEKS FOR JAN-JUN (since 011 has Jul-Dec)
  -- If v_jan etc exist, insert 4 weeks for each to prevent empty state.
  IF v_jan IS NOT NULL THEN
    delete from public.roadmap_weeks where month_id in (v_jan, v_feb, v_mar, v_apr, v_may, v_jun);
    
    insert into public.roadmap_weeks (month_id, week_number, focus, books_practice, checkpoint) values 
    (v_jan, 1, 'JEE Main Revision', 'JEE PYQs and Mock Tests', 'Mock Test 1 scored'),
    (v_jan, 2, 'JEE Main Revision', 'JEE PYQs and Mock Tests', 'Mock Test 2 scored'),
    (v_jan, 3, 'JEE Main Session 1 Week', 'Light Revision, Formula Sheets', 'Session 1 Sat'),
    (v_jan, 4, 'Shift to Board Mode', 'NCERT, Board PYQs', 'Board prep started'),
    
    (v_feb, 1, 'Board Revision', 'NCERT, Sample Papers', 'Physics Sample Paper'),
    (v_feb, 2, 'Board Revision', 'NCERT, Sample Papers', 'Chemistry Sample Paper'),
    (v_feb, 3, 'Board Revision', 'NCERT, Sample Papers', 'Maths Sample Paper'),
    (v_feb, 4, 'Board Exams Start', 'Final English Revision', 'English Exam Sat'),
    
    (v_mar, 1, 'Board Exams', 'Targeted Revision between gaps', 'Physics Exam Sat'),
    (v_mar, 2, 'Board Exams', 'Targeted Revision between gaps', 'Chemistry Exam Sat'),
    (v_mar, 3, 'Board Exams', 'Targeted Revision between gaps', 'Maths Exam Sat'),
    (v_mar, 4, 'Board Exams End', 'CS / Optional Exam', 'All Boards Complete'),
    
    (v_apr, 1, 'JEE Main Session 2 Prep', 'JEE PYQs, Mixed Tests', 'Mock Test 3 scored'),
    (v_apr, 2, 'JEE Main Session 2 Prep', 'JEE PYQs, Mixed Tests', 'Session 2 Sat'),
    (v_apr, 3, 'Shift to Advanced', 'Selected PDFs, Hard PYQs', 'Advanced material started'),
    (v_apr, 4, 'Advanced Practice', 'Selected PDFs, Hard PYQs', 'Advanced routine locked'),
    
    (v_may, 1, 'Advanced Deep Dive', 'Selected PDFs, Advanced Mocks', 'Advanced Mock 1'),
    (v_may, 2, 'Advanced Deep Dive', 'Selected PDFs, Advanced Mocks', 'Advanced Mock 2'),
    (v_may, 3, 'Advanced Deep Dive', 'Selected PDFs, Advanced Mocks', 'Advanced Mock 3'),
    (v_may, 4, 'Advanced Deep Dive', 'Selected PDFs, Advanced Mocks', 'Advanced Mock 4'),
    
    (v_jun, 1, 'Final Polish', 'Formula Sheets, Weak Area targeting', 'Final Mock'),
    (v_jun, 2, 'Final Polish', 'Formula Sheets, Weak Area targeting', 'Confidence Building'),
    (v_jun, 3, 'JEE Advanced Exam', 'Light Revision', 'Advanced Sat'),
    (v_jun, 4, 'Post-Exam Wind Down', 'Rest and Recover', 'Year Complete');
  END IF;

END $$;
