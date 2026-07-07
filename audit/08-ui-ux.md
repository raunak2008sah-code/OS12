# Phase 8 — UI/UX & Theming Audit

## Design System
The application utilizes Tailwind CSS v4 alongside `shadcn/ui` components for its design system.

### Color Palette (`index.css`)
- **Base Theme:** Deep, muted aesthetic.
- **Light Mode:** High contrast, off-white background (`hsl(0 0% 99.5%)`) with dark text.
- **Dark Mode:** Deep blue-grey background (`hsl(224 20% 6%)`) with soft white text.
- **Accents:** Tailwind standard colors (green, blue, red, orange) are used semantically for statuses (completed, in-progress, backlog, warning).

### Typography
- **Primary Font:** Inter / Outfit.
- **Hierarchy:** Clear distinction between headers (often paired with Lucide icons) and secondary descriptive text (`text-muted-foreground`).
- Heavy use of uppercase, tracking-wider styles for badges and small labels.

## UX Discoveries & Issues

### 1. Data Density vs Noise
- In `ChapterResources.tsx`, the UI uses a grid of resource chips.
- Previous iterations (based on user logs) had repetitive "PENDING" labels. The current version attempts to be more compact, but the grid expands/collapses aggressively.
- Expanding a resource chip drops down a 4-column detail view that can feel cramped on smaller screens.

### 2. Loading States
- Pages use a generic `<Suspense>` fallback (`Loading...`) which causes layout shift.
- Within pages (e.g., `ChapterDetailPage.tsx`), loading states use a centered spinning circle.
- Skeleton loaders matching the actual UI structure are missing, reducing perceived performance.

### 3. The "Sunday Ritual" Prompt
- `DashboardPage.tsx` features a large, interactive prompt for a "Sunday Planning Ritual."
- It correctly expands automatically only on Sundays (via `isSundayIST(now)`).
- However, if the user explicitly collapses it on Sunday, the `useEffect` listening to `isSunday` will forcefully re-expand it on the next minute tick because `now` updates every 60 seconds. This is a severe UX annoyance.

### 4. Interactive Elements without Feedback
- Toggling a resource status or chapter progress triggers a Supabase mutation (`onToggle`).
- There is no immediate optimistic UI update or loading spinner on the specific button clicked. The user clicks, nothing happens for 200-500ms, and then the UI snaps to the new state. This feels laggy.
