import { useState } from 'react'
import { LayoutGrid, Flag, CheckSquare } from 'lucide-react'
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
  
  const activeWeek = weeks && weeks.length > 0 ? (weeks.find(w => w.id === activeWeekId) || weeks[0]) : null

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        
        {/* Column 1: Weekly Tasks */}
        <Card className="border-border/50 bg-card/50 flex flex-col">
          <div className="flex items-center gap-2 p-2 bg-muted/20 border-b border-border/50">
            <CheckSquare className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-xs uppercase tracking-wide">Weekly Tasks</span>
          </div>
          <CardContent className="p-4 space-y-4 flex-1">
            {activeWeek ? (
              <>
                <div className="bg-background rounded-lg p-2.5 border border-border/50">
                  <h4 className="text-xs font-semibold text-foreground mb-1">Focus</h4>
                  <p className="text-xs text-muted-foreground">{activeWeek.focus}</p>
                </div>
                <div className="bg-background rounded-lg p-2.5 border border-border/50">
                  <h4 className="text-xs font-semibold text-foreground mb-1">Books & Practice</h4>
                  <p className="text-xs text-muted-foreground">{activeWeek.books_practice}</p>
                </div>
                <div className="bg-background rounded-lg p-2.5 border border-border/50">
                  <h4 className="text-xs font-semibold text-foreground mb-1">Checkpoint</h4>
                  <p className="text-xs text-muted-foreground">{activeWeek.checkpoint}</p>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No data for this week.</p>
            )}
          </CardContent>
        </Card>

        {/* Column 2: Resource Matrix */}
        <Card className="border-border/50 bg-card/50 flex flex-col">
          <div className="flex items-center gap-2 p-2 bg-muted/20 border-b border-border/50">
            <LayoutGrid className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-xs uppercase tracking-wide">Resource Matrix</span>
          </div>
          <CardContent className="p-4 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resources.length > 0 ? resources.map(resource => (
                <div key={resource.id} className="bg-background border border-border/50 rounded-lg p-3 flex flex-col gap-2 shadow-sm">
                  <span className={cn("font-semibold text-sm truncate", resource.status === 'Inactive' ? 'text-muted-foreground' : 'text-foreground')}>
                    {resource.name}
                  </span>
                  <span className={cn("inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-bold w-fit", 
                    resource.status === 'Active' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    resource.status === 'Heavy Focus' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    resource.status === 'Revision' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                    resource.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    'bg-muted text-muted-foreground border-border/50'
                  )}>
                    {resource.status}
                  </span>
                </div>
              )) : <p className="text-xs text-muted-foreground col-span-full">No resources mapped.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Column 3: Deliverables */}
        <Card className="border-border/50 bg-card/50 flex flex-col">
          <div className="flex items-center gap-2 p-2 bg-muted/20 border-b border-border/50">
            <Flag className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-xs uppercase tracking-wide">Deliverables</span>
          </div>
          <CardContent className="p-4 flex-1">
            <div className="relative border-l-2 border-primary/20 ml-2 pl-4 space-y-4">
              {milestones.length > 0 ? milestones.map(milestone => (
                <div key={milestone.id} className="relative">
                  <div className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                  <div className="bg-background rounded-lg p-2.5 border border-border/50 shadow-sm">
                    <h4 className="text-xs font-bold text-foreground">{milestone.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{milestone.condition}</p>
                  </div>
                </div>
              )) : <p className="text-xs text-muted-foreground">No milestones.</p>}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}