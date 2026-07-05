import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Target, PlayCircle } from 'lucide-react'
import type { Chapter, Subject, Progress } from '@/lib/supabase/types'
import { WORKFLOW_STEPS } from '@/features/chapter-workflow/constants'

interface TodaysFocusProps {
  chapters: Chapter[]
  subjects: Subject[]
  progress: Progress[]
}

export function TodaysFocus({ chapters, subjects, progress }: TodaysFocusProps) {
  // Find the first chapter that has SOME progress but is NOT fully complete.
  // If none, find the first chapter with NO progress.
  
  const activeChapter = useMemo(() => {
    // Exclude placeholders
    const validChapters = chapters.filter(c => !c.is_placeholder)
    
    let candidate = null
    let candidateNextStep = null

    for (const chapter of validChapters) {
      const chapterProgress = progress.filter(p => p.chapter_id === chapter.id)
      
      // Is it fully complete? (For MVP, just check if all current steps are done)
      // Note: We'll refine "applicable steps" later per subject rules
      const isComplete = WORKFLOW_STEPS.every(step => 
        chapterProgress.some(p => p.step_key === step.key)
      )

      if (!isComplete) {
        candidate = chapter
        candidateNextStep = WORKFLOW_STEPS.find(step => 
          !chapterProgress.some(p => p.step_key === step.key)
        )
        // Prefer a chapter that is actively in progress
        if (chapterProgress.length > 0) {
          break
        }
      }
    }
    
    return { chapter: candidate, nextStep: candidateNextStep }
  }, [chapters, progress])

  if (!activeChapter.chapter || !activeChapter.nextStep) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-border border-dashed bg-card/50">
        <p className="text-sm text-muted-foreground">All caught up! Nothing to focus on right now.</p>
      </div>
    )
  }

  const subject = subjects.find(s => s.id === activeChapter.chapter?.subject_id)

  return (
    <div className="group relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm transition-all hover:border-primary/40 hover:bg-primary/10">
      <div className="mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-primary">Today's Focus</h2>
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{subject?.name}</p>
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          {activeChapter.chapter.name}
        </h3>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-sm font-medium shadow-sm border border-border">
          <PlayCircle className="h-4 w-4 text-muted-foreground" />
          <span>Next: <span className="text-foreground">{activeChapter.nextStep.label}</span></span>
        </div>

        <Link
          to={`/subjects/${subject?.slug}/${activeChapter.chapter.id}`}
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Jump in <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
