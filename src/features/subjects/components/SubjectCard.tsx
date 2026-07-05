import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Book, AlertCircle, ChevronRight, BarChart3, Activity } from 'lucide-react'
import type { Subject, Chapter, Progress } from '@/lib/supabase/types'
import { WORKFLOW_STEPS } from '@/features/chapter-workflow/constants'

interface SubjectCardProps {
  subject: Subject
  chapters: Chapter[]
  progress: Progress[]
}

export function SubjectCard({ subject, chapters, progress }: SubjectCardProps) {
  const stats = useMemo(() => {
    const subjectChapters = chapters.filter(c => c.subject_id === subject.id && !c.is_placeholder)
    const totalSteps = subjectChapters.length * WORKFLOW_STEPS.length
    
    if (totalSteps === 0) return { progress: 0, backlog: 0, currentChapter: null, currentStep: null }

    const chapterIds = new Set(subjectChapters.map(c => c.id))
    const subjectProgress = progress.filter(p => chapterIds.has(p.chapter_id))
    const completedSteps = subjectProgress.length
    const progressPercent = Math.round((completedSteps / totalSteps) * 100)

    // Find first incomplete chapter as "current"
    let currentChapter = null
    let currentStep = null
    let backlogCount = 0

    for (const chap of subjectChapters) {
      const chapProg = subjectProgress.filter(p => p.chapter_id === chap.id)
      
      if (chapProg.length < WORKFLOW_STEPS.length) {
        if (!currentChapter) {
          currentChapter = chap
          // Find next step
          const completedStepKeys = new Set(chapProg.map(p => p.step_key))
          currentStep = WORKFLOW_STEPS.find(s => !completedStepKeys.has(s.key))
        } else {
          // If a previous chapter is incomplete, subsequent incomplete ones are backlog if they are past due (for simplicity, just count any started but incomplete as backlog)
          if (chapProg.length > 0) {
            backlogCount++
          }
        }
      }
    }

    return { progress: progressPercent, backlog: backlogCount, currentChapter, currentStep, totalChapters: subjectChapters.length }
  }, [subject, chapters, progress])

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/40">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Book className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{subject.name}</h3>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{subject.is_batch_paced ? 'Batch Paced' : 'Self Paced'}</span>
            </div>
          </div>
          {stats.backlog > 0 && (
            <div className="flex items-center gap-1 text-xs font-medium text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full">
              <AlertCircle className="h-3 w-3" />
              <span>{stats.backlog} Backlog</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="text-foreground">{stats.progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out" 
                style={{ width: `${stats.progress}%` }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/40 border border-transparent">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <Target className="h-3.5 w-3.5" /> 
                Current Chapter
              </div>
              <span className="text-sm font-semibold line-clamp-1">{stats.currentChapter?.name || 'All Caught Up!'}</span>
            </div>
            
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/40 border border-transparent">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <Activity className="h-3.5 w-3.5" /> 
                Next Action
              </div>
              <span className="text-sm font-semibold line-clamp-1 text-primary">{stats.currentStep?.label || 'Review'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-border bg-muted/20 p-3 flex items-center justify-between gap-3">
        <Link 
          to={`/subjects/${subject.id}`} 
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-colors border border-transparent hover:border-border"
        >
          <BarChart3 className="h-4 w-4" />
          Details
        </Link>
        <Link 
          to={stats.currentChapter ? `/subjects/go/${stats.currentChapter.id}` : `/subjects/${subject.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors shadow-sm"
        >
          Resume
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

function Target(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
