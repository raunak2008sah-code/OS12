import { useState } from 'react'
import { RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Revision } from '@/lib/supabase/types'

interface ChapterRevisionsProps {
  revisions: Revision[]
  onToggle: (day: number, status: string) => void
}

const REVISION_DAYS = [1, 3, 7, 21, 45]

export function ChapterRevisions({ revisions, onToggle }: ChapterRevisionsProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const completedCount = REVISION_DAYS.filter(day => {
    const rev = revisions.find(r => r.revision_day === day)
    return rev?.status === 'completed'
  }).length

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm uppercase tracking-wider text-foreground">Spaced Repetition</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            {completedCount} / {REVISION_DAYS.length}
          </span>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <CardContent className="p-4 border-t border-border/50">
            <div className="flex flex-col gap-2 relative">
              <div className="absolute left-6 top-4 bottom-4 w-px bg-border/50" />
              
              {REVISION_DAYS.map(day => {
                const rev = revisions.find(r => r.revision_day === day)
                const isCompleted = rev?.status === 'completed'
                const nextStatus = isCompleted ? 'pending' : 'completed'

                return (
                  <div key={day} className="flex items-center justify-between p-3 rounded-xl border bg-background hover:border-primary/50 transition-colors relative z-10 group">
                    <div className="flex items-center gap-4">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                        isCompleted ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-background border-border text-muted-foreground'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="text-[10px] font-bold">{day}</span>}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Day {day} Revision</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Review materials</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onToggle(day, nextStatus)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        isCompleted 
                          ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' 
                          : 'bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'Mark Done'}
                    </button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
