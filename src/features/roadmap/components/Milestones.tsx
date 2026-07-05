import { Flag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Milestone } from '@/lib/supabase/types'

interface MilestonesProps {
  milestones: Milestone[]
}

export function Milestones({ milestones }: MilestonesProps) {
  if (!milestones || milestones.length === 0) return null

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flag className="h-5 w-5 text-primary" />
          Monthly Deliverables
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {milestones.map((milestone) => (
            <li key={milestone.id} className="flex gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">
                  {milestone.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {milestone.condition}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}