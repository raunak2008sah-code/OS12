import { RefreshCw, CheckCircle2, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Revision } from '@/lib/supabase/types'

interface ChapterRevisionsProps {
  revisions: Revision[]
  onToggle: (day: number, status: string) => void
}

const REVISION_DAYS = [1, 3, 7, 21, 45]

export function ChapterRevisions({ revisions, onToggle }: ChapterRevisionsProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          Spaced Repetition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {REVISION_DAYS.map(day => {
            const rev = revisions.find(r => r.revision_day === day)
            const isCompleted = rev?.status === 'completed'
            const nextStatus = isCompleted ? 'pending' : 'completed'

            return (
              <div key={day} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">Day {day} Revision</span>
                    <span className="text-xs text-muted-foreground">Review materials after {day} {day === 1 ? 'day' : 'days'}</span>
                  </div>
                </div>
                <button
                  onClick={() => onToggle(day, nextStatus)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    isCompleted 
                      ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/30' 
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-transparent'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                  {isCompleted ? 'Completed' : 'Mark Done'}
                </button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
