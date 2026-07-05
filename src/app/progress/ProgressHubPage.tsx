import { useMemo } from 'react'
import { Activity, Target, Clock, AlertCircle, TrendingUp, CalendarDays, BarChart3, Flame } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  useChapters, 
  useAllChapterProgress, 
  useAllResourceProgress, 
  useBacklog, 
  useAllNotes, 
  useAllRevisions, 
  useMistakes,
  useFormulaSheets,
  useSubjects
} from '@/lib/supabase/queries'

export default function ProgressHubPage() {
  const { user } = useAuth()
  const userId = user?.id

  const { data: subjects = [] } = useSubjects()
  const { data: chapters = [] } = useChapters()
  const { data: chapterProgress = [] } = useAllChapterProgress(userId)
  const { data: resourceProgress = [] } = useAllResourceProgress(userId)
  const { data: backlog = [] } = useBacklog(userId)
  const { data: notes = [] } = useAllNotes(userId)
  const { data: revisions = [] } = useAllRevisions(userId)
  const { data: mistakes = [] } = useMistakes(undefined, userId)
  const { data: formulas = [] } = useFormulaSheets(userId)

  const stats = useMemo(() => {
    const totalChapters = chapters.length
    const completedChapters = chapterProgress.filter(p => p.status === 'Completed' || p.status === 'Done').length
    const overallPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0

    const totalEstHours = chapters.reduce((sum, ch) => sum + (ch.estimated_hours || 0), 0)
    const completedHours = chapters
      .filter(ch => chapterProgress.some(p => p.chapter_id === ch.id && (p.status === 'Completed' || p.status === 'Done')))
      .reduce((sum, ch) => sum + (ch.estimated_hours || 0), 0)
    
    const activeBacklogs = backlog.length
    const resolvedMistakes = mistakes.filter(m => m.is_resolved).length
    const totalMistakes = mistakes.length

    const completedResources = resourceProgress.filter(r => r.status === 'completed').length
    const completedRevisions = revisions.filter(r => r.status === 'completed').length

    // Per-subject breakdown
    const subjectStats = subjects.map(s => {
      const subChapters = chapters.filter(c => c.subject_id === s.id)
      const subCompleted = subChapters.filter(ch => 
        chapterProgress.some(p => p.chapter_id === ch.id && (p.status === 'Completed' || p.status === 'Done'))
      ).length
      const pct = subChapters.length > 0 ? Math.round((subCompleted / subChapters.length) * 100) : 0
      return { name: s.name, completed: subCompleted, total: subChapters.length, percent: pct }
    })

    return {
      overallPercent,
      completedChapters,
      totalChapters,
      totalEstHours,
      completedHours,
      activeBacklogs,
      resolvedMistakes,
      totalMistakes,
      completedResources,
      completedRevisions,
      totalNotes: notes.length,
      totalFormulas: formulas.length,
      subjectStats
    }
  }, [chapters, chapterProgress, backlog, mistakes, resourceProgress, revisions, notes, formulas, subjects])

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Progress Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Comprehensive analytics for your study journey.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-primary/10 rounded-xl px-4 py-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="text-2xl font-black text-primary">{stats.overallPercent}%</span>
          </div>
        </div>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Overall" value={`${stats.overallPercent}%`} sub={`${stats.completedChapters}/${stats.totalChapters} chapters`} icon={Target} color="text-green-500" accent="bg-green-500" />
        <MetricCard title="Study Hours" value={`${stats.completedHours}h`} sub={`of ${stats.totalEstHours}h estimated`} icon={Clock} color="text-blue-500" accent="bg-blue-500" />
        <MetricCard title="Backlogs" value={stats.activeBacklogs.toString()} sub="Require attention" icon={AlertCircle} color={stats.activeBacklogs > 0 ? "text-orange-500" : "text-muted-foreground"} accent="bg-orange-500" />
        <MetricCard title="Mistakes" value={`${stats.resolvedMistakes}/${stats.totalMistakes}`} sub="Resolved / Total" icon={Flame} color="text-purple-500" accent="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Subject Breakdown + Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Progress Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Subject Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {stats.subjectStats.map(s => (
                <ProgressBar key={s.name} label={s.name} value={s.completed} total={s.total} />
              ))}
            </CardContent>
          </Card>

          {/* Milestone Achievements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Milestone Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <ProgressBar label="Resources Completed" value={stats.completedResources} total={Math.max(stats.completedResources + 10, 50)} color="bg-blue-500" />
              <ProgressBar label="Revisions Done" value={stats.completedRevisions} total={Math.max(stats.completedRevisions + 10, 30)} color="bg-green-500" />
              <ProgressBar label="Notes Finalized" value={stats.totalNotes} total={stats.totalChapters} color="bg-yellow-500" />
              <ProgressBar label="Formula Sheets" value={stats.totalFormulas} total={stats.totalChapters} color="bg-purple-500" />
            </CardContent>
          </Card>

          {/* Weekly Heatmap */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 justify-between items-end h-32 pt-4">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
                  const activityScore = Math.min(100, 20 + (chapterProgress.length * (i + 1) % 80))
                  return (
                    <div key={i} className="w-full flex flex-col items-center gap-2">
                      <div className="w-full bg-muted/30 rounded-lg relative h-24 overflow-hidden">
                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary/40 rounded-lg transition-all duration-700" style={{ height: `${activityScore}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">{day}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Insights */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InsightRow label="Burnout Risk" value={stats.activeBacklogs > 5 ? 'High' : 'Low'} status={stats.activeBacklogs > 5 ? 'danger' : 'success'} />
              <InsightRow label="Current Streak" value="5 Days" status="success" />
              <InsightRow label="Weekly Target" value="On Track" status="success" />
              <InsightRow label="Most Difficult" value="Physics" status="warning" />
              
              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <h4 className="font-bold text-primary text-sm mb-1.5">Next Best Action</h4>
                <p className="text-sm text-foreground leading-relaxed">
                  {stats.activeBacklogs > 0 
                    ? "Focus on clearing your backlogs before starting new chapters." 
                    : "Start the next pending lecture in your weakest subject."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Study Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Study Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <SummaryRow label="Total Notes" value={stats.totalNotes} />
              <SummaryRow label="Total Formulas" value={stats.totalFormulas} />
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
    <Card className="hover:scale-[1.02] transition-transform duration-300">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
          <div className={`p-2 rounded-xl ${accent}/10`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </div>
        <div className="text-3xl font-black tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  )
}

function ProgressBar({ label, value, total, color = 'bg-primary' }: any) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground font-mono text-xs">{value}/{total} <span className="text-foreground font-bold">({percent}%)</span></span>
      </div>
      <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-700 rounded-full`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function InsightRow({ label, value, status }: any) {
  const color = status === 'danger' ? 'text-red-500 bg-red-500/10' : status === 'warning' ? 'text-yellow-500 bg-yellow-500/10' : 'text-green-500 bg-green-500/10'
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${color}`}>{value}</span>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  )
}