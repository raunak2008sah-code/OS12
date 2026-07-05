import { Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { BacklogBanner } from '@/features/dashboard/components/BacklogBanner'
import { TodaysFocus } from '@/features/dashboard/components/TodaysFocus'
import { Upcoming } from '@/features/dashboard/components/Upcoming'
import { HealthIndicator } from '@/features/dashboard/components/HealthIndicator'
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
    <div className="flex-1 w-full max-w-4xl mx-auto space-y-12 p-4 md:p-8 pt-12 md:pt-16 pb-24">
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-medium tracking-tight text-foreground/80">Dashboard</h1>
        <HealthIndicator />
      </div>

      <BacklogBanner />
      <SundayRitualPrompt />

      <div className="grid gap-16 md:grid-cols-12 items-start pt-4">
        {/* Left Column: What should I study? */}
        <div className="md:col-span-8">
          <TodaysFocus />
        </div>
        
        {/* Right Column: What is due next? */}
        <div className="md:col-span-4">
          <Upcoming />
        </div>
      </div>
    </div>
  )
}