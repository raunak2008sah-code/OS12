# Phase 7 — Routing & Navigation Audit

## Setup
The application uses `react-router-dom` v6 for client-side routing.
Routing is defined centrally in `src/App.tsx`.

## Route Definitions
- `/login`: Public auth page
- `/access-restricted`: Unauthorized user landing page
- `/*`: Protected routes, wrapped in `<ProtectedRoute>` and `<Layout>`

Protected sub-routes:
- `/`: `DashboardPage`
- `/roadmap`: `YearRoadmapPage`
- `/subjects`: `SubjectListPage`
- `/subjects/:subjectId`: `SubjectDetailPage`
- `/chapters/:chapterId`: `ChapterDetailPage`
- `/progress`: `ProgressHubPage`
- `/compare`: `ComparePage`
- `/manual`: `ManualPage`
- `/settings`: `SettingsPage`

## Lazy Loading Strategy
All protected routes are lazy-loaded using `React.lazy()` and wrapped in individual `<Suspense>` boundaries within the `<Route>` element.
- **Fallback:** `div` with "Loading...". This ensures fast initial bundle loading, though it can cause flicker when navigating between pages.

## Navigation Elements
- **Sidebar (`src/components/shared/Sidebar.tsx`):** Primary navigation on desktop devices.
- **BottomBar (`src/components/shared/BottomBar.tsx`):** Primary navigation on mobile devices (hidden on desktop).
- **TopBar (`src/components/shared/TopBar.tsx`):** Provides contextual actions (Search, Notifications, Settings).

## Discovered Flaws
1. **Missing 404 Route:** There is no catch-all `*` route inside the protected layout. A user navigating to `/unknown` will see the Layout (Sidebar/TopBar) but a completely blank main content area instead of a "Not Found" state.
2. **Hardcoded URLs in Components:** Navigation links are hardcoded strings (e.g., `navigate('/settings')` or `to="/subjects"`). While manageable in a small app, using route constants is safer for refactoring.
3. **Suspense Flickering:** The generic "Loading..." fallback for lazy routes is unstyled and jarring compared to the rest of the application's premium UI. A skeleton loader matching the page layout would improve perceived performance.
