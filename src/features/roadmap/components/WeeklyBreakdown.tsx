import { useState } from 'react'
import { ChevronDown, LayoutGrid, Flag, CheckSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { RoadmapWeek, Milestone, RoadmapMonthResource } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

interface WeeklyBreakdownProps {
  weeks: RoadmapWeek[]
  milestones: Milestone[]
  resources: RoadmapMonthResource[]
}

export function WeeklyBreakdown({ weeks, milestones, resources }: WeeklyBreakdownProps) {
  const [activeWeekId, setActiveWeekId] = useState<string | null>(weeks[0]?.id || null)
  
  // Accordion states
  const [tasksExpanded, setTasksExpanded] = useState(false)
  const [resourcesExpanded, setResourcesExpanded] = useState(false)
  const [deliverablesExpanded, setDeliverablesExpanded] = useState(false)

  if (!weeks || weeks.length === 0) return null

  const activeWeek = weeks.find(w => w.id === activeWeekId) || weeks[0]

  return (
    <div className="flex flex-col gap-6">
      
      {/* Week Tabs */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
        {weeks.map(week => {
          const isActive = week.id === activeWeekId
          return (
            <button
              key={week.id}
              onClick={() => setActiveWeekId(week.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shrink-0",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md scale-105" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Week {week.week_number}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-4">
        
        {/* Accordion 1: Weekly Tasks */}
        <Card className="overflow-hidden border-border/50 bg-card/50">
          <button 
            className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors"
            onClick={() => setTasksExpanded(!tasksExpanded)}
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              <span className="font-semibold text-base">Weekly Tasks</span>
            </div>
            <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", tasksExpanded && "rotate-180")} />
          </button>
          <div className={cn("grid transition-all duration-300", tasksExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
            <div className="overflow-hidden">
              <CardContent className="p-4 border-t border-border/50 space-y-4">
                {activeWeek ? (
                  <>
                    <div className="bg-background rounded-lg p-3 border border-border/50">
                      <h4 className="text-sm font-semibold text-foreground mb-1">Focus</h4>
                      <p className="text-sm text-muted-foreground">{activeWeek.focus}</p>
                    </div>
                    <div className="bg-background rounded-lg p-3 border border-border/50">
                      <h4 className="text-sm font-semibold text-foreground mb-1">Books & Practice</h4>
                      <p className="text-sm text-muted-foreground">{activeWeek.books_practice}</p>
                    </div>
                    <div className="bg-background rounded-lg p-3 border border-border/50">
                      <h4 className="text-sm font-semibold text-foreground mb-1">Checkpoint</h4>
                      <p className="text-sm text-muted-foreground">{activeWeek.checkpoint}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No data for this week.</p>
                )}
              </CardContent>
            </div>
          </div>
        </Card>

        {/* Accordion 2: Resource Matrix */}
        <Card className="overflow-hidden border-border/50 bg-card/50">
          <button 
            className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors"
            onClick={() => setResourcesExpanded(!resourcesExpanded)}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-primary" />
              <span className="font-semibold text-base">Resource Matrix</span>
            </div>
            <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", resourcesExpanded && "rotate-180")} />
          </button>
          <div className={cn("grid transition-all duration-300", resourcesExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
            <div className="overflow-hidden">
              <CardContent className="p-4 border-t border-border/50 space-y-2">
                {resources.length > 0 ? resources.map(resource => (
                  <div key={resource.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0 gap-2">
                    <span className={cn("font-medium", resource.status === 'Inactive' ? 'text-muted-foreground' : 'text-foreground')}>
                      {resource.resource_name}
                    </span>
                    <span className={cn("inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-24 text-center", 
                      resource.status === 'Active' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                      resource.status === 'Heavy Focus' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      resource.status === 'Revision' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      resource.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      'bg-muted text-muted-foreground border-border/50'
                    )}>
                      {resource.status}
                    </span>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No resources mapped for this month.</p>}
              </CardContent>
            </div>
          </div>
        </Card>

        {/* Accordion 3: Deliverables (Milestones) */}
        <Card className="overflow-hidden border-border/50 bg-card/50">
          <button 
            className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors"
            onClick={() => setDeliverablesExpanded(!deliverablesExpanded)}
          >
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-primary" />
              <span className="font-semibold text-base">Deliverables</span>
            </div>
            <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", deliverablesExpanded && "rotate-180")} />
          </button>
          <div className={cn("grid transition-all duration-300", deliverablesExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
            <div className="overflow-hidden">
              <CardContent className="p-4 border-t border-border/50">
                <div className="relative border-l-2 border-primary/20 ml-3 pl-5 space-y-6">
                  {milestones.length > 0 ? milestones.map(milestone => (
                    <div key={milestone.id} className="relative">
                      <div className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                      <div className="bg-background rounded-lg p-3 border border-border/50 shadow-sm">
                        <h4 className="text-sm font-bold text-foreground">{milestone.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{milestone.condition}</p>
                      </div>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No milestones for this month.</p>}
                </div>
              </CardContent>
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}