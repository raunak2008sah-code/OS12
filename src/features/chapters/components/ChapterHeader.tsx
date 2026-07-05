import { Link } from 'react-router-dom'
import { ChevronLeft, Clock, Activity, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="space-y-4">
      <Link to={`/subjects/${subject.id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to {subject.name}
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{chapter.name}</h1>
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
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{subject.name}</span>
            <span>•</span>
            {phase && (
              <>
                <span className="text-primary font-medium">{phase.name} Phase</span>
                <span>•</span>
              </>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              chapter.priority === 'high' ? 'bg-red-500/10 text-red-500' :
              chapter.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
              'bg-blue-500/10 text-blue-500'
            }`}>
              {chapter.priority.toUpperCase()} PRIORITY
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              {chapter.difficulty.toUpperCase()}
            </span>
          </div>
        </div>

        <Card className="shrink-0 w-full md:w-auto min-w-[250px]">
          <CardContent className="p-4 flex gap-6 justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <Clock className="h-3.5 w-3.5" /> Est. Time
              </div>
              <div className="text-xl font-bold text-foreground">{chapter.estimated_hours}h</div>
            </div>
            
            <div className="w-px h-10 bg-border" />
            
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <Activity className="h-3.5 w-3.5" /> Progress
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-foreground">{completionPercent}%</div>
                <div className="h-2 w-16 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${completionPercent}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
