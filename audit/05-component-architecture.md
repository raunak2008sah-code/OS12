# Phase 5 — Component Architecture Audit

## Component Organization
The application adheres to a Feature-Sliced Design (FSD) inspired architecture. The `src` directory is well-organized:
- `src/app`: Page-level route components.
- `src/features`: Domain-specific components (e.g., `chapters/`, `dashboard/`, `roadmap/`).
- `src/components/shared`: Global structural components (`Layout`, `Sidebar`, `TopBar`).
- `src/components/ui`: Shadcn UI primitives (`Card`, `Button`, `Progress`, etc.).

## Page-Level Architecture (Example: ChapterDetailPage)
Pages follow a standard "Container / Presentational" pattern:
1. **Container (Page Component):** Connects to React Query hooks, handles data fetching, computes derived state, and defines mutation handlers.
2. **Presentational (Feature Components):** Pure UI components that receive data via props and emit events via callback functions (e.g., `onToggle`, `onSave`).

### Example Breakdown: `ChapterDetailPage.tsx`
- Fetches data using 11 distinct React Query hooks (`useChapter`, `useSubject`, `useChapterProgress`, `useResources`, `useMistakes`, etc.).
- Composes the layout using presentational components: `ChapterHeader`, `ChapterWorkflow`, `ChapterResources`, `ChapterRevisions`, `ChapterMistakes`, `ChapterNotes`, `ChapterFormula`, `ChapterComments`.
- **Finding:** The page makes 11 simultaneous database queries when it mounts. While Supabase handles this, it can lead to UI pop-in and spinner overload.

## Identified Architecture Flaws

### 1. Prop Drilling of `userId` and `chapterId`
- Page components manually extract `userId` from `useAuth()` and drill it down to mutation handlers.
- Example: `ChapterComments` takes `currentUserId` as a prop just to compare it against the comment author for the delete button.

### 2. Dead Code
- `src/components/shared/CommandPalette.tsx` is completely unused. A simpler `GlobalSearch` overlay might be used instead, or the CommandPalette was abandoned mid-development.

### 3. Incomplete Prop Types
- Several components use `any` for props.
- Example: `DashboardPage.tsx` defines local helper components (`MetricCard`, `ProgressBar`, `InsightRow`) that use `any` instead of proper TypeScript interfaces.

### 4. Overly Complex Components
- `ProgressHubPage.tsx` is a massive component containing deep, complex data aggregation logic (calculating burnout risk, weekly heatmaps, completion percentages) directly inside the `useMemo` block. This logic should be abstracted into a custom hook (e.g., `useProgressStats`) to decouple business logic from rendering.
