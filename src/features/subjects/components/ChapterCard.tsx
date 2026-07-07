import { Link } from 'react-router-dom'
import { BookOpen, AlertTriangle, FileText, CheckCircle2, PenTool, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isChapterDone, chapterWorkflowPercent } from '@/lib/progress'
import type { 
  Chapter, ChapterProgress, ResourceProgress, Note, 
  Mistake, FormulaSheet, Revision, RoadmapPhase, RoadmapMonth 
} from '@/lib/supabase/types'

interface ChapterCardProps {
  chapter: Chapter
  progress?: ChapterProgress
  resources: (ResourceProgress & { resources: { name: string } | null })[]
  notes: Note[]
  mistakes: Mistake[]
  formulaSheets: FormulaSheet[]
  revisions: Revision[]
  phases: RoadmapPhase[]
  months: RoadmapMonth[]
}

export function ChapterCard({
  chapter, progress, resources, notes, mistakes, formulaSheets, revisions, phases, months
}: ChapterCardProps) {
  const currentPhase = phases.find(p => p.id === chapter.phase)
  const currentMonth = months.find(m => m.id === chapter.month)


  const isCompleted = isChapterDone(progress?.status)
  const completionPercent = chapterWorkflowPercent(progress?.status)
  const hasNotes = notes.some(n => n.chapter_id === chapter.id && n.content && n.content.trim().length > 0)
  const activeMistakes = mistakes.filter(m => m.chapter_id === chapter.id && !m.is_resolved)
  const hasFormula = formulaSheets.some(f => f.chapter_id === chapter.id)

  const revisionDays = [1, 3, 7, 21, 45]
  
  return (
    <Card className={`relative overflow-hidden transition-all ${isCompleted ? 'border-green-500/30 bg-green-500/5' : 'hover:border-primary/50'}`}>
      
      <CardHeader className="pb-3 flex flex-row justify-between items-start">
        <div className="space-y-1 pl-2">
          <CardTitle className="text-lg">
            <Link to={`/chapters/${chapter.id}`} className="hover:underline hover:text-primary transition-colors">
              {chapter.name}
            </Link>
          </CardTitle>
          <div className="flex flex-wrap gap-2 text-xs">
            {currentPhase && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {currentPhase.name}
              </span>
            )}
            {currentMonth && (
              <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
                {currentMonth.name}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full font-medium ${
              chapter.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
              chapter.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 
              'bg-blue-500/10 text-blue-500'
            }`}>
              {chapter.priority.toUpperCase()} PRIORITY
            </span>
            <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
              {chapter.difficulty.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mr-2">
            {completionPercent}%
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-foreground">
              {chapter.estimated_hours}h
            </div>
            <div className="text-xs text-muted-foreground">Est. Time</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5 pl-8 pr-4">
        {/* Status & Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground block">Workflow Stage</span>
            <span className="text-sm font-semibold text-foreground bg-background px-2 py-1 rounded border">
              {progress?.status || 'Not Started'}
            </span>
          </div>
          
          <div className="flex gap-3">
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${hasNotes ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground opacity-50'}`}>
              <FileText className="h-3.5 w-3.5" /> Notes
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${activeMistakes.length > 0 ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground opacity-50'}`}>
              <AlertTriangle className="h-3.5 w-3.5" /> {activeMistakes.length > 0 ? `${activeMistakes.length} Mistakes` : 'Mistakes'}
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${hasFormula ? 'bg-purple-500/10 text-purple-500' : 'bg-muted text-muted-foreground opacity-50'}`}>
              <BookOpen className="h-3.5 w-3.5" /> Formula
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Resources</span>
          <div className="flex flex-wrap gap-2">
            {resources.length === 0 ? (
              <span className="text-xs text-muted-foreground">No resources tracked yet.</span>
            ) : (
              resources.map(res => (
                <div key={res.id} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border ${
                  res.status === 'completed' ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400' :
                  res.status === 'in_progress' ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                  'border-border bg-muted/30 text-muted-foreground'
                }`}>
                  {res.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : 
                   res.status === 'in_progress' ? <PenTool className="h-3 w-3" /> : 
                   <Circle className="h-3 w-3" />}
                  {res.resources?.name || 'Unknown'}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Revisions */}
        <div className="space-y-2 border-t border-border/50 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Spaced Repetition</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {revisionDays.map(day => {
              const rev = revisions.find(r => r.chapter_id === chapter.id && r.revision_day === day)
              const isRevDone = rev?.status === 'completed'
              return (
                <div key={day} className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${
                  isRevDone ? 'border-green-500/30 bg-green-500/10 text-green-600' : 'border-border bg-muted/50 text-muted-foreground'
                }`}>
                  {isRevDone ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                  Day {day}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}