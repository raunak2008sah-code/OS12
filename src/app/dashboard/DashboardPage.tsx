import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useMilestones, useAllRevisions, useChapters } from '@/lib/supabase/queries'
import { Calendar, Sparkles, ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { YearDashboardCard } from '@/features/dashboard/components/YearDashboardCard'
import { BacklogBanner } from '@/features/dashboard/components/BacklogBanner'
import { TodaysFocus } from '@/features/dashboard/components/TodaysFocus'
import { CalendarWidget } from '@/features/dashboard/components/CalendarWidget'
import { CountdownWidget } from '@/features/dashboard/components/CountdownWidget'
import { FriendActivityWidget } from '@/features/dashboard/components/FriendActivityWidget'
import { isSundayIST } from '@/lib/time'
import { useTime } from '@/hooks/useTime'
import { cn } from '@/lib/utils'

function SundayRitualPrompt() {
  const now = useTime(60000)
  const isSunday = isSundayIST(now)
  const [expanded, setExpanded] = useState(() => {
    const saved = sessionStorage.getItem('os12-sunday-ritual-expanded')
    if (saved !== null) return saved === 'true'
    return isSunday
  })

  useEffect(() => {
    if (isSunday && sessionStorage.getItem('os12-sunday-ritual-expanded') === null) {
      setExpanded(true)
    }
  }, [isSunday])

  const handleToggle = (newState: boolean) => {
    setExpanded(newState)
    sessionStorage.setItem('os12-sunday-ritual-expanded', String(newState))
  }

  return (
    <Card className={cn("border-primary/30 transition-all duration-300", expanded ? "bg-primary/5" : "bg-card cursor-pointer hover:bg-muted/50")} onClick={() => !expanded && handleToggle(true)}>
      <CardContent className={cn("flex items-start gap-4", expanded ? "py-4" : "py-3")}>
        <div className="mt-0.5 shrink-0 flex items-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); handleToggle(!expanded) }}
            className="text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1 flex-1">
          <p className={cn("text-sm font-semibold text-primary", !expanded && "mt-0.5")}>
            Sunday Planning Ritual {expanded ? "— 30 minutes, non-negotiable" : ""}
          </p>
          {expanded && (
            <ul className="text-sm text-muted-foreground space-y-1 list-inside list-disc mt-2">
              <li>Review last week: what was actually completed vs. planned?</li>
              <li>Check the Backlog Tracker — if it isn&apos;t zero, shrink this week&apos;s plan.</li>
              <li>Open the current month&apos;s page and pull this week&apos;s targets.</li>
              <li>Assign Learning and Practice blocks to batch-day evenings.</li>
              <li>Confirm the buffer slot exists and is not pre-committed.</li>
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8 pt-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your operating system at a glance — ten seconds to know exactly where you stand.
          </p>
        </div>
      </div>

      <BacklogBanner />
      <SundayRitualPrompt />

      <div className="grid gap-6 md:grid-cols-12 items-start mt-2">
        <div className="md:col-span-8 space-y-4">
          <TodaysFocus />
          <YearDashboardCard />
        </div>
        
        <div className="md:col-span-4 space-y-4 lg:sticky lg:top-24">
          <CalendarWidget />
          <CountdownWidget />
          <FriendActivityWidget />
          
          <SidebarWidgets />
        </div>
      </div>
    </div>
  )
}

function SidebarWidgets() {
  const { user } = useAuth()
  const { data: milestones = [] } = useMilestones()
  const { data: revisions = [] } = useAllRevisions(user?.id)
  const { data: chapters = [] } = useChapters()

  // Find next milestone based on target_date
  const sortedMilestones = [...milestones]
    .filter(m => m.target_date)
    .sort((a, b) => new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime())
  
  const nextMilestone = sortedMilestones.find(m => new Date(m.target_date!) >= new Date()) || sortedMilestones[0]

  // Find upcoming revision
  const pendingRevisions = revisions.filter(r => r.status !== 'Completed')
  const nextRevision = pendingRevisions[0]
  const nextRevChapter = nextRevision ? chapters.find(c => c.id === nextRevision.chapter_id) : null

  if (!nextMilestone && !nextRevChapter) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 mt-4">
      {nextRevChapter && nextRevision && (
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Upcoming Revision</p>
              <p className="font-medium text-sm mt-0.5 truncate">{nextRevChapter.name}</p>
            </div>
            <div className="text-[10px] bg-orange-500/10 text-orange-500 font-bold px-2 py-1 rounded whitespace-nowrap">
              Day {nextRevision.revision_day}
            </div>
          </CardContent>
        </Card>
      )}
      
      {nextMilestone && (
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Next Milestone</p>
              <p className="font-medium text-sm mt-0.5 truncate">{nextMilestone.name}</p>
            </div>
            <div className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-1 rounded whitespace-nowrap">
              {nextMilestone.target_date ? new Date(nextMilestone.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Soon'}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}