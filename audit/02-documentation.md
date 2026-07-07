# Phase 2 — Documentation Review

## Operating Manual Location
The official Operating Manual is hardcoded directly into the application source code at `src/app/manual/ManualPage.tsx`. There is no standalone Markdown version (e.g. `Operating Manual.md`) in the repository.

## Core Rules & Expected Behaviors

Based on the contents of `ManualPage.tsx`, the application must adhere to the following core principles and expected behaviors:

1. **Success Definition:**
   - 95%+ CBSE Boards
   - 99+ JEE Percentile
   - Strong Foundation

2. **Priority Stack:**
   - Priority 1: Health & Sleep
   - Priority 2: Consistency
   - Priority 3: Deep Work

3. **Operating Principles:**
   - **No Zero Days:** Daily engagement (even 15 mins) is required.
   - **Trust the System:** Execute the plan; don't constantly redesign it.
   - **Radical Honesty:** Complete means understood, not just skimmed.
   - **Review Over Intake:** Revision > New Material.

4. **Backlog Policy (Crucial for Data Modeling):**
   - "Backlogs are a normal part of the journey."
   - "Current > Backlog." (Current week's targets take precedence).
   - Backlogs can be explicitly **abandoned/cut**.

5. **The 10-Stage Workflow:**
   Every chapter must progress through these 10 distinct, ordered statuses:
   1. Lecture Pending
   2. NCERT Complete
   3. WINR Complete
   4. HC Verma / Module Complete
   5. PYQ Complete
   6. Revision 1 Done
   7. Notes Finalized
   8. Mock Test 1 Complete
   9. Mock Test 2 Complete
   10. Done

### Observations vs Reality
- The codebase attempts to implement the 10-Stage Workflow in `src/app/chapters/ChapterDetailPage.tsx`.
- The database schema (specifically in the latest migrations) contains entities for `milestones`, `resources`, `roadmap_weeks`, etc.
- No standalone PRD or TRD documents exist in the repository tree. The `ManualPage.tsx` acts as the single source of truth for the product's intent.
