import { Compass, ArrowRight, ArrowLeft } from 'lucide-react'
import type { RoadmapPhase } from '@/lib/supabase/types'

interface RoadmapPhaseSnapshotProps {
  currentPhase: RoadmapPhase | null
  phases: RoadmapPhase[]
}

export function RoadmapPhaseSnapshot({ currentPhase, phases }: RoadmapPhaseSnapshotProps) {
  if (!currentPhase) return null

  const currentIndex = phases.findIndex(p => p.id === currentPhase.id)
  const prevPhase = currentIndex > 0 ? phases[currentIndex - 1] : null
  const nextPhase = currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Compass className="h-5 w-5 text-primary" />
        <h2 className="font-semibold tracking-tight text-foreground">Phase Objectives</h2>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-bold text-foreground mb-2">{currentPhase.name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {currentPhase.description || 'Focus on consistent execution and foundation building.'}
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-4">
        <div className="flex-1 w-full flex items-center justify-start">
          {prevPhase && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="line-clamp-1">{prevPhase.name}</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 w-full flex items-center justify-end">
          {nextPhase && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <span className="line-clamp-1">{nextPhase.name}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
