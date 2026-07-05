import { Activity, BookOpen, PenTool, RefreshCw, CheckSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RoadmapMonthWorkload } from '@/lib/supabase/types'

interface WorkloadMeterProps {
  workload: RoadmapMonthWorkload | null
}

export function WorkloadMeter({ workload }: WorkloadMeterProps) {
  if (!workload) return null

  const maxScore = 10
  
  const totalLoad = workload.lecture_load + workload.practice_load + workload.revision_load + workload.testing_load
  // Max possible total is 40.
  let riskLevel = 'Low'
  let riskColor = 'text-green-500'
  if (totalLoad > 30) {
    riskLevel = 'High'
    riskColor = 'text-red-500'
  } else if (totalLoad > 22) {
    riskLevel = 'Medium'
    riskColor = 'text-yellow-500'
  }

  const bars = [
    { label: 'Lecture', score: workload.lecture_load, color: 'bg-blue-500', icon: BookOpen },
    { label: 'Practice', score: workload.practice_load, color: 'bg-purple-500', icon: PenTool },
    { label: 'Revision', score: workload.revision_load, color: 'bg-orange-500', icon: RefreshCw },
    { label: 'Testing', score: workload.testing_load, color: 'bg-red-500', icon: CheckSquare },
  ]

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Workload Meter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-4">
          {bars.map(bar => {
            const Icon = bar.icon
            const percent = Math.min((bar.score / maxScore) * 100, 100)
            
            return (
              <div key={bar.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{bar.label}</span>
                  </div>
                  <span className="text-foreground">{bar.score}/{maxScore}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div 
                    className={`h-full ${bar.color} transition-all duration-500 ease-out`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between border-t pt-4 text-sm font-medium">
          <span className="text-muted-foreground">Burnout Risk</span>
          <span className={riskColor}>{riskLevel}</span>
        </div>
      </CardContent>
    </Card>
  )
}
