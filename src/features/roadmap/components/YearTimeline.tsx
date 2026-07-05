import { useMemo, useEffect, useRef } from 'react'
import { CalendarRange } from 'lucide-react'
import type { RoadmapPhase } from '@/lib/supabase/types'

interface YearTimelineProps {
  phases: RoadmapPhase[]
}

export function YearTimeline({ phases }: YearTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const currentPhaseIndex = useMemo(() => {
    const now = new Date()
    const index = phases.findIndex(p => {
      const start = new Date(p.start_date)
      const end = new Date(p.end_date)
      // Set end date to end of day to ensure inclusion
      end.setHours(23, 59, 59, 999)
      return now >= start && now <= end
    })
    return index === -1 ? 0 : index // default to 0 if none matches
  }, [phases])

  // Auto-scroll to current phase on mount
  useEffect(() => {
    if (scrollRef.current && currentPhaseIndex >= 0) {
      const container = scrollRef.current
      const activeElement = container.children[currentPhaseIndex] as HTMLElement
      if (activeElement) {
        const scrollPosition = activeElement.offsetLeft - (container.clientWidth / 2) + (activeElement.clientWidth / 2)
        container.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' })
      }
    }
  }, [currentPhaseIndex, phases.length])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 px-1">
        <CalendarRange className="h-5 w-5 text-primary" />
        <h2 className="font-semibold tracking-tight text-foreground">Master Timeline</h2>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex w-full overflow-x-auto pb-4 pt-2 hide-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex min-w-max items-center px-4 gap-3">
          {phases.map((phase, idx) => {
            const isPast = idx < currentPhaseIndex
            const isCurrent = idx === currentPhaseIndex

            let stateStyles = 'bg-card text-muted-foreground border-border opacity-70'
            let connectorStyle = 'bg-border'

            if (isCurrent) {
              stateStyles = 'bg-primary border-primary text-primary-foreground shadow-md ring-4 ring-primary/20 scale-105'
              connectorStyle = 'bg-primary'
            } else if (isPast) {
              stateStyles = 'bg-primary/10 text-foreground border-primary/30'
              connectorStyle = 'bg-primary/30'
            }

            return (
              <div key={phase.id} className="relative flex items-center snap-center shrink-0 group">
                <div 
                  className={`flex h-14 min-w-[140px] flex-col items-center justify-center rounded-xl border px-4 text-center transition-all duration-300 ${stateStyles}`}
                >
                  <span className="text-sm font-bold tracking-tight">{phase.name}</span>
                </div>
                
                {/* Connector line */}
                {idx !== phases.length - 1 && (
                  <div className={`w-8 h-[2px] transition-colors duration-300 ${connectorStyle}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
