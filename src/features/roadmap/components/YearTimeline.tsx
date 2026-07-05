import { useMemo } from 'react'
import type { RoadmapPhase } from '@/lib/supabase/types'

interface YearTimelineProps {
  phases: RoadmapPhase[]
}

export function YearTimeline({ phases }: YearTimelineProps) {
  const currentPhaseIndex = useMemo(() => {
    const now = new Date()
    return phases.findIndex(p => {
      const start = new Date(p.start_date)
      const end = new Date(p.end_date)
      return now >= start && now <= end
    })
  }, [phases])

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex min-w-[800px] items-center gap-2">
        {phases.map((phase, idx) => {
          const isPast = currentPhaseIndex === -1 ? false : idx < currentPhaseIndex
          const isCurrent = idx === currentPhaseIndex

          let stateStyles = 'bg-muted/50 text-muted-foreground border-transparent'
          if (isCurrent) {
            stateStyles = 'bg-primary border-primary text-primary-foreground shadow-md scale-105'
          } else if (isPast) {
            stateStyles = 'bg-primary/20 text-foreground border-primary/20'
          }

          return (
            <div key={phase.id} className="relative flex flex-1 flex-col items-center">
              <div 
                className={`flex w-full h-12 items-center justify-center rounded-lg border px-2 text-center text-sm font-medium transition-all duration-300 ${stateStyles}`}
              >
                <span className="line-clamp-1">{phase.name}</span>
              </div>
              
              {/* Connector lines between segments */}
              {idx !== phases.length - 1 && (
                <div className="absolute right-[-0.5rem] top-1/2 -translate-y-1/2 w-2 h-0.5 bg-border z-[-1]" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
