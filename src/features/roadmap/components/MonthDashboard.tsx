import { type RoadmapMonthWorkload, type RoadmapMonthResource } from '@/lib/supabase/types'
import { Card, CardContent } from '@/components/ui/card'
import { subjectProgress } from '@/lib/progress'
import { BookOpen, CheckCircle, AlertCircle, Flame } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAllChapterProgress, useChapters, useBacklog } from '@/lib/supabase/queries'

interface MonthDashboardProps {
  workload: RoadmapMonthWorkload | null
  resources: RoadmapMonthResource[]
  monthPhaseId?: string
}

export function MonthDashboard({ workload, resources: _resources, monthPhaseId }: MonthDashboardProps) {
  const { user } = useAuth()
  const { data: chapters = [] } = useChapters()
  const { data: progress = [] } = useAllChapterProgress(user?.id)
  const { data: backlog = [] } = useBacklog(user?.id)

  // Calculate real stats
  const phaseChapters = monthPhaseId 
    ? chapters.filter(c => c.phase === monthPhaseId) 
    : chapters
  const completionRate = subjectProgress(phaseChapters.map(c => c.id), progress)

  const backlogCount = backlog.length

  const totalLoad = workload 
    ? workload.lecture_load + workload.practice_load + workload.revision_load + workload.testing_load 
    : 0

  const burnoutRisk = totalLoad > 80 ? 'High' : totalLoad > 50 ? 'Medium' : 'Low'

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-2 snap-x snap-mandatory">
      <div className="flex flex-row md:grid md:grid-cols-2 xl:grid-cols-4 gap-4 min-w-max md:min-w-0">
        
        {/* Study Load */}
        <Card className="w-64 md:w-auto shrink-0 snap-center hover:scale-[1.02] transition-transform duration-300">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Study Load</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{totalLoad}</span>
              <span className="text-sm text-muted-foreground mb-1">hrs/wk</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(totalLoad, 100)}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Completion */}
        <Card className="w-64 md:w-auto shrink-0 snap-center hover:scale-[1.02] transition-transform duration-300">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Completion</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-bold">{completionRate}%</span>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backlog */}
        <Card className="w-64 md:w-auto shrink-0 snap-center hover:scale-[1.02] transition-transform duration-300">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Active Backlog</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{backlogCount}</span>
              <span className="text-sm text-muted-foreground mb-1">tasks</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min((backlogCount / 30) * 100, 100)}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Burnout Risk */}
        <Card className="w-64 md:w-auto shrink-0 snap-center hover:scale-[1.02] transition-transform duration-300">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Flame className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Burnout Risk</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">{burnoutRisk}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${burnoutRisk === 'High' ? 'bg-red-500 w-[90%]' : burnoutRisk === 'Medium' ? 'bg-yellow-500 w-[50%]' : 'bg-green-500 w-[20%]'}`} />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
