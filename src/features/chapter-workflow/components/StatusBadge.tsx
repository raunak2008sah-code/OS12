import { cn } from '@/lib/utils'

export type ChapterStatus = 'not_started' | 'in_progress' | 'mastered' | 'needs_review'

interface StatusBadgeProps {
  status: ChapterStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    not_started: { label: 'Not Started', classes: 'bg-muted/50 text-muted-foreground border-border' },
    in_progress: { label: 'In Progress', classes: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    mastered: { label: 'Mastered', classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    needs_review: { label: 'Needs Review', classes: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  }

  const { label, classes } = config[status]

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', classes, className)}>
      {label}
    </span>
  )
}
