import { useParams, Link } from 'react-router-dom'
import { useSubject, useChapters, useProgress } from '@/lib/supabase/queries'
import { useAuth } from '@/hooks/useAuth'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateBlocks'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { StatusBadge, type ChapterStatus } from '@/features/chapter-workflow/components/StatusBadge'
import { ChevronLeft, Calendar, Clock, ArrowRight } from 'lucide-react'

export default function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const { user } = useAuth()
  
  const { data: subject, isLoading: subjectLoading, error: subjectError, refetch: refetchSubject } = useSubject(subjectId!)
  const { data: chapters, isLoading: chaptersLoading, error: chaptersError, refetch: refetchChapters } = useChapters(subjectId)
  const { data: progress, isLoading: progressLoading, error: progressError, refetch: refetchProgress } = useProgress(user?.id)

  const isLoading = subjectLoading || chaptersLoading || progressLoading
  const error = subjectError || chaptersError || progressError

  if (isLoading) return <LoadingState message="Loading subject details..." />
  
  if (error) {
    return <ErrorState error={error} onRetry={() => {
      void refetchSubject()
      void refetchChapters()
      void refetchProgress()
    }} />
  }

  if (!subject) {
    return <EmptyState title="Subject Not Found" description="The requested subject does not exist or you don't have access." />
  }

  // Calculate progress for each chapter
  const WORKFLOW_STEPS = 5 // Total steps in a chapter workflow
  
  const enrichedChapters = chapters?.map(chapter => {
    const chapterProgress = progress?.filter(p => p.chapter_id === chapter.id) || []
    const completedSteps = chapterProgress.length
    const completionPercentage = Math.round((completedSteps / WORKFLOW_STEPS) * 100)
    
    let status: ChapterStatus = 'not_started'
    if (completedSteps > 0 && completedSteps < WORKFLOW_STEPS) status = 'in_progress'
    if (completedSteps === WORKFLOW_STEPS) status = 'mastered'
    
    // Sort progress by completed_at to find last updated
    const lastUpdated = chapterProgress.length > 0 
      ? new Date(Math.max(...chapterProgress.map(p => new Date(p.completed_at).getTime())))
      : null

    return {
      ...chapter,
      completedSteps,
      completionPercentage,
      status,
      lastUpdated
    }
  }) || []

  return (
    <div className="space-y-8">
      <div>
        <Link to="/subjects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Subjects
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{subject.name}</h1>
        
        <div className="mt-4 flex flex-wrap gap-4">
          {subject.batch_days && subject.batch_days.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4 text-primary/70" />
              <span>{subject.batch_days.join(', ')}</span>
            </div>
          )}
          {subject.batch_time && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4 text-primary/70" />
              <span>{subject.batch_time}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {subject.is_batch_paced ? 'Batch Paced' : 'Self Paced'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Chapters</h2>
        
        {enrichedChapters.length === 0 ? (
          <EmptyState title="No Chapters" description="No chapters have been added to this subject yet." />
        ) : (
          <div className="grid gap-4">
            {enrichedChapters.map((chapter) => (
              <div key={chapter.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm transition-all hover:border-primary/30">
                <div className="space-y-3 sm:space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-lg">{chapter.name}</h3>
                    <StatusBadge status={chapter.status} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span>{chapter.jee_weight === 'high' ? 'High Weightage' : chapter.jee_weight === 'standard' ? 'Standard Weightage' : 'Low Weightage'}</span>
                    {chapter.lastUpdated && (
                      <span>Updated {chapter.lastUpdated.toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:w-[300px]">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{chapter.completedSteps}/{WORKFLOW_STEPS} Steps</span>
                      <span>{chapter.completionPercentage}%</span>
                    </div>
                    <ProgressBar progress={chapter.completionPercentage} />
                  </div>
                  
                  <Link 
                    to={`/chapters/${chapter.id}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <ArrowRight className="h-5 w-5" />
                    <span className="sr-only">Go to chapter</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
