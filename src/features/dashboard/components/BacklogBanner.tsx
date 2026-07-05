import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, AlertCircle, AlertOctagon, ChevronRight } from 'lucide-react'
import type { Chapter, Progress, RoadmapMonth } from '@/lib/supabase/types'
import { WORKFLOW_STEPS } from '@/features/chapter-workflow/constants'

interface BacklogBannerProps {
  chapters: Chapter[]
  progress: Progress[]
  months: RoadmapMonth[]
}

export function BacklogBanner({ chapters, progress, months }: BacklogBannerProps) {
  // Compute backlog:
  // We need to know the "current" month. Let's assume current date determines it.
  const backlogChapters = useMemo(() => {
    const now = new Date()
    // Find the current roadmap month based on month_date
    const currentMonthIndex = months.findIndex(m => {
      const date = new Date(m.month_date)
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
    })
    
    if (currentMonthIndex <= 0) return [] // First month or not started, no backlog possible

    const backlog = chapters.filter(c => {
      if (c.is_placeholder) return false
      
      // Check if chapter belongs to a strictly PAST month
      const chapterMonthIndex = months.findIndex(m => m.name === c.month)
      if (chapterMonthIndex === -1 || chapterMonthIndex >= currentMonthIndex) {
        return false // Future or current month chapters are not backlog
      }

      // Check completion
      const chapterProgress = progress.filter(p => p.chapter_id === c.id)
      const isComplete = WORKFLOW_STEPS.every(step => 
        chapterProgress.some(p => p.step_key === step.key)
      )
      
      return !isComplete
    })

    return backlog
  }, [chapters, progress, months])

  if (backlogChapters.length === 0) return null

  const count = backlogChapters.length
  
  // Escalation logic based on PRD §15.1
  let config = {
    color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400',
    icon: <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />,
    title: '1 Chapter Behind',
    message: 'Action: Use Sunday buffer slot to clear this immediately.',
  }

  if (count === 2) {
    config = {
      color: 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-400',
      icon: <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-500" />,
      title: '2 Chapters Behind',
      message: 'Action: Cancel Sunday mock tests and freeze extracurriculars until cleared.',
    }
  } else if (count >= 3) {
    config = {
      color: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400',
      icon: <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-500" />,
      title: `${count} Chapters Behind (Code Red)`,
      message: 'Action: Emergency protocol §21 active. Halt current progression, fallback to minimum viable execution.',
    }
  }

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 shadow-sm ${config.color}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{config.icon}</div>
        <div>
          <h3 className="font-bold tracking-tight">{config.title}</h3>
          <p className="mt-1 text-sm font-medium opacity-90">{config.message}</p>
        </div>
      </div>
      
      <Link 
        to="/progress" 
        className="flex items-center gap-1 self-start sm:self-auto rounded-lg bg-background/50 px-3 py-1.5 text-sm font-semibold hover:bg-background/80 transition-colors"
      >
        View Tracker <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
