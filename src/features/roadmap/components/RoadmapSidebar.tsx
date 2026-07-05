import { formatIST } from '@/lib/time'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RoadmapPhase, RoadmapMonth, Milestone } from '@/lib/supabase/types'
import { Calendar, Target, Clock, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react'

interface RoadmapSidebarProps {
  currentPhase: RoadmapPhase | null
  currentMonth: RoadmapMonth | null
  milestones: Milestone[]
}

export function RoadmapSidebar({ currentPhase, currentMonth, milestones }: RoadmapSidebarProps) {
  const today = formatIST(new Date(), 'EEEE, MMMM do')

  const nextMilestone = milestones.find(m => m.target_date && new Date(m.target_date) > new Date())

  return (
    <div className="p-6 space-y-6">
      
      {/* Current Context */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{today}</p>
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          {currentPhase ? currentPhase.name : 'Planning'}
        </h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Calendar className="w-4 h-4" /> {currentMonth?.name} • Active Week
        </p>
      </div>

      {/* Quick Actions */}
      <Card className="bg-primary/5 border-primary/20 shadow-none">
        <CardContent className="p-4 flex flex-col gap-2">
          <button className="flex items-center justify-between w-full p-2 hover:bg-primary/10 rounded-lg text-sm font-semibold transition-colors text-primary">
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Start Study Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="flex items-center justify-between w-full p-2 hover:bg-primary/10 rounded-lg text-sm font-semibold transition-colors text-primary">
            <span className="flex items-center gap-2"><Target className="w-4 h-4" /> Update Progress</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </CardContent>
      </Card>

      {/* Next Milestone */}
      <Card className="shadow-none border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Target className="w-4 h-4" /> Next Milestone
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextMilestone ? (
            <div>
              <p className="font-bold text-foreground leading-tight">{nextMilestone.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {nextMilestone.target_date ? formatIST(new Date(nextMilestone.target_date), 'MMM do, yyyy') : 'No Date'}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming milestones</p>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Revision */}
      <Card className="shadow-none border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Clock className="w-4 h-4" /> Upcoming Revision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-sm font-medium">Physics Mechanics</span>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">In 2 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Organic Chem</span>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Next week</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backlog Alert */}
      <Card className="shadow-none border-orange-500/30 bg-orange-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-orange-600 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" /> Backlog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">
            You have <span className="font-bold">3 tasks</span> overdue from last week. Try to complete them this weekend.
          </p>
        </CardContent>
      </Card>

    </div>
  )
}
