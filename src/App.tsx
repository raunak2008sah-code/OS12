import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme/ThemeContext'
import { AuthProvider } from '@/lib/supabase/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/shared/Layout'
import LoginPage from '@/app/login/LoginPage'
import AccessRestrictedPage from '@/app/access-restricted/AccessRestrictedPage'
import { lazy, Suspense } from 'react'
import { GlobalSearch } from '@/components/shared/GlobalSearch'

const DashboardPage = lazy(() => import('@/app/dashboard/DashboardPage'))
const YearRoadmapPage = lazy(() => import('@/app/roadmap/YearRoadmapPage'))
const SubjectListPage = lazy(() => import('@/app/subjects/SubjectListPage'))
const SubjectDetailPage = lazy(() => import('@/app/subjects/SubjectDetailPage'))
const ChapterDetailPage = lazy(() => import('@/app/chapters/ChapterDetailPage'))
const ProgressHubPage = lazy(() => import('@/app/progress/ProgressHubPage'))
const ComparePage = lazy(() => import('@/app/compare/ComparePage'))

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="os12-theme">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/access-restricted" element={<AccessRestrictedPage />} />
            
            {/* Protected Routes wrapped in Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <>
                <Route index element={
                  <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading...</div>}>
                    <DashboardPage />
                  </Suspense>
                } />
                <Route path="roadmap" element={
                  <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading...</div>}>
                    <YearRoadmapPage />
                  </Suspense>
                } />
                <Route path="subjects" element={
                  <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading...</div>}>
                    <SubjectListPage />
                  </Suspense>
                } />
                <Route path="subjects/:subjectId" element={
                  <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading...</div>}>
                    <SubjectDetailPage />
                  </Suspense>
                } />
                <Route path="chapters/:chapterId" element={
                  <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading...</div>}>
                    <ChapterDetailPage />
                  </Suspense>
                } />
                <Route path="progress" element={
                  <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading...</div>}>
                    <ProgressHubPage />
                  </Suspense>
                } />
                <Route path="compare" element={
                  <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading...</div>}>
                    <ComparePage />
                  </Suspense>
                } />
              </>
            </Route>
          </Routes>
          <GlobalSearch />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
