import { useState, useEffect } from 'react'
import { Calendar, Sparkles, ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { YearDashboardCard } from '@/features/dashboard/components/YearDashboardCard'
import { TodaysFocus } from '@/features/dashboard/components/TodaysFocus'
import { CalendarWidget } from '@/features/dashboard/components/CalendarWidget'
import { CountdownWidget } from '@/features/dashboard/components/CountdownWidget'
import { FriendActivityWidget } from '@/features/dashboard/components/FriendActivityWidget'
import { DailyCheckinWidget } from '@/features/dashboard/components/DailyCheckinWidget'
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
    <Card className={cn("border-border/40 transition-all duration-[220ms] ease-out group", expanded ? "bg-primary/[0.03]" : "bg-card cursor-pointer hover:bg-muted/30 hover:border-border/60")} onClick={() => !expanded && handleToggle(true)}>
      <CardContent className={cn("flex items-start gap-4 transition-all duration-[220ms] ease-out", expanded ? "p-5" : "px-5 py-3.5")}>
        <div className="mt-0.5 shrink-0 flex items-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); handleToggle(!expanded) }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1.5 flex-1">
          <p className={cn("text-sm font-semibold text-primary transition-all duration-[220ms] ease-out", !expanded && "mt-0.5")}>
            Sunday Planning Ritual {expanded ? "— 30 minutes, non-negotiable" : ""}
          </p>
          <div className={cn("grid transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]", expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
            <div className="overflow-hidden">
              <ul className="text-[13px] leading-relaxed text-muted-foreground/90 space-y-2 list-inside list-disc mt-2">
                <li>Review last week: what was actually completed vs. planned?</li>
                <li>Check the Backlog Tracker — if it isn&apos;t zero, shrink this week&apos;s plan.</li>
                <li>Open the current month&apos;s page and pull this week&apos;s targets.</li>
                <li>Assign Learning and Practice blocks to batch-day evenings.</li>
                <li>Confirm the buffer slot exists and is not pre-committed.</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 pt-4 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-[350ms] ease-[cubic-bezier(0,0,0.2,1)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-muted-foreground/80 mt-0.5">
            Your operating system at a glance — ten seconds to know exactly where you stand.
          </p>
        </div>
      </div>

      <SundayRitualPrompt />

      <div className="grid gap-5 md:grid-cols-12 items-start mt-2">
        <div className="md:col-span-8 space-y-5">
          <TodaysFocus />
          <YearDashboardCard />
          <DailyCheckinWidget />
          <FriendActivityWidget />
        </div>
        
        <div className="md:col-span-4 space-y-5 lg:sticky lg:top-24">
          <CalendarWidget />
          <CountdownWidget />
        </div>
      </div>
    </div>
  )
}