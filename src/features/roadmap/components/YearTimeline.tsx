import { useEffect, useRef } from 'react'
import type { RoadmapMonth } from '@/lib/supabase/types'

interface YearTimelineProps {
  months: RoadmapMonth[]
  activeMonthByTime: RoadmapMonth | null
  selectedMonthId: string
  onSelectMonth: (id: string) => void
}

export function YearTimeline({ months, activeMonthByTime, selectedMonthId, onSelectMonth }: YearTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current && selectedMonthId) {
      const container = scrollRef.current
      const activeIndex = months.findIndex(m => m.id === selectedMonthId)
      const activeElement = container.children[activeIndex] as HTMLElement
      if (activeElement) {
        const scrollPosition = activeElement.offsetLeft - (container.clientWidth / 2) + (activeElement.clientWidth / 2)
        container.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' })
      }
    }
  }, [selectedMonthId, months])

  if (months.length === 0) return null

  // Determine actual current month index based on time
  const currentActualIndex = months.findIndex(m => m.id === activeMonthByTime?.id)

  return (
    <div 
      ref={scrollRef}
      className="flex w-full overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory items-center gap-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {months.map((month, idx) => {
        const isSelected = month.id === selectedMonthId
        const isPast = currentActualIndex !== -1 && idx < currentActualIndex
        const isCurrentActual = month.id === activeMonthByTime?.id

        let stateStyles = 'bg-card text-muted-foreground border-border/50 hover:bg-muted/50 hover:border-border cursor-pointer'
        
        if (isSelected) {
          stateStyles = 'bg-primary border-primary text-primary-foreground shadow-lg ring-4 ring-primary/20 scale-105 z-10 font-bold'
        } else if (isCurrentActual) {
          stateStyles = 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 cursor-pointer font-semibold'
        } else if (isPast) {
          stateStyles = 'bg-muted/30 text-muted-foreground border-border/30 hover:bg-muted/50 cursor-pointer'
        }

        return (
          <div key={month.id} className="flex items-center shrink-0 snap-center py-2 px-1">
            <button 
              onClick={() => onSelectMonth(month.id)}
              className={`flex h-12 min-w-[120px] flex-col items-center justify-center rounded-xl border px-3 text-center transition-all duration-300 ${stateStyles}`}
            >
              <span className="text-sm tracking-tight whitespace-nowrap">{month.name}</span>
            </button>
            {idx !== months.length - 1 && (
              <div className={`w-4 h-[2px] mx-1 transition-colors duration-300 ${isSelected || isCurrentActual ? 'bg-primary/40' : 'bg-border/30'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
