# Phase 1 — Repository Structure Audit

## Top-Level Directory Structure

| Path | Purpose |
|---|---|
| `src/` | Application source code |
| `src/app/` | Page-level route components (one subfolder per route) |
| `src/components/` | Shared UI: `auth/`, `shared/`, `ui/` |
| `src/features/` | Feature-scoped components: `chapters/`, `dashboard/`, `roadmap/`, `subjects/` |
| `src/hooks/` | Custom React hooks |
| `src/lib/` | Non-React utilities: Supabase client/types/queries, theme, time |
| `supabase/` | Database migrations (001–013), seed, config |
| `public/` | Static assets |
| `dist/` | Build output (gitignored) |

---

## Route Map

| Route | Component | Lazy? | Auth? |
|---|---|---|---|
| `/login` | `LoginPage` | No | No |
| `/access-restricted` | `AccessRestrictedPage` | No | No |
| `/` (index) | `DashboardPage` | Yes | Yes |
| `/roadmap` | `YearRoadmapPage` | Yes | Yes |
| `/subjects` | `SubjectListPage` | Yes | Yes |
| `/subjects/:subjectId` | `SubjectDetailPage` | Yes | Yes |
| `/chapters/:chapterId` | `ChapterDetailPage` | Yes | Yes |
| `/progress` | `ProgressHubPage` | Yes | Yes |
| `/compare` | `ComparePage` | Yes | Yes |
| `/manual` | `ManualPage` | Yes | Yes |
| `/settings` | `SettingsPage` | Yes | Yes |

All lazy routes use the same inline `<Suspense fallback>` pattern: a centered "Loading..." div.

**Finding:** No catch-all 404 route exists. Any unmatched URL under `/` will render the Layout shell with an empty `<Outlet>`. This results in a blank page with the sidebar/topbar visible.

---

## React Query Setup

**Location:** `src/main.tsx` — `QueryClient` instantiated once.

| Setting | Value |
|---|---|
| `staleTime` | 5 minutes (300,000ms) |
| `retry` | 1 |
| `gcTime` | Default (~5 min) |
| Devtools | Included (`ReactQueryDevtools`) |

### Query Key Factory (`src/lib/supabase/queries.ts`)

35 query keys defined. All follow `queryKeys.xxx` pattern. Notable:
- `useResources()` and `useFormulaSheet()` use inline key arrays `['resources']` / `['formulaSheet', ...]` instead of the key factory — **inconsistency**.
- `useRevisions()` uses inline `['revisions', userId, chapterId]` — **inconsistency**.

### Exported Hooks (37 total)

**Queries (26):** `useSubjects`, `useSubject`, `useRoadmapPhases`, `useRoadmapMonths`, `useRoadmapMonthWorkload`, `useRoadmapMonthResources`, `useRoadmapWeeks`, `useMilestones`, `useChapters`, `useChapter`, `useChapterProgress`, `useAllChapterProgress`, `useNotes`, `useComments`, `useMonthlyReview`, `useMistakes`, `useFriendProfile`, `useBacklog`, `useAllResourceProgress`, `useLatestWeeklyReview`, `useFormulaSheets`, `useAllNotes`, `useAllRevisions`, `useRevisions`, `useResourceProgress`, `useFormulaSheet`, `useResources`

**Mutations (9):** `useToggleChapterProgress`, `useSaveNote`, `useAddComment`, `useDeleteComment`, `useSaveMonthlyReview`, `useToggleRevision`, `useToggleResourceProgress`, `useSaveFormulaSheet`, `useAddMistake`, `useToggleMistakeResolved`

### Invalidation Findings

| Mutation | Invalidation | Issue |
|---|---|---|
| `useDeleteComment` | Invalidates `['comments']` (broad prefix) | Should be `['comments', chapterId]` — over-invalidates |
| `useToggleChapterProgress` | Invalidates `chapterProgress(userId)` and `chapterProgress(userId, chapterId)` | Does **not** invalidate `allChapterProgress` — stale data on Progress/Compare pages after status change |
| `useAddMistake` | Invalidates `mistakes(chapter_id, user_id)` | Does **not** invalidate broader `mistakes(undefined, userId)` used by ProgressHubPage |
| `useToggleMistakeResolved` | Uses destructured `userId`/`chapterId` from a param that includes them | Uses `@ts-ignore` on line 597 — type issue being suppressed |

---

## Supabase Client Setup

**File:** `src/lib/supabase/client.ts`

- Uses `createClient<Database>()` with anon key.
- Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from env.
- **No service-role key** is used anywhere on the client. ✅
- **No `.env.example`** file exists — drift cannot be checked against a reference. Anyone cloning the repo won't know which env vars are needed.

