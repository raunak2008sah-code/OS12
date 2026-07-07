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
const ManualPage = lazy(() => import('@/app/manual/ManualPage'))
const SettingsPage = lazy(() => import('@/app/settings/SettingsPage'))

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
                  <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
                    <DashboardPage />
                  </Suspense>
                } />
                <Route path="roadmap" element={
                  <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
                    <YearRoadmapPage />
                  </Suspense>
                } />
                <Route path="subjects" element={
                  <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
                    <SubjectListPage />
                  </Suspense>
                } />
                <Route path="subjects/:subjectId" element={
                  <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
                    <SubjectDetailPage />
                  </Suspense>
                } />
                <Route path="chapters/:chapterId" element={
                  <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
                    <ChapterDetailPage />
                  </Suspense>
                } />
                <Route path="progress" element={
                  <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
                    <ProgressHubPage />
                  </Suspense>
                } />
                <Route path="compare" element={
                  <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
                    <ComparePage />
                  </Suspense>
                } />
                <Route path="manual" element={
                  <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
                    <ManualPage />
                  </Suspense>
                } />
                <Route path="settings" element={
                  <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
                    <SettingsPage />
                  </Suspense>
                } />
                <Route path="*" element={
                  <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                    <h2 className="text-2xl font-bold">404 - Not Found</h2>
                    <p className="text-muted-foreground">The page you are looking for doesn't exist.</p>
                  </div>
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
