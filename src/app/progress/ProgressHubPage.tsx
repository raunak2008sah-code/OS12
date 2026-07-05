import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChapters, useProgress } from '@/lib/supabase/queries'
import { LoadingState, ErrorState } from '@/components/shared/StateBlocks'
import { ReflectionCard } from '@/features/monthly-review/components/ReflectionCard'
import { WORKFLOW_STEPS } from '@/features/chapter-workflow/constants'
import { format, startOfMonth, subMonths, addMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, LayoutDashboard, Target, BookOpen, AlertCircle } from 'lucide-react'

export default function ProgressHubPage() {
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))
  
  const monthString = format(currentMonth, 'yyyy-MM-dd')
  
  const { data: chapters, isLoading: chaptersLoading, error: chaptersError, refetch: refetchChapters } = useChapters()
  const { data: progress, isLoading: progressLoading, error: progressError, refetch: refetchProgress } = useProgress(user?.id)

  const isLoading = chaptersLoading || progressLoading
  const error = chaptersError || progressError

  if (isLoading) return <LoadingState message="Loading monthly insights..." />
  
  if (error) {
    return <ErrorState error={error} onRetry={() => {
      void refetchChapters()
      void refetchProgress()
    }} />
  }

  // Calculate statistics
  const totalChapters = chapters?.filter(c => !c.is_placeholder).length || 0
  const totalSteps = totalChapters * WORKFLOW_STEPS.length
  const completedSteps = progress?.length || 0
  
  const globalCompletion = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  // We consider a chapter "mastered" if all steps are complete
  const completedChaptersCount = chapters?.filter(chapter => {
    const chapterProgress = progress?.filter(p => p.chapter_id === chapter.id) || []
    return chapterProgress.length === WORKFLOW_STEPS.length
  }).length || 0
  
  const backlogChaptersCount = totalChapters - completedChaptersCount

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header & Month Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Monthly Review</h1>
          <p className="text-muted-foreground mt-1">Reflect on your progress and realign your goals.</p>
        </div>
        
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-1 shadow-sm">
          <button 
            onClick={handlePreviousMonth}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="w-32 text-center font-medium text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <button 
            onClick={handleNextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-sm font-medium">Global Completion</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">{globalCompletion}%</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Of all curriculum workflow steps</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">Mastered Chapters</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-500">{completedChaptersCount}</span>
            <span className="text-sm font-medium text-muted-foreground">/ {totalChapters}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Chapters completely finished</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Backlog Summary</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-amber-500">{backlogChaptersCount}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Chapters requiring attention</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 text-primary mb-4">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-medium">Review Status</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">In Progress</p>
              <p className="text-xs text-muted-foreground">Keep writing your reflections</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Reflection Area */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Monthly Reflection</h2>
        <ReflectionCard month={monthString} />
      </div>
    </div>
  )
}

function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
