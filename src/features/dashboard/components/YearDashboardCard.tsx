import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  useChapters,
  useAllChapterProgress,
  useRoadmapMonths,
  useRoadmapPhases,
  useBacklog,
  useAllResourceProgress,
  useLatestWeeklyReview,
  useFormulaSheets,
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
  if (!chapters.length) return 0
  const completedIds = new Set(progress.filter(p => p.status === 'Completed').map(p => p.chapter_id))
  const completed = chapters.filter(c => completedIds.has(c.id)).length
  return Math.round((completed / chapters.length) * 100)
}

function computeJeeProgress(chapters: Chapter[], progress: ChapterProgress[]): number {
  const jeeChapters = chapters.filter(c => c.jee_weight !== 'none')
  if (!jeeChapters.length) return 0
  const completedIds = new Set(progress.filter(p => p.status === 'Completed').map(p => p.chapter_id))
  const completed = jeeChapters.filter(c => completedIds.has(c.id)).length
  return Math.round((completed / jeeChapters.length) * 100)
}

function getResourceStatus(
  resourceName: string,
  resourceProgress: Array<{ resource_id: string; status: string; resources: { name: string } | null }>,
): string {
  const entries = resourceProgress.filter(rp => rp.resources?.name === resourceName)
  if (!entries.length) return 'Not started'
  const completed = entries.filter(e => e.status === 'Completed').length
  if (completed === entries.length) return `Completed (${completed})`
  return `${completed}/${entries.length} chapters`
}

export function YearDashboardCard() {
  const { user } = useAuth()
  const { data: chapters = [] } = useChapters()
  const { data: progress = [] } = useAllChapterProgress(user?.id)
  const { data: phases = [] } = useRoadmapPhases()
  const { data: months = [] } = useRoadmapMonths()
  const { data: backlogItems = [] } = useBacklog(user?.id)
  const { data: resourceProgress = [] } = useAllResourceProgress(user?.id)
  const { data: latestReview } = useLatestWeeklyReview(user?.id)
  const { data: formulaSheets = [] } = useFormulaSheets(user?.id)

  const currentMonth = useMemo(() => {
    if (!months.length) return 'Loading...'
    const now = new Date()
    const match = months.find(m => {
      const d = new Date(m.month_date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    return match?.name ?? months[0]?.name ?? 'Unknown'
  }, [months])

  const currentPhase = useMemo(() => {
    if (!phases.length || !months.length) return 'Loading...'
    const now = new Date()
    const currentMonthObj = months.find(m => {
      const d = new Date(m.month_date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    if (!currentMonthObj) return phases[0]?.name ?? 'Unknown'
    const phase = phases.find(p => p.id === currentMonthObj.phase_id)
    return phase?.name ?? 'Unknown'
  }, [phases, months])

  const boardsProgress = useMemo(() => computeBoardsProgress(chapters, progress), [chapters, progress])
  const jeeProgress = useMemo(() => computeJeeProgress(chapters, progress), [chapters, progress])

  const backlogCount = backlogItems.length
  const backlogStatus = getBacklogStatus(backlogCount)

  const healthStatus = latestReview
    ? `Energy ${latestReview.energy_level}/10`
    : 'Not yet logged — baseline week'

  const formulaStatus = formulaSheets.length > 0
    ? `${formulaSheets.length} chapter${formulaSheets.length !== 1 ? 's' : ''} started`
    : 'Not started'

  const ncertStatus = getResourceStatus('NCERT', resourceProgress)
  const winrStatus = getResourceStatus('WINR', resourceProgress)
  const boardPyqStatus = getResourceStatus('Board PYQs', resourceProgress)
  const jeePyqStatus = getResourceStatus('JEE PYQs', resourceProgress)
  const hcvStatus = getResourceStatus('H.C. Verma', resourceProgress)

  const metrics: Array<{ label: string; value: React.ReactNode; highlight?: string }> = [
    { label: 'Current Month', value: currentMonth },
    { label: 'Current Phase', value: currentPhase },
    {
      label: 'Boards Progress',
      value: (
        <div className="flex items-center gap-3">
          <Progress value={boardsProgress} className="h-2 w-32" />
          <span className="tabular-nums">{boardsProgress}%</span>
        </div>
      ),
    },
    {
      label: 'JEE Progress',
      value: (
        <div className="flex items-center gap-3">
          <Progress value={jeeProgress} className="h-2 w-32" />
          <span className="tabular-nums">{jeeProgress}%</span>
        </div>
      ),
    },
    {
      label: 'Backlog',
      value: <span className={`font-semibold ${backlogStatus.color}`}>{backlogCount} chapter{backlogCount !== 1 ? 's' : ''} — {backlogStatus.label}</span>,
      highlight: backlogStatus.bg,
    },
    { label: 'Health / Energy', value: healthStatus },
    { label: 'Formula Sheets', value: formulaStatus },
    { label: 'PYQs (Board + JEE)', value: `Board: ${boardPyqStatus} · JEE: ${jeePyqStatus}` },
    { label: 'H.C. Verma', value: hcvStatus },
    { label: 'WINR', value: winrStatus },
    { label: 'NCERT', value: ncertStatus },
    { label: 'Python / Income', value: 'Not started' },
    { label: 'Class 11 Revision', value: 'Audit pending' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Year Dashboard</CardTitle>
        <CardDescription>Executive summary — update every Sunday during the planning ritual</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left font-medium">
                <th className="p-3">Metric</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => (
                <tr
                  key={m.label}
                  className={`${i < metrics.length - 1 ? 'border-b' : ''} ${m.highlight ?? ''}`}
                >
                  <td className="p-3 font-medium">{m.label}</td>
                  <td className="p-3">{typeof m.value === 'string' ? <span className="text-muted-foreground">{m.value}</span> : m.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p className="font-medium">How to Read This Page:</p>
          <ul className="list-inside list-disc space-y-0.5">
            <li>Backlog is the single most important row — if it is not GREEN, check Section 15 before doing anything else.</li>
            <li>Progress bars are a percentage of combined board+JEE syllabus, not of time elapsed.</li>
            <li>Blank/zero entries in July are expected — this page is a mirror, not a scoreboard.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
