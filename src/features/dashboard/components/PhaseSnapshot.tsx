import { useMemo } from 'react'
import { Calendar, Compass } from 'lucide-react'
import type { RoadmapPhase, RoadmapMonth } from '@/lib/supabase/types'

import { getNowIST } from '@/lib/time'

interface PhaseSnapshotProps {
  phases: RoadmapPhase[]
  months: RoadmapMonth[]
}

export function PhaseSnapshot({ phases, months }: PhaseSnapshotProps) {
  const { currentPhase, currentMonth } = useMemo(() => {
    const now = getNowIST()
    const month = months.find(m => {
      const date = getNowIST()
      date.setTime(Date.parse(m.month_date))
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
    })
    
    const phase = phases.find(p => p.id === month?.phase_id)
    
    return { currentPhase: phase, currentMonth: month }
  }, [months, phases])

  if (!currentPhase || !currentMonth) {
    return (
      <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-semibold text-foreground">Timeline</h3>
        <p className="mt-2 text-sm text-muted-foreground">Outside of schedule bounds.</p>
      </div>
    )
  }

  // Calculate year progress
  const totalMonths = months.length || 1
  const completedMonths = currentMonth.order_index
  const progressPercent = Math.round((completedMonths / totalMonths) * 100)

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Compass className="h-5 w-5 text-primary" />
        <h2 className="font-semibold tracking-tight text-foreground">Current Phase</h2>
      </div>
      
      <div className="mt-4 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Phase {currentPhase.order_index}
          </p>
          <h3 className="mt-1 text-lg font-bold text-foreground">{currentPhase.name}</h3>
        </div>
        
        <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{currentMonth.name}</span>
        </div>

        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Syllabus Target</span>
            <span className="text-foreground">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
