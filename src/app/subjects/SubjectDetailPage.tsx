import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSubject, useChapters, useAllProgress } from '@/lib/supabase/queries'
import { useAuth } from '@/hooks/useAuth'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateBlocks'
import { ChevronLeft, Calendar, Clock, AlertCircle } from 'lucide-react'
import { ChapterCard } from '@/features/subjects/components/ChapterCard'
import { FilterBar } from '@/features/subjects/components/FilterBar'
import { WORKFLOW_STEPS } from '@/features/chapter-workflow/constants'
import type { Progress } from '@/lib/supabase/types'

export default function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const { user } = useAuth()
  
  const { data: subject, isLoading: subjectLoading, error: subjectError, refetch: refetchSubject } = useSubject(subjectId!)
  const { data: chapters, isLoading: chaptersLoading, error: chaptersError, refetch: refetchChapters } = useChapters(subjectId)
  const { data: progress, isLoading: progressLoading, error: progressError, refetch: refetchProgress } = useAllProgress(user?.id)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPhase, setSelectedPhase] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

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

  // Filter out placeholder chapters
  const activeChapters = chapters?.filter(c => !c.is_placeholder) || []

  // Extract unique phases for filter
  const uniquePhases = Array.from(new Set(activeChapters.map(c => c.phase).filter(Boolean)))
    .map(p => ({ label: p!, value: p! }))
    
  const statuses = [
    { label: 'Completed', value: 'completed' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Not Started', value: 'not_started' },
  ]
  const difficulties = [
    { label: 'Easy', value: 'easy' },
    { label: 'Medium', value: 'medium' },
    { label: 'Hard', value: 'hard' },
  ]

  // Enriched chapters for filtering and stats
  const enrichedChapters = activeChapters.map(chapter => {
    const chapterProgress = progress?.filter((p: Progress) => p.chapter_id === chapter.id) || []
    const completedCount = chapterProgress.length
    const isCompleted = completedCount === WORKFLOW_STEPS.length
    const isStarted = completedCount > 0
    
    let statusValue = 'not_started'
    if (isCompleted) statusValue = 'completed'
    else if (isStarted) statusValue = 'in_progress'

    return { ...chapter, statusValue, isCompleted, chapterProgress }
  })

  // Compute Subject Stats
  const estimatedRemainingHours = enrichedChapters
    .filter(c => !c.isCompleted)
    .reduce((acc, c) => acc + (c.estimated_hours ? Number(c.estimated_hours) : 4), 0)

  const overallProgressPercent = enrichedChapters.length > 0
    ? Math.round((enrichedChapters.reduce((acc, c) => acc + c.chapterProgress.length, 0) / (enrichedChapters.length * WORKFLOW_STEPS.length)) * 100)
    : 0

  const weakChaptersCount = enrichedChapters.filter(c => c.difficulty === 'hard' && !c.isCompleted).length

  // Apply Filters
  const filteredChapters = enrichedChapters.filter(c => {
    if (searchQuery && !(c.name || '').toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (selectedPhase !== 'all' && c.phase !== selectedPhase) return false
    if (selectedStatus !== 'all' && c.statusValue !== selectedStatus) return false
    if (selectedDifficulty !== 'all' && c.difficulty !== selectedDifficulty) return false
    return true
  })

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500 pb-16 mx-auto max-w-6xl">
      <div>
        <Link to="/subjects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Subjects
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{subject.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary uppercase tracking-wider">
                {subject.is_batch_paced ? 'Batch Paced' : 'Self Paced'}
              </span>
              {subject.batch_days && subject.batch_days.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary/70" />
                  <span>{subject.batch_days.join(', ')}</span>
                </div>
              )}
              {subject.batch_time && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary/70" />
                  <span>{subject.batch_time}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card border border-border p-3 rounded-xl shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Remaining Work</span>
              <span className="text-lg font-bold text-foreground">{estimatedRemainingHours}h</span>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Overall Progress</span>
              <span className="text-lg font-bold text-primary">{overallProgressPercent}%</span>
            </div>
            {weakChaptersCount > 0 && (
              <>
                <div className="w-px h-8 bg-border"></div>
                <div className="flex flex-col text-orange-500">
                  <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Weak Chapters</span>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-lg font-bold">{weakChaptersCount}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <FilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPhase={selectedPhase}
        onPhaseChange={setSelectedPhase}
        phases={uniquePhases}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statuses={statuses}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        difficulties={difficulties}
      />

      {filteredChapters.length === 0 ? (
        <EmptyState title="No Chapters Found" description="Try adjusting your filters or search query." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredChapters.map((chapter) => (
            <ChapterCard 
              key={chapter.id}
              chapter={chapter}
              progress={progress || []}
            />
          ))}
        </div>
      )}
    </div>
  )
}
