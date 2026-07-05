
import { Calendar, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { YearDashboardCard } from '@/features/dashboard/components/YearDashboardCard'
import { BacklogBanner } from '@/features/dashboard/components/BacklogBanner'
import { TodaysFocus } from '@/features/dashboard/components/TodaysFocus'
import { FriendSnapshot } from '@/features/dashboard/components/FriendSnapshot'

import { CalendarWidget } from '@/features/dashboard/components/CalendarWidget'
import { CountdownWidget } from '@/features/dashboard/components/CountdownWidget'
import { isSundayIST } from '@/lib/time'
import { useTime } from '@/hooks/useTime'

/**
 * Section 13.3 — The Sunday Planning Ritual
 * "If the Sunday ritual is skipped, the whole week runs on guesswork."
 */
function SundayRitualPrompt() {
  const now = useTime(60000)
  const isSunday = isSundayIST(now)
  if (!isSunday) return null

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex items-start gap-4 py-4">
        <div className="mt-0.5 shrink-0">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary">
            Sunday Planning Ritual — 30 minutes, non-negotiable
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-inside list-disc">
            <li>Review last week: what was actually completed vs. planned?</li>
            <li>Check the Backlog Tracker — if it isn&apos;t zero, shrink this week&apos;s plan.</li>
            <li>Open the current month&apos;s page and pull this week&apos;s targets.</li>
            <li>Assign Learning and Practice blocks to batch-day evenings.</li>
            <li>Confirm the buffer slot exists and is not pre-committed.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your operating system at a glance — ten seconds to know exactly where you stand.
          </p>
        </div>
      </div>

      {/* Backlog Banner — shows above everything when active (Section 15.1) */}
      <BacklogBanner />

      {/* Sunday Ritual Prompt — only on Sundays (Section 13.3) */}
      <SundayRitualPrompt />

      <div className="grid gap-6 md:grid-cols-12 items-start">
        <div className="md:col-span-8 space-y-6">
          <YearDashboardCard />
          
          <div className="grid gap-6 md:grid-cols-2">
            <FriendSnapshot />
          </div>
        </div>
        
        <div className="md:col-span-4 space-y-6 sticky top-24">
          <CalendarWidget />
          <CountdownWidget />
          {/* Upcoming Revision Placeholder */}
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upcoming Revision</p>
                <p className="font-medium mt-1">Physics: Mechanics</p>
              </div>
              <div className="text-xs bg-orange-500/10 text-orange-500 font-bold px-2 py-1 rounded-md">Today</div>
            </CardContent>
          </Card>
          {/* Next Milestone Placeholder */}
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Milestone</p>
                <p className="font-medium mt-1">Complete Term 1 Syllabus</p>
              </div>
              <div className="text-xs bg-primary/10 text-primary font-bold px-2 py-1 rounded-md">Aug 30</div>
            </CardContent>
          </Card>
          <TodaysFocus />
        </div>
      </div>
    </div>
  )
}