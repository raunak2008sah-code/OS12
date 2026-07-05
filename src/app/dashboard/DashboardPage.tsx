import { useMemo } from 'react'
import { Calendar, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { YearDashboardCard } from '@/features/dashboard/components/YearDashboardCard'
import { BacklogBanner } from '@/features/dashboard/components/BacklogBanner'
import { TodaysFocus } from '@/features/dashboard/components/TodaysFocus'
import { FriendSnapshot } from '@/features/dashboard/components/FriendSnapshot'

/**
 * Section 13.3 — The Sunday Planning Ritual
 * "If the Sunday ritual is skipped, the whole week runs on guesswork."
 */
function SundayRitualPrompt() {
  const isSunday = useMemo(() => new Date().getDay() === 0, [])
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

      {/* Year Dashboard — the 13-row executive summary (Section 2) */}
      <YearDashboardCard />

      {/* Bottom grid — Today's Focus + Friend Snapshot */}
      <div className="grid gap-6 md:grid-cols-2">
        <TodaysFocus />
        <FriendSnapshot />
      </div>
    </div>
  )
}