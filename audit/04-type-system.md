# Phase 4 — Type System Audit

## Overall Assessment
The type system relies on manually defined TypeScript interfaces in `src/lib/supabase/types.ts`, which represents the database schema. Rather than using Supabase's auto-generated types (e.g. `supabase gen types`), the developers have manually constructed a `Database` interface and row types.

## Type Inconsistencies & Flaws

### 1. Manual Type Definitions vs DB Reality
- The DB migrations (specifically 010) created a table named `formula_sheet` (singular).
- However, `types.ts` maps `formula_sheet: { Row: FormulaSheet... }` inside the `Database` interface, but later code uses `.from('formula_sheets')` assuming it was pluralized like other tables.

### 2. Disconnected Profile Settings
- `types.ts` defines `Profile` with fields like `timezone`, `time_format`, `week_starts_on`, `accent_color`, and `target_hours_per_day` (lines 8-12).
- However, these fields are marked as optional (`?:`) even though the user settings page treats them as standard configuration (falling back to `localStorage`). The type system allows these fields to be missing, masking the fact that the application never actually populates them from the database.

### 3. Broad "Any" Usage
- In `queries.ts`, there are instances where `any` is used to bypass the type system.
- Example: `useRoadmapMonthResources` explicitly maps the result using `(row: any) => ({ ...row, name: row.resource_name })`. This was done to bridge a naming gap between the database (`resource_name`) and the frontend expectation (`name`), but it circumvents TypeScript's safety checks.

### 4. Overly Permissive Destructuring
- In `queries.ts`, the `useToggleMistakeResolved` mutation accepts a parameter object containing both `mistakeId` and `isResolved`, but the hook uses an `@ts-ignore` to suppress type errors during the update operation. This indicates a mismatch between the mutation payload type and the Supabase table update type.

## Recommendations for Phase 10 (Execution)
1. Generate strict types directly from the Supabase schema using the Supabase CLI (`supabase gen types typescript --local > types.ts`) rather than maintaining them manually.
2. Remove `@ts-ignore` and `any` usages in `queries.ts` by strictly typing the hook returns and mutation parameters.
3. Fix the `formula_sheet` vs `formula_sheets` naming conflict in both the DB and the TypeScript interface.
