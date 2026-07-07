import { useMemo } from 'react'
import { Activity, Target, Clock, TrendingUp, CalendarDays, BarChart3 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateOverallProgress, calculateSubjectProgress, isChapterDone } from '@/lib/progress'
import { 
  useChapters, 
  useAllChapterProgress, 
  useAllResourceProgress, 
  useAllNotes, 
  useAllRevisions, 
  useSubjects
} from '@/lib/supabase/queries'

export default function ProgressHubPage() {
  const { user } = useAuth()
  const userId = user?.id

  const { data: subjects = [] } = useSubjects()
  const { data: chapters = [] } = useChapters()
  const { data: chapterProgress = [] } = useAllChapterProgress(userId)
  const { data: resourceProgress = [] } = useAllResourceProgress(userId)
  const { data: notes = [] } = useAllNotes(userId)
  const { data: revisions = [] } = useAllRevisions(userId)

  const stats = useMemo(() => {
    const totalChapters = chapters.length
    const completedChapters = chapterProgress.filter(p => isChapterDone(p.status)).length
    const overallPercent = calculateOverallProgress(chapters, chapterProgress, subjects)

    const totalEstHours = chapters.reduce((sum, ch) => sum + (ch.estimated_hours || 0), 0)
    const completedHours = chapters
      .filter(ch => chapterProgress.some(p => p.chapter_id === ch.id && isChapterDone(p.status)))
      .reduce((sum, ch) => sum + (ch.estimated_hours || 0), 0)
    
    const completedResources = resourceProgress.filter(r => r.status === 'completed').length
    const completedRevisions = revisions.filter(r => r.status === 'completed').length

    // Per-subject breakdown
    const subjectStats = subjects.map(s => {
      const subChapters = chapters.filter(c => c.subject_id === s.id)
      const subCompleted = subChapters.filter(ch => 
        chapterProgress.some(p => p.chapter_id === ch.id && isChapterDone(p.status))
      ).length
      const pct = calculateSubjectProgress(s.id, chapters, chapterProgress, subjects)
      return { name: s.name, completed: subCompleted, total: subChapters.length, percent: pct }
    })

    // Calculate "Most Difficult" subject = lowest completion %
    const sortedByDifficulty = [...subjectStats].sort((a, b) => a.percent - b.percent)
    const mostDifficult = sortedByDifficulty.length > 0 ? sortedByDifficulty[0].name : 'N/A'

    // Calculate weekly target status: compare completed vs expected pace
    const expectedPace = Math.round(totalChapters * 0.08) // ~8% per month
    const weeklyTargetStatus = completedChapters >= expectedPace ? 'On Track' : 'Behind'

    return {
      overallPercent,
      completedChapters,
      totalChapters,
      totalEstHours,
      completedHours,
      completedResources,
      completedRevisions,
      totalNotes: notes.length,
      subjectStats,
      mostDifficult,
      weeklyTargetStatus
    }
  }, [chapters, chapterProgress, resourceProgress, revisions, notes, subjects])

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-[350ms] ease-[cubic-bezier(0,0,0.2,1)] p-4 md:p-6 lg:p-8 pt-4">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              Progress Hub
            </h1>
            <p className="text-[13px] text-muted-foreground/80 mt-1">Comprehensive analytics for your study journey.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="text-2xl font-black text-primary tracking-tight">{stats.overallPercent}%</span>
          </div>
        </div>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard title="Overall" value={`${stats.overallPercent}%`} sub={`${stats.completedChapters}/${stats.totalChapters} chapters`} icon={Target} color="text-green-500" accent="bg-green-500" />
        <MetricCard title="Study Hours" value={`${stats.completedHours}h`} sub={`of ${stats.totalEstHours}h estimated`} icon={Clock} color="text-blue-500" accent="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Subject Breakdown + Milestones */}
        <div className="lg:col-span-2 space-y-5">
          {/* Subject Progress Breakdown */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 tracking-tight">
                <TrendingUp className="h-4 w-4 text-primary" />
                Subject Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              {stats.subjectStats.map(s => (
                <ProgressBar key={s.name} label={s.name} value={s.percent} total={100} isPercent={true} originalCompleted={s.completed} originalTotal={s.total} />
              ))}
            </CardContent>
          </Card>

          {/* Milestone Achievements */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-bold tracking-tight">Milestone Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <ProgressBar label="Resources Completed" value={stats.completedResources} total={Math.max(stats.completedResources + 10, 50)} color="bg-blue-500" />
              <ProgressBar label="Revisions Done" value={stats.completedRevisions} total={Math.max(stats.completedRevisions + 10, 30)} color="bg-green-500" />
              <ProgressBar label="Notes Finalized" value={stats.totalNotes} total={stats.totalChapters} color="bg-yellow-500" />
            </CardContent>
          </Card>

          {/* Weekly Heatmap */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 tracking-tight">
                <CalendarDays className="h-4 w-4 text-primary" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex gap-3 justify-between items-end h-32 pt-4">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
                  const dayActivity = chapterProgress.filter(p => {
                    if (!p.completed_at) return false
                    const d = new Date(p.completed_at)
                    return d.getDay() === ((i + 1) % 7)
                  }).length
                  const maxActivity = Math.max(1, ...['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((_, j) =>
                    chapterProgress.filter(p => {
                      if (!p.completed_at) return false
                      return new Date(p.completed_at).getDay() === ((j + 1) % 7)
                    }).length
                  ))
                  const activityScore = Math.round((dayActivity / maxActivity) * 100)
                  return (
                    <div key={i} className="w-full flex flex-col items-center gap-2 group">
                      <div className="w-full bg-muted/20 border border-border/40 rounded-lg relative h-24 overflow-hidden group-hover:border-border/60 transition-colors duration-[150ms]">
                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-primary/80 to-primary/40 rounded-lg transition-all duration-700 ease-out" style={{ height: `${Math.max(5, activityScore)}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider group-hover:text-muted-foreground transition-colors">{day}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Insights */}
        <div className="space-y-5">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 tracking-tight">
                <CalendarDays className="h-4 w-4 text-primary" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 px-5 pb-5">
              <InsightRow label="Chapters Done" value={`${stats.completedChapters}`} status={stats.completedChapters > 0 ? 'success' : 'warning'} />
              <InsightRow label="Weekly Target" value={stats.weeklyTargetStatus} status={stats.weeklyTargetStatus === 'On Track' ? 'success' : 'warning'} />
              <InsightRow label="Weakest Subject" value={stats.mostDifficult} status="warning" />
              
              <div className="mt-5 p-4 bg-primary/[0.03] rounded-xl border border-primary/10 hover:border-primary/20 transition-colors duration-[150ms]">
                <h4 className="font-semibold text-primary text-[11px] uppercase tracking-wider mb-2">Next Best Action</h4>
                <p className="text-sm text-foreground leading-relaxed">
                  Start the next pending lecture in your weakest subject.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Study Summary */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-bold tracking-tight">Study Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 px-5 pb-5">
              <SummaryRow label="Total Notes" value={stats.totalNotes} />
              <SummaryRow label="Resources Done" value={stats.completedResources} />
              <SummaryRow label="Revisions Done" value={stats.completedRevisions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, sub, icon: Icon, color, accent }: any) {
  return (
    <Card className="border-border/40 shadow-sm hover:border-border/60 transition-colors duration-[220ms] ease-out group">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider">{title}</h3>
          <div className={`p-2 rounded-xl ${accent}/10 group-hover:scale-110 transition-transform duration-[220ms] ease-[cubic-bezier(0,0,0.2,1)]`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </div>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="text-[11px] font-medium text-muted-foreground/60 mt-1">{sub}</p>
      </CardContent>
    </Card>
  )
}

function ProgressBar({ label, value, total, color = 'bg-primary', isPercent = false, originalCompleted = 0, originalTotal = 0 }: any) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-foreground tracking-tight">{label}</span>
        {isPercent ? (
          <span className="text-muted-foreground font-mono text-[11px]">{originalCompleted}/{originalTotal} <span className="text-foreground font-bold">({value}%)</span></span>
        ) : (
          <span className="text-muted-foreground font-mono text-[11px]">{value}/{total} <span className="text-foreground font-bold">({percent}%)</span></span>
        )}
      </div>
      <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
        <div className={`h-full ${color} transition-all duration-[700ms] ease-[cubic-bezier(0,0,0.2,1)] rounded-full`} style={{ width: `${isPercent ? value : percent}%` }} />
      </div>
    </div>
  )
}

function InsightRow({ label, value, status }: any) {
  const color = status === 'danger' ? 'text-red-500 bg-red-500/10 border-red-500/20' : status === 'warning' ? 'text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 border-yellow-500/20' : 'text-green-600 dark:text-green-500 bg-green-500/10 border-green-500/20'
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors duration-[150ms]">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${color}`}>{value}</span>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors duration-[150ms]">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground tabular-nums">{value}</span>
    </div>
  )
}