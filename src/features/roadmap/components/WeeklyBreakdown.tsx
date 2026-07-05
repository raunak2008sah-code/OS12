import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RoadmapWeek } from '@/lib/supabase/types'

interface WeeklyBreakdownProps {
  weeks: RoadmapWeek[]
}

export function WeeklyBreakdown({ weeks }: WeeklyBreakdownProps) {
  if (!weeks || weeks.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5 text-primary" />
          Weekly Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {weeks.map((week) => (
            <div key={week.id} className="flex flex-col md:flex-row gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
              <div className="md:w-32 flex-shrink-0">
                <div className="inline-flex items-center justify-center rounded-md bg-secondary/50 px-2.5 py-1 text-sm font-semibold text-secondary-foreground">
                  Week {week.week_number}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Focus</h4>
                  <p className="text-sm text-muted-foreground">{week.focus}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Books & Practice</h4>
                  <p className="text-sm text-muted-foreground">{week.books_practice}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Checkpoint</h4>
                  <p className="text-sm text-muted-foreground">{week.checkpoint}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}