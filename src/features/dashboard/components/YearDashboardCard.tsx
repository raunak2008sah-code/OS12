import { useMemo } from 'react'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { subjectProgress } from '@/lib/progress'
import {
  useChapters,
  useAllChapterProgress,
  useBacklog,
  useLatestWeeklyReview,
} from '@/lib/supabase/queries'
import { useAuth } from '@/hooks/useAuth'
import type { Chapter, ChapterProgress } from '@/lib/supabase/types'

/** Section 15.1 escalation table */
function getBacklogStatus(count: number): { label: string; color: string; bg: string } {
  if (count === 0) return { label: 'GREEN', color: 'text-green-600', bg: 'bg-green-500/10' }
  if (count === 1) return { label: 'YELLOW', color: 'text-yellow-600', bg: 'bg-yellow-500/10' }
  if (count === 2) return { label: 'ORANGE', color: 'text-orange-600', bg: 'bg-orange-500/10' }
  return { label: 'RED', color: 'text-red-600', bg: 'bg-red-500/10' }
}

function computeBoardsProgress(chapters: Chapter[], progress: ChapterProgress[]): number {
  return subjectProgress(chapters.map(c => c.id), progress)
}

function computeJeeProgress(chapters: Chapter[], progress: ChapterProgress[]): number {
  const jeeChapters = chapters.filter(c => c.jee_weight !== 'none')
  return subjectProgress(jeeChapters.map(c => c.id), progress)
}



export function YearDashboardCard() {
  const { user } = useAuth()
  const { data: chapters = [] } = useChapters()
  const { data: progress = [] } = useAllChapterProgress(user?.id)
  const { data: backlogItems = [] } = useBacklog(user?.id)
  const { data: latestReview } = useLatestWeeklyReview(user?.id)

  const boardsProgress = useMemo(() => computeBoardsProgress(chapters, progress), [chapters, progress])
  const jeeProgress = useMemo(() => computeJeeProgress(chapters, progress), [chapters, progress])

  const backlogCount = backlogItems.length
  const backlogStatus = getBacklogStatus(backlogCount)

  const metrics: Array<{ label: string; value: React.ReactNode; highlight?: string }> = [
    {
      label: 'Boards Progress',
      value: (
        <div className="flex items-center gap-3 mt-1">
          <Progress value={boardsProgress} className="h-1.5 flex-1" />
          <span className="tabular-nums text-sm font-semibold">{boardsProgress}%</span>
        </div>
      ),
    },
    {
      label: 'JEE Progress',
      value: (
        <div className="flex items-center gap-3 mt-1">
          <Progress value={jeeProgress} className="h-1.5 flex-1" />
          <span className="tabular-nums text-sm font-semibold">{jeeProgress}%</span>
        </div>
      ),
    },
    {
      label: 'Backlog',
      value: <span className={`font-semibold ${backlogStatus.color}`}>{backlogCount} chapter{backlogCount !== 1 ? 's' : ''}</span>,
      highlight: backlogStatus.bg,
    },
    { 
      label: 'Revision Due', 
      value: <span className="text-orange-500 font-medium">Physics: Mechanics</span>,
      highlight: 'bg-orange-500/5'
    },
    { 
      label: 'Health / Energy', 
      value: latestReview ? `${latestReview.energy_level}/10 Energy` : 'Healthy' 
    },
    { 
      label: 'Study Streak', 
      value: <span className="flex items-center gap-1.5 text-primary"><span className="font-bold">12</span> Days 🔥</span>
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((m) => (
        <Card key={m.label} className={`overflow-hidden shadow-sm border-border/60 ${m.highlight ? m.highlight : 'bg-card'}`}>
          <div className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              {m.label}
            </p>
            <div className="text-sm font-medium">
              {typeof m.value === 'string' ? <span className="text-foreground">{m.value}</span> : m.value}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
