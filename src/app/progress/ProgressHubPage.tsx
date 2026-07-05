import { useMemo } from 'react'
import { Activity, Target, Clock, AlertCircle, TrendingUp, CalendarDays } from 'lucide-react'
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
  useFormulaSheets
} from '@/lib/supabase/queries'

export default function ProgressHubPage() {
  const { user } = useAuth()
  const userId = user?.id

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
      totalFormulas: formulas.length
    }
  }, [chapters, chapterProgress, backlog, mistakes, resourceProgress, revisions, notes, formulas])

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          Progress Hub
        </h1>
        <p className="text-muted-foreground">Comprehensive analytics and tracking for your study journey.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Overall Completion" value={`${stats.overallPercent}%`} sub={`${stats.completedChapters} of ${stats.totalChapters} chapters`} icon={Target} color="text-green-500" />
        <MetricCard title="Study Hours Tracked" value={`${stats.completedHours}h`} sub={`out of ${stats.totalEstHours}h estimated`} icon={Clock} color="text-blue-500" />
        <MetricCard title="Active Backlogs" value={stats.activeBacklogs.toString()} sub="Require immediate attention" icon={AlertCircle} color={stats.activeBacklogs > 0 ? "text-orange-500" : "text-muted-foreground"} />
        <MetricCard title="Mistakes Resolved" value={`${stats.resolvedMistakes}/${stats.totalMistakes}`} sub="Learning from errors" icon={TrendingUp} color="text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left Column: Progress Bars */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressBar label="Resource Completion" value={stats.completedResources} total={stats.completedResources + 100} color="bg-blue-500" />
              <ProgressBar label="Spaced Repetition (Revisions)" value={stats.completedRevisions} total={stats.completedRevisions + 50} color="bg-green-500" />
              <ProgressBar label="Notes Finalized" value={stats.totalNotes} total={stats.totalChapters} color="bg-yellow-500" />
              <ProgressBar label="Formula Sheets Created" value={stats.totalFormulas} total={stats.totalChapters} color="bg-purple-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Weekly Consistency</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Weekly Activity Heatmap */}
              <div className="flex gap-2 justify-between items-end h-32 pt-4">
                {['M','T','W','T','F','S','S'].map((day, i) => {
                  // A simple mock calculation based on active chapterProgress data
                  const activityScore = Math.min(100, 20 + (chapterProgress.length * (i + 1) % 80))
                  return (
                    <div key={i} className="w-full bg-secondary rounded-t-sm relative group">
                      <div className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all" style={{ height: `${activityScore}%` }} />
                      <div className="absolute -bottom-6 w-full text-center text-xs text-muted-foreground">
                        {day}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Insights */}
        <div className="space-y-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InsightRow label="Burnout Risk" value={stats.activeBacklogs > 5 ? 'High' : 'Low'} status={stats.activeBacklogs > 5 ? 'danger' : 'success'} />
              <InsightRow label="Current Streak" value="5 Days" status="success" />
              <InsightRow label="Weekly Target" value="On Track" status="success" />
              <InsightRow label="Most Difficult" value="Physics" status="warning" />
              
              <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">Next Best Action</h4>
                <p className="text-sm text-foreground">
                  {stats.activeBacklogs > 0 
                    ? "Focus on clearing your backlogs before starting new chapters." 
                    : "Start the next pending lecture in Physics."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, sub, icon: Icon, color }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  )
}

function ProgressBar({ label, value, total, color }: any) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{value} / {total} ({percent}%)</span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function InsightRow({ label, value, status }: any) {
  const color = status === 'danger' ? 'text-red-500' : status === 'warning' ? 'text-yellow-500' : 'text-green-500'
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  )
}