### Security: Allowed-Users Gate

`src/lib/supabase/allowed-users.ts` hardcodes two emails. `AuthContext` checks `isAllowedEmail()` before setting `isAllowed`. `ProtectedRoute` redirects non-allowed users to `/access-restricted`.

**Finding:** This is a client-side-only access gate. RLS does not enforce the "allowed emails" concept. Any Supabase auth user could call the API directly. However, given the invite-only nature (only two accounts exist), this is Low risk.

---

## Auth Architecture

| Layer | File | Mechanism |
|---|---|---|
| Context definition | `src/lib/supabase/auth-context.ts` | `createContext<AuthContextValue>` |
| Provider | `src/lib/supabase/AuthContext.tsx` | Wraps `onAuthStateChange` + `getSession` |
| Hook | `src/hooks/useAuth.ts` | `useContext(AuthContext)` with null-check |
| Guard | `src/components/auth/ProtectedRoute.tsx` | Redirects to `/login` or `/access-restricted` |

---

## Global State Map

| State | Mechanism | Scope |
|---|---|---|
| Auth session/user | React Context (`AuthContext`) | App-wide |
| Theme | React Context (`ThemeContext`) | App-wide, persisted to `localStorage('os12-theme')` |
| All server data | React Query cache | App-wide, 5min stale |
| Section collapse states | `useLocalStorage` hook | Per-component, `localStorage` |
| Settings (time format, week start, notifications) | Direct `localStorage` in SettingsPage | Local only — **not synced to Supabase `profiles` table despite columns existing** |
| Expanded/selected IDs | `useState` | Per-component instance |

**Finding:** Migration 012 added `timezone`, `time_format`, `week_starts_on`, `target_hours_per_day`, `accent_color` columns to `profiles`. But `SettingsPage` uses `localStorage` instead of reading/writing these columns. The DB columns exist but are unused by the app.

---

## UI Primitives

### shadcn/ui components (`src/components/ui/`)

| Component | File | Notes |
|---|---|---|
| `Button` | `button.tsx` + `button-variants.ts` | Uses CVA for variants |
| `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`, `CardDescription` | `card.tsx` | Standard wrapper |
| `Progress` | `progress.tsx` | Simple bar component |
| `Separator` | `separator.tsx` | Horizontal/vertical rule |

### Shared Components (`src/components/shared/`)

| Component | File | Purpose |
|---|---|---|
| `Layout` | `Layout.tsx` | Shell: Sidebar + TopBar + Outlet + BottomBar |
| `Sidebar` | `Sidebar.tsx` | Desktop nav (hidden on mobile) |
| `TopBar` | `TopBar.tsx` | Header bar with notifications bell |
| `BottomBar` | `BottomBar.tsx` | Mobile bottom nav |
| `GlobalSearch` | `GlobalSearch.tsx` | Ctrl+K search overlay |
| `CommandPalette` | `CommandPalette.tsx` | **Not imported anywhere** — dead code |
| `ProgressBar` | `ProgressBar.tsx` | Reusable progress bar |
| `StateBlocks` | `StateBlocks.tsx` | Loading/Error/Empty state components |

**Finding:** `CommandPalette.tsx` (6KB) exists but is never imported or used. Dead code.

---

## Build & Config

| File | Notes |
|---|---|
| `vite.config.ts` | React plugin + Tailwind CSS v4 plugin. `@` alias to `src/`. |
| `tsconfig.json` | References `tsconfig.app.json` and `tsconfig.node.json` |
| `components.json` | shadcn/ui configuration |
| `.oxlintrc.json` | Oxlint linter config — `react-hooks` rules enabled |
| `vercel.json` | SPA rewrite rule + asset caching headers |

**Env vars consumed:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. No `.env.example` exists.

---

## Needs Human Confirmation

### [P1-NC-1] No `.env.example` file
Source: Project root
Finding: No reference `.env.example` exists for developers or Vercel configuration
Confidence: Verified
Impact: Low

### [P1-NC-2] Settings page uses localStorage instead of Supabase profiles columns
Source: `SettingsPage.tsx` lines 14-27, migration `012_settings_schema.sql`
Finding: DB columns exist but are never read or written by the app. Was this intentional (offline-first settings) or an unfinished migration?
Confidence: Verified
Impact: Medium — settings won't sync across devices/browsers

### [P1-NC-3] `CommandPalette.tsx` appears to be dead code
Source: `src/components/shared/CommandPalette.tsx`
Finding: 6KB file, never imported. Is it intended for future use or should it be removed?
Confidence: Verified
Impact: Low
