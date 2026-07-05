import { AlertTriangle, AlertCircle, XCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useBacklog } from '@/lib/supabase/queries'
import { useAuth } from '@/hooks/useAuth'

/**
 * Section 15.1 — Backlog Escalation Table
 *
 * 0 chapters  → GREEN  → Continue as planned
 * 1 chapter   → YELLOW → Clear within current week using buffer time
 * 2 chapters  → ORANGE → Freeze new content in that subject; pause NDA-extra + Income
 * 3+ chapters → RED    → Full stop on new content for up to 3 days; triage NCERT + PYQ only
 */

interface EscalationLevel {
  color: string
  bgColor: string
  borderColor: string
  icon: React.ElementType
  title: string
  description: string
}

const ESCALATION_LEVELS: Record<string, EscalationLevel> = {
  GREEN: {
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: CheckCircle2,
    title: 'Backlog Clear',
    description: 'Continue as planned.',
  },
  YELLOW: {
    color: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    icon: AlertCircle,
    title: 'Yellow Flag — 1 Chapter Behind',
    description: 'Clear it within the current week using buffer time before adding new content.',
  },
  ORANGE: {
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    icon: AlertTriangle,
    title: 'Orange Flag — 2 Chapters Behind',
    description: 'Freeze all new content in that subject until cleared. Income roadmap and NDA-extra time pause.',
  },
  RED: {
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: XCircle,
    title: 'Red Flag — 3+ Chapters Behind',
    description: 'Full stop on new content across all subjects for up to 3 days. Triage using only NCERT + PYQ core per chapter until back to zero.',
  },
}

function getEscalationKey(count: number): string {
  if (count === 0) return 'GREEN'
  if (count === 1) return 'YELLOW'
  if (count === 2) return 'ORANGE'
  return 'RED'
}

export function BacklogBanner() {
  const { user } = useAuth()
  const { data: backlogItems = [] } = useBacklog(user?.id)
  const count = backlogItems.length

  // Don't render when backlog is clear
  if (count === 0) return null

  const key = getEscalationKey(count)
  const level = ESCALATION_LEVELS[key]
  const Icon = level.icon

  return (
    <Card className={`${level.bgColor} ${level.borderColor} border`}>
      <CardContent className="flex items-start gap-4 py-4">
        <div className="mt-0.5 shrink-0">
          <Icon className={`h-5 w-5 ${level.color}`} />
        </div>
        <div className="space-y-1">
          <p className={`text-sm font-semibold ${level.color}`}>
            {level.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {level.description}
          </p>
          {count >= 3 && (
            <p className="text-xs font-medium text-muted-foreground mt-2">
              NEVER FREEZE: Science & Fun · NCERT · School
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}