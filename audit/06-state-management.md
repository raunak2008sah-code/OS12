# Phase 6 — State Management & Caching Audit

## Architecture Overview
- **Server State:** Handled entirely by `@tanstack/react-query` configured in `src/main.tsx`.
- **Client/Global State:** React Context is used for Auth (`AuthContext`) and Theme (`ThemeContext`). No Redux, Zustand, or Jotai is present.
- **Local Persisted State:** A custom `useLocalStorage` hook is used for UI toggles (e.g., expanded/collapsed sections).

## React Query Caching Strategy
- **`staleTime`:** Set to 5 minutes (`300000` ms).
- **`gcTime`:** Default (5 minutes).
- **Implication:** Once a user loads a page, data stays fresh for 5 minutes without re-fetching unless an explicit mutation triggers an invalidation or they leave and return.

## Critical Invalidation Flaws
React Query's effectiveness relies entirely on correct query key invalidation after mutations. Several mutations in `src/lib/supabase/queries.ts` have flawed invalidation logic, leading to stale UI state:

### 1. `useToggleChapterProgress`
- **Mutates:** `chapter_progress` table.
- **Invalidates:** `['chapterProgress', userId]`, `['chapterProgress', userId, chapterId]`
- **Bug:** Fails to invalidate `['allChapterProgress', userId]`, which is used heavily by `ProgressHubPage.tsx` and `ComparePage.tsx`. As a result, changing a chapter's status on the detail page will NOT reflect on the Progress page until a hard refresh.

### 2. `useToggleResourceProgress`
- **Mutates:** `resource_progress` table.
- **Invalidates:** `['resourceProgress', userId, chapterId]`
- **Bug:** Fails to invalidate `['allResourceProgress', userId]`, similar to the chapter progress bug.

### 3. `useToggleRevision`
- **Mutates:** `revision` table.
- **Invalidates:** `['revisions', userId, chapterId]`
- **Bug:** Fails to invalidate `['allRevisions', userId]`.

### 4. `useAddMistake`
- **Mutates:** `mistakes` table.
- **Invalidates:** `['mistakes', chapterId, userId]`
- **Bug:** Fails to invalidate `['mistakes', undefined, userId]`, which is the broad query used by `ProgressHubPage` to count total mistakes.

### 5. `useDeleteComment`
- **Mutates:** `comments` table.
- **Invalidates:** `['comments']`
- **Bug:** Over-invalidation. It invalidates all comments for all chapters globally rather than just `['comments', chapterId]`. Note: The actual `useDeleteComment` hook isn't fully implemented in `queries.ts`, but an inline delete is done in `ChapterDetailPage.tsx` which manually invalidates `['comments', chapterId]`.

## Local Storage vs Database Conflict
Settings data (timezone, notifications, etc.) uses raw `localStorage` in `SettingsPage.tsx` despite columns existing in the `profiles` table. This creates a split-brain state where a user's settings will not persist across devices.
