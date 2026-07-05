import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Clock, PlayCircle, Target, CheckCircle2, AlertTriangle } from 'lucide-react'
import type { Chapter, Progress } from '@/lib/supabase/types'
import { WORKFLOW_STEPS } from '@/features/chapter-workflow/constants'

interface ChapterCardProps {
  chapter: Chapter
  progress: Progress[]
}

export function ChapterCard({ chapter, progress }: ChapterCardProps) {
  const stats = useMemo(() => {
    const chapProg = progress.filter(p => p.chapter_id === chapter.id)
    const completedCount = chapProg.length
    const totalCount = WORKFLOW_STEPS.length
    const progressPercent = Math.round((completedCount / totalCount) * 100)
    
    const isCompleted = completedCount === totalCount
    const isStarted = completedCount > 0

    let status = 'Not Started'
    let statusColor = 'bg-muted/50 text-muted-foreground border-transparent'
    if (isCompleted) {
      status = 'Completed'
      statusColor = 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
    } else if (isStarted) {
      status = 'In Progress'
      statusColor = 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
    }

    // Determine Difficulty Color
    let diffColor = 'text-muted-foreground'
    if (chapter.difficulty === 'easy') diffColor = 'text-green-500'
    if (chapter.difficulty === 'hard') diffColor = 'text-red-500'

    // Determine Priority Color
    let priColor = 'text-muted-foreground'
    if (chapter.priority === 'high') priColor = 'text-red-500'
    if (chapter.priority === 'low') priColor = 'text-green-500'

    return { completedCount, totalCount, progressPercent, status, statusColor, diffColor, priColor }
  }, [chapter, progress])

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/40 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${stats.statusColor}`}>
              {stats.status}
            </span>
            {chapter.phase && (
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                <Target className="h-3 w-3" />
                {chapter.phase}
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
            {chapter.name}
          </h3>
        </div>
        
        <Link 
          to={`/subjects/go/${chapter.id}`}
          className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <PlayCircle className="h-5 w-5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/40">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Est. Time</span>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Clock className="h-3.5 w-3.5 text-blue-500" />
            {chapter.estimated_hours}h
          </div>
        </div>
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/40">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Difficulty</span>
          <div className={`flex items-center gap-1 text-sm font-medium capitalize ${stats.diffColor}`}>
            <AlertTriangle className="h-3.5 w-3.5" />
            {chapter.difficulty || 'Medium'}
          </div>
        </div>
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/40">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Priority</span>
          <div className={`flex items-center gap-1 text-sm font-medium capitalize ${stats.priColor}`}>
            <Target className="h-3.5 w-3.5" />
            {chapter.priority || 'Medium'}
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Resources: {stats.completedCount} / {stats.totalCount}
          </span>
          <span className="text-foreground">{stats.progressPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${stats.progressPercent}%` }} 
          />
        </div>
      </div>
    </div>
  )
}
