import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { calculateOverallProgress } from '@/lib/progress'
import {
  useChapters,
  useAllChapterProgress,
  useSubjects,
} from '@/lib/supabase/queries'
import { useAuth } from '@/hooks/useAuth'
import type { Chapter, ChapterProgress } from '@/lib/supabase/types'

function computeBoardsProgress(chapters: Chapter[], progress: ChapterProgress[], subjects: any[]): number {
  return calculateOverallProgress(chapters, progress, subjects)
}

function computeJeeProgress(chapters: Chapter[], progress: ChapterProgress[], subjects: any[]): number {
  const jeeChapters = chapters.filter(c => c.jee_weight !== 'none')
  return calculateOverallProgress(jeeChapters, progress, subjects)
}

export function YearDashboardCard() {
  const { user } = useAuth()
  const { data: chapters = [] } = useChapters()
  const { data: progress = [] } = useAllChapterProgress(user?.id)
  const { data: subjects = [] } = useSubjects()

  const boardsProgress = useMemo(() => computeBoardsProgress(chapters, progress, subjects), [chapters, progress, subjects])
  const jeeProgress = useMemo(() => computeJeeProgress(chapters, progress, subjects), [chapters, progress, subjects])

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
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {metrics.map((m) => (
        <Card key={m.label} className={`overflow-hidden shadow-sm border-border/40 hover:border-border/60 transition-colors duration-[220ms] ease-out group ${m.highlight ? m.highlight : 'bg-card'}`}>
          <div className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2">
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
