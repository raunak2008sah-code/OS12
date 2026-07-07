import { useMemo, useState, useEffect } from 'react'
import { 
  useRoadmapPhases, 
  useRoadmapMonths, 
  useRoadmapMonthWorkload,
  useRoadmapMonthResources,
  useRoadmapWeeks,
  useMilestones
} from '@/lib/supabase/queries'
import { getNowIST } from '@/lib/time'
import { CalendarRange, Search } from 'lucide-react'
import { YearTimeline } from '@/features/roadmap/components/YearTimeline'
import { MonthDashboard } from '@/features/roadmap/components/MonthDashboard'
import { WeeklyBreakdown } from '@/features/roadmap/components/WeeklyBreakdown'

export default function YearRoadmapPage() {
  const { data: phases = [] } = useRoadmapPhases()
  const { data: months = [] } = useRoadmapMonths()
  const { data: allMilestones = [] } = useMilestones()

  const now = getNowIST()

  // Find the exact active month based on the calendar
  const activeMonthByTime = useMemo(() => {
    if (months.length === 0) return null
    return months.find(m => {
      const mDate = new Date(m.month_date)
      return now.getFullYear() === mDate.getFullYear() && now.getMonth() === mDate.getMonth()
    }) || months[0]
  }, [months, now])

  // Current selected month for display
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null)

  useEffect(() => {
    if (activeMonthByTime && !selectedMonthId) {
      setSelectedMonthId(activeMonthByTime.id)
    }
  }, [activeMonthByTime, selectedMonthId])

  const displayMonth = useMemo(() => {
    return months.find(m => m.id === selectedMonthId) || activeMonthByTime
  }, [selectedMonthId, months, activeMonthByTime])

  const displayPhase = useMemo(() => {
    if (!displayMonth) return null
    return phases.find(p => p.id === displayMonth.phase_id) || null
  }, [displayMonth, phases])

  // Queries tied to selected month
  const { data: workload } = useRoadmapMonthWorkload(displayMonth?.id)
  const { data: resources = [] } = useRoadmapMonthResources(displayMonth?.id)
  const { data: weeks = [] } = useRoadmapWeeks(displayMonth?.id)

  const monthMilestones = useMemo(() => {
    if (!displayMonth) return []
    const mDate = new Date(displayMonth.month_date)
    const mMonth = mDate.getMonth()
    const mYear = mDate.getFullYear()
    return allMilestones.filter(m => {
      if (!m.target_date) return false
      const target = new Date(m.target_date)
      return target.getMonth() === mMonth && target.getFullYear() === mYear
    })
  }, [allMilestones, displayMonth])

  const handleJumpToToday = () => {
    if (activeMonthByTime) setSelectedMonthId(activeMonthByTime.id)
  }

  if (!displayMonth) {
    return <div className="p-8 flex items-center justify-center animate-pulse">Loading Roadmap...</div>
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden pb-16 md:pb-0 animate-in fade-in slide-in-from-bottom-2 duration-[350ms] ease-[cubic-bezier(0,0,0.2,1)]">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex-shrink-0 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 py-4 md:px-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
                {displayMonth.name}
                <span className="text-xs font-semibold text-muted-foreground/80 bg-muted/40 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {displayPhase?.name} Phase
                </span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleJumpToToday}
              className="hidden md:flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CalendarRange className="w-3.5 h-3.5" /> Jump to Today
            </button>
            <button 
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/20 hover:bg-muted/50 border border-border/40 hover:border-border/60 rounded-lg transition-colors duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Search className="w-3.5 h-3.5 opacity-60" />
              <span>Search...</span>
              <kbd className="ml-2 px-1.5 py-0.5 bg-background border border-border/50 rounded text-[10px] font-mono shadow-sm">⌘K</kbd>
            </button>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-muted/[0.02] space-y-5">
          
          {/* Section 1: Horizontal Month Timeline */}
          <section className="bg-card/50 border border-border/50 rounded-xl p-2 md:p-3">
            <YearTimeline 
              months={months} 
              activeMonthByTime={activeMonthByTime}
              selectedMonthId={displayMonth.id} 
              onSelectMonth={setSelectedMonthId} 
            />
          </section>

          {/* Section 2: Month Dashboard Summary */}
          <section>
            <MonthDashboard workload={workload || null} resources={resources} monthPhaseId={displayPhase?.id} />
          </section>

          {/* Section 3: Weekly Breakdowns & Details */}
          <section className="flex-1">
            <WeeklyBreakdown 
              weeks={weeks} 
              milestones={monthMilestones} 
              resources={resources}
            />
          </section>

        </div>
      </div>
    </div>
  )
}