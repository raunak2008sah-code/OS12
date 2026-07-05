import { useRoadmapPhases, useRoadmapMonths } from '@/lib/supabase/queries'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateBlocks'

export default function YearRoadmapPage() {
  const { data: phases, isLoading: isLoadingPhases, error: phasesError, refetch: refetchPhases } = useRoadmapPhases()
  const { data: months, isLoading: isLoadingMonths, error: monthsError, refetch: refetchMonths } = useRoadmapMonths()

  const isLoading = isLoadingPhases || isLoadingMonths
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Yearly Roadmap</h1>
        <p className="text-muted-foreground mt-2">Macro-level planning of your curriculum across phases.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {phases?.map((phase) => {
          const phaseMonths = months?.filter(m => m.phase_id === phase.id) || []
          
          return (
            <div key={phase.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
              <div className="border-b border-border bg-muted/30 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{phase.name}</h3>
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    Phase {phase.order_index}
                  </span>
                </div>
                {phase.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{phase.description}</p>
                )}
                <div className="mt-3 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  {new Date(phase.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} 
                  {' - '}
                  {new Date(phase.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </div>
              </div>
              
              <div className="flex-1 p-6">
                <h4 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wider">Months in Phase</h4>
                {phaseMonths.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No months assigned.</p>
                ) : (
                  <ul className="space-y-3">
                    {phaseMonths.map((month) => (
                      <li key={month.id} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50 text-[10px] font-medium text-muted-foreground">
                          {month.order_index}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{month.name}</p>
                          {month.focus_area && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{month.focus_area}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
