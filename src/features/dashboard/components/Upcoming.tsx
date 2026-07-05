import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { useMilestones } from '@/lib/supabase/queries'
import { getNowIST } from '@/lib/time'

export function Upcoming() {
  const { data: milestones = [] } = useMilestones()
  const now = getNowIST()

  // Find next milestone
  const nextMilestone = useMemo(() => {
    const future = milestones.filter(m => m.target_date && new Date(m.target_date) > now)
    future.sort((a, b) => new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime())
    return future[0] || null
  }, [milestones, now])

  // Get days until JEE Main (approx Jan 24)
  const jeeDate = new Date(now.getFullYear() + (now.getMonth() > 0 ? 1 : 0), 0, 24)
  if (now > jeeDate && now.getMonth() > 5) {
    jeeDate.setFullYear(jeeDate.getFullYear() + 1)
  }
  const daysToJee = Math.max(0, Math.ceil((jeeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Upcoming
      </h3>
      
      <div className="relative border-l border-border/40 ml-2 space-y-6 pb-2">
        
        {/* Next Milestone */}
        <div className="relative pl-6">
          <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Next Milestone</p>
          <p className="text-sm font-medium text-foreground">{nextMilestone ? nextMilestone.name : 'Complete Syllabus'}</p>
          {nextMilestone?.target_date && (
            <p className="text-xs text-primary font-medium mt-1">
              {new Date(nextMilestone.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>

        {/* JEE Main Countdown */}
        <div className="relative pl-6">
          <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-orange-500 ring-4 ring-background" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">JEE Main</p>
          <p className="text-sm font-medium text-foreground">Session 1 Expected</p>
          <p className="text-xs text-orange-500 font-medium mt-1">
            {daysToJee} days remaining
          </p>
        </div>

        {/* Next Revision */}
        <div className="relative pl-6">
          <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-background" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Next Revision</p>
          <p className="text-sm font-medium text-foreground">Check active chapter</p>
          <p className="text-xs text-blue-500 font-medium mt-1">
            Sunday Planning
          </p>
        </div>

      </div>
    </div>
  )
}
