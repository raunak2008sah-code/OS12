import { useState } from 'react'
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { 
  useRoadmapPhases, 
  useRoadmapMonths, 
  useMilestones,
  useRoadmapMonthWorkload,
  useRoadmapMonthResources,
  useChapters,
  useProgress
} from '@/lib/supabase/queries'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateBlocks'
import { YearTimeline } from '@/features/roadmap/components/YearTimeline'
import { Milestones } from '@/features/roadmap/components/Milestones'
import { RoadmapPhaseSnapshot } from '@/features/roadmap/components/RoadmapPhaseSnapshot'
import { WorkloadMeter } from '@/features/roadmap/components/WorkloadMeter'
import { ResourceMatrix } from '@/features/roadmap/components/ResourceMatrix'
import { WeeklyBreakdown } from '@/features/roadmap/components/WeeklyBreakdown'

export default function YearRoadmapPage() {
  const { user } = useAuth()
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null)

  const { data: phases, isLoading: isLoadingPhases, error: phasesError, refetch: refetchPhases } = useRoadmapPhases()
  const { data: months, isLoading: isLoadingMonths, error: monthsError, refetch: refetchMonths } = useRoadmapMonths()
  const { data: milestones, isLoading: isLoadingMilestones } = useMilestones()
  
  // Month-specific data
  const { data: workload } = useRoadmapMonthWorkload(selectedMonthId || undefined)
  const { data: resources } = useRoadmapMonthResources(selectedMonthId || undefined)
  const { data: chapters } = useChapters()
  const { data: progress } = useProgress(user?.id)

  const isLoading = isLoadingPhases || isLoadingMonths || isLoadingMilestones
  const error = phasesError || monthsError
  const hasNoData = !phases?.length && !months?.length

  if (isLoading) return <LoadingState message="Loading roadmap data..." />
  
  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={() => {
          void refetchPhases()
          void refetchMonths()
        }} 
      />
    )
  }

  if (hasNoData) {
    return <EmptyState title="No Roadmap Configured" description="The curriculum phases and months have not been setup yet." />
  }

  const selectedMonth = months?.find(m => m.id === selectedMonthId)
  const selectedPhase = phases?.find(p => p.id === selectedMonth?.phase_id)

  if (selectedMonthId && selectedMonth) {
    // === MONTH VIEW ===
    return (
      <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in-50 duration-500 pb-16">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedMonthId(null)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{selectedMonth.name}</h1>
            <p className="mt-1 text-muted-foreground">{selectedMonth.focus_area || 'Standard operations'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-6">
            <WeeklyBreakdown chapters={chapters || []} progress={progress || []} monthName={selectedMonth.name} />
            <ResourceMatrix resources={resources || []} />
          </div>
          <div className="flex flex-col gap-6">
            <WorkloadMeter workload={workload || null} />
            <RoadmapPhaseSnapshot currentPhase={selectedPhase || null} phases={phases || []} />
          </div>
        </div>
      </div>
    )
  }

  // === YEAR VIEW ===
  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in-50 duration-500 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Yearly Roadmap</h1>
        <p className="text-muted-foreground mt-2">Macro-level planning of your curriculum across 8 phases.</p>
      </div>

      <YearTimeline phases={phases || []} />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-foreground">Month Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {months?.map((month) => {
              const phase = phases?.find(p => p.id === month.phase_id)
              return (
                <button
                  key={month.id}
                  onClick={() => setSelectedMonthId(month.id)}
                  className="group flex flex-col items-start rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex w-full items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{month.name}</span>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                      Phase {phase?.order_index}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{month.focus_area || 'Standard operations'}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Milestones milestones={milestones || []} />
        </div>
      </div>
    </div>
  )
}
