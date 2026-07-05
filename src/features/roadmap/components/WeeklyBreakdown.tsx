import { useMemo } from 'react'
import { CalendarDays, CheckCircle2, AlertCircle, Circle } from 'lucide-react'
import type { Chapter, Progress } from '@/lib/supabase/types'
import { WORKFLOW_STEPS } from '@/features/chapter-workflow/constants'
import { Link } from 'react-router-dom'

interface WeeklyBreakdownProps {
  chapters: Chapter[]
  progress: Progress[]
  monthName: string
}

export function WeeklyBreakdown({ chapters, progress, monthName }: WeeklyBreakdownProps) {
  // Filter chapters for the current month
  const monthChapters = useMemo(() => 
    chapters.filter(c => c.month === monthName && !c.is_placeholder),
  [chapters, monthName])

  // Group by week_number (1 to 5)
  const weeks = useMemo(() => {
    const map = new Map<number, Chapter[]>()
    for (let i = 1; i <= 5; i++) {
      map.set(i, [])
    }
    
    monthChapters.forEach(c => {
      const week = c.week_number || 1
      if (map.has(week)) {
        map.get(week)!.push(c)
      } else {
        map.set(week, [c])
      }
    })
    
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0])
  }, [monthChapters])

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-4 mb-6">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h2 className="font-semibold tracking-tight text-foreground">Weekly Breakdown</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {weeks.map(([weekNum, weekChapters]) => {
          if (weekChapters.length === 0) {
            return (
              <div key={weekNum} className="flex flex-col p-4 rounded-xl border border-dashed bg-muted/20 opacity-50">
                <h3 className="font-semibold text-sm">Week {weekNum}</h3>
                <p className="text-xs mt-2">Buffer / Revision</p>
              </div>
            )
          }

          return (
            <div key={weekNum} className="flex flex-col p-4 rounded-xl border bg-background shadow-sm hover:border-primary/40 transition-colors">
              <h3 className="font-semibold text-sm border-b pb-2 mb-3">Week {weekNum}</h3>
              <div className="flex flex-col gap-3">
                {weekChapters.map(chapter => {
                  const p = progress.filter(pr => pr.chapter_id === chapter.id)
                  const isComplete = WORKFLOW_STEPS.every(step => p.some(sp => sp.step_key === step.key))
                  const hasStarted = p.length > 0

                  let StatusIcon = Circle
                  let statusColor = 'text-muted-foreground'
                  if (isComplete) {
                    StatusIcon = CheckCircle2
                    statusColor = 'text-green-500'
                  } else if (hasStarted) {
                    StatusIcon = AlertCircle
                    statusColor = 'text-yellow-500'
                  }

                  return (
                    <Link to={`/subjects/go/${chapter.id}`} key={chapter.id} className="group flex items-start gap-2 hover:bg-muted/50 p-1.5 -mx-1.5 rounded-md transition-colors">
                      <StatusIcon className={`h-4 w-4 shrink-0 mt-0.5 ${statusColor}`} />
                      <span className="text-xs font-medium leading-tight group-hover:text-primary transition-colors">
                        {chapter.name}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
