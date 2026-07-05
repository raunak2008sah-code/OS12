import { useParams, Link } from 'react-router-dom'
import { useChapter, useSubject, useProgress } from '@/lib/supabase/queries'
import { useAuth } from '@/hooks/useAuth'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateBlocks'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { WorkflowChecklist } from '@/features/chapter-workflow/components/WorkflowChecklist'
import { WORKFLOW_STEPS } from '@/features/chapter-workflow/constants'
import { PersonalNotes } from '@/features/chapter-workflow/components/PersonalNotes'
import { Comments } from '@/features/chapter-workflow/components/Comments'
import { ChevronLeft, Target } from 'lucide-react'

export default function ChapterDetailPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const { user } = useAuth()
  
  const { data: chapter, isLoading: chapterLoading, error: chapterError, refetch: refetchChapter } = useChapter(chapterId!)
  // We need subjectId to fetch the subject breadcrumb, but we have to wait for chapter to load.
  const { data: subject, isLoading: subjectLoading } = useSubject(chapter?.subject_id || '')
  const { data: progress, isLoading: progressLoading, error: progressError, refetch: refetchProgress } = useProgress(user?.id, chapterId)

  const isLoading = chapterLoading || (chapter && subjectLoading) || progressLoading
  const error = chapterError || progressError

  if (isLoading) return <LoadingState message="Loading chapter workflow..." />
  
  if (error) {
    return <ErrorState error={error} onRetry={() => {
      void refetchChapter()
      void refetchProgress()
    }} />
  }

  if (!chapter) {
    return <EmptyState title="Chapter Not Found" description="The requested chapter does not exist or you don't have access." />
  }

  const completedSteps = progress?.length || 0
  const completionPercentage = Math.round((completedSteps / WORKFLOW_STEPS.length) * 100)

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header Section */}
      <div>
        <Link 
          to={subject ? `/subjects/${subject.id}` : '/subjects'} 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to {subject?.name || 'Subject'}
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{chapter.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
                {chapter.phase}
              </span>
              <span className="text-muted-foreground">Month: {new Date(chapter.month || '').toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <span className="text-muted-foreground">Weightage: <strong className="text-foreground capitalize">{chapter.jee_weight}</strong></span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 w-full max-w-xs shrink-0">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Workflow Progress</span>
              <span className="text-primary">{completionPercentage}%</span>
            </div>
            <ProgressBar progress={completionPercentage} className="h-3" />
            <span className="text-xs text-right text-muted-foreground">{completedSteps} of {WORKFLOW_STEPS.length} steps completed</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left Column: Workflow Checklist & Notes */}
        <div className="space-y-8">
          <WorkflowChecklist chapterId={chapter.id} progress={progress || []} />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">Active Recall & Notes</h2>
            </div>
            <PersonalNotes chapterId={chapter.id} />
          </div>
        </div>

        {/* Right Column: Comments & Community */}
        <div className="space-y-8">
          <Comments chapterId={chapter.id} />
        </div>
      </div>
    </div>
  )
}
