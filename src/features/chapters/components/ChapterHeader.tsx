import { Link } from 'react-router-dom'
import { ChevronRight, Clock, Activity, AlertCircle, Zap, BookOpen } from 'lucide-react'
import type { Chapter, Subject, ChapterProgress, RoadmapPhase, Backlog } from '@/lib/supabase/types'

interface ChapterHeaderProps {
  chapter: Chapter
  subject: Subject
  progress?: ChapterProgress
  phase?: RoadmapPhase
  backlog?: Backlog
  completionPercent: number
}

export function ChapterHeader({ chapter, subject, phase, backlog, completionPercent }: ChapterHeaderProps) {
  return (
    <div className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-xl border-b border-border/30 space-y-3">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/subjects" className="hover:text-foreground transition-colors">Subjects</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/subjects/${subject.id}`} className="hover:text-foreground transition-colors">{subject.name}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{chapter.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{chapter.name}</h1>
              {backlog && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                  backlog.escalation_level === 'red' ? 'bg-red-500/10 text-red-500' :
                  backlog.escalation_level === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                  'bg-yellow-500/10 text-yellow-500'
                }`}>
                  <AlertCircle className="h-3 w-3" /> BACKLOG
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
              {phase && (
                <span className="text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-lg text-xs">{phase.name}</span>
              )}
              <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                chapter.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                chapter.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                {chapter.priority.toUpperCase()}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-muted text-muted-foreground">
                {chapter.difficulty.toUpperCase()}
              </span>
              {chapter.jee_weight !== 'none' && (
                <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-500 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> JEE {chapter.jee_weight.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-4 py-2.5 shadow-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Est. Time</p>
              <p className="text-lg font-bold text-foreground leading-none">{chapter.estimated_hours}h</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-4 py-2.5 shadow-sm">
            <Activity className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Progress</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-foreground leading-none">{completionPercent}%</p>
                <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${completionPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
