import { useMemo } from 'react'
import { YearTimeline } from '@/features/roadmap/components/YearTimeline'
import { WorkloadMeter } from '@/features/roadmap/components/WorkloadMeter'
import { ResourceMatrix } from '@/features/roadmap/components/ResourceMatrix'
import { WeeklyBreakdown } from '@/features/roadmap/components/WeeklyBreakdown'
import { Milestones } from '@/features/roadmap/components/Milestones'
import { 
  useRoadmapPhases, 
  useRoadmapMonths, 
  useRoadmapMonthWorkload,
  useRoadmapMonthResources,
  useRoadmapWeeks,
  useMilestones
} from '@/lib/supabase/queries'
import { getNowIST, getEndOfDayIST } from '@/lib/time'

export default function YearRoadmapPage() {
  const { data: phases = [] } = useRoadmapPhases()
  const { data: months = [] } = useRoadmapMonths()

  const currentPhaseIndex = useMemo(() => {
    const now = getNowIST()
    const index = phases.findIndex(p => {
      const start = new Date(p.start_date) // Assuming Supabase dates can be parsed
      const end = getEndOfDayIST(new Date(p.end_date))
      return now >= start && now <= end
    })
    return index === -1 ? 0 : index
  }, [phases])

  const currentPhase = phases[currentPhaseIndex]
  const currentMonth = useMemo(() => {
    if (!currentPhase || months.length === 0) return null
    // We assume the active month corresponds to the active phase.
    // In OS12, Phase and Month generally align (Foundation=July, Momentum=Aug, etc)
    return months.find(m => m.phase_id === currentPhase.id) || null
  }, [currentPhase, months])

  const monthId = currentMonth?.id
  const { data: workload } = useRoadmapMonthWorkload(monthId)
  const { data: resources = [] } = useRoadmapMonthResources(monthId)
  const { data: weeks = [] } = useRoadmapWeeks(monthId)
  const { data: allMilestones = [] } = useMilestones()

  // Filter milestones to those with target_date within the current phase if possible
  const currentMilestones = useMemo(() => {
    if (!currentPhase) return allMilestones.slice(0, 5) // fallback
    const start = new Date(currentPhase.start_date)
    const end = getEndOfDayIST(new Date(currentPhase.end_date))
    return allMilestones.filter(m => {
      if (!m.target_date) return false
      const mDate = new Date(m.target_date)
      return mDate >= start && mDate <= end
    })
  }, [allMilestones, currentPhase])

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Roadmap</h1>
        <p className="mt-2 text-muted-foreground">
          Your execution guide for Class 12 Boards and JEE Main.
        </p>
      </div>

      {/* Section 3: Master Timeline */}
      <YearTimeline phases={phases} />

      {/* Section 7: Monthly Dashboard */}
      {currentPhase && currentMonth && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{currentMonth.name} Dashboard</h2>
              <p className="text-muted-foreground">{currentPhase.name} Phase • {currentMonth.focus_area}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column (Workload & Resources) */}
            <div className="md:col-span-4 space-y-6">
              <WorkloadMeter workload={workload || null} />
              <ResourceMatrix resources={resources} />
            </div>

            {/* Right Column (Weekly Breakdown & Milestones) */}
            <div className="md:col-span-8 space-y-6">
              <WeeklyBreakdown weeks={weeks} />
              <Milestones milestones={currentMilestones.length > 0 ? currentMilestones : allMilestones.slice(0, 5)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}