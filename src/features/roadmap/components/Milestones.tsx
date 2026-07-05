import { useMemo } from 'react'
import { Flag, Clock } from 'lucide-react'
import type { RoadmapMilestone } from '@/lib/supabase/types'

interface MilestonesProps {
  milestones: RoadmapMilestone[]
}

export function Milestones({ milestones }: MilestonesProps) {
  // Add countdown property
  const enrichedMilestones = useMemo(() => {
    const now = new Date()
    return milestones.map(m => {
      const target = new Date(m.target_date)
      const diffTime = target.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return { ...m, countdownDays: diffDays }
    })
  }, [milestones])

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Flag className="h-5 w-5 text-primary" />
        <h2 className="font-semibold tracking-tight text-foreground">Important Milestones</h2>
      </div>

      <div className="mt-4 space-y-4">
        {enrichedMilestones.map(milestone => {
          const isPast = milestone.countdownDays < 0
          
          return (
            <div key={milestone.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg p-3 border ${isPast ? 'bg-muted/30 border-transparent opacity-60' : 'bg-background border-border shadow-sm'}`}>
              <div>
                <h3 className="font-semibold text-sm text-foreground">{milestone.name}</h3>
                {milestone.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{milestone.description}</p>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="text-muted-foreground tabular-nums">
                  {new Date(milestone.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                {!isPast && (
                  <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3" />
                    <span>{milestone.countdownDays}d</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
