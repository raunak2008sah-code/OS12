import { Link } from 'react-router-dom'
import { BookOpen, AlertCircle, Clock, ChevronRight, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Subject, Chapter, ChapterProgress, Backlog } from '@/lib/supabase/types'

interface SubjectCardProps {
  subject: Subject
  chapters: Chapter[]
  progress: ChapterProgress[]
  backlog: Backlog[]
}

export function SubjectCard({ subject, chapters, progress, backlog }: SubjectCardProps) {
  const totalChapters = chapters.length
  const completedChapters = chapters.filter(ch => {
    const p = progress.find(pr => pr.chapter_id === ch.id)
    return p?.status === 'Completed' || p?.status === 'Done'
  }).length
  
  const completionPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0
  
  const estimatedHours = chapters.reduce((acc, curr) => acc + (curr.estimated_hours || 0), 0)
  const completedHours = chapters
    .filter(ch => {
      const p = progress.find(pr => pr.chapter_id === ch.id)
      return p?.status === 'Completed' || p?.status === 'Done'
    })
    .reduce((acc, curr) => acc + (curr.estimated_hours || 0), 0)
  const remainingHours = estimatedHours - completedHours
  
  const activeBacklog = backlog.filter(b => 
    chapters.some(c => c.id === b.chapter_id)
  )

  // Find the "current" chapter (first non-completed)
  const currentChapter = chapters.find(ch => {
    const p = progress.find(pr => pr.chapter_id === ch.id)
    return !p || (p.status !== 'Completed' && p.status !== 'Done')
  })

  // Weakness indicator
  const hardChapters = chapters.filter(c => c.difficulty === 'hard')
  const hardIncomplete = hardChapters.filter(ch => {
    const p = progress.find(pr => pr.chapter_id === ch.id)
    return !p || (p.status !== 'Completed' && p.status !== 'Done')
  })
  const weaknessLevel = hardIncomplete.length > 2 ? 'High' : hardIncomplete.length > 0 ? 'Medium' : 'Low'

  return (
    <Link to={`/subjects/${subject.id}`}>
      <Card className="group hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer h-full overflow-hidden relative">
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardContent className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{subject.name}</h3>
                <p className="text-xs text-muted-foreground">{totalChapters} chapters</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Progress</span>
              <span className="font-bold text-foreground">{completionPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700 ease-out rounded-full" 
                style={{ width: `${completionPercent}%` }} 
              />
            </div>
            <div className="text-xs text-muted-foreground text-right">
              {completedChapters} of {totalChapters} completed
            </div>
          </div>

          {/* Current Chapter */}
          {currentChapter && (
            <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Current Chapter</p>
              <p className="text-sm font-medium text-foreground truncate">{currentChapter.name}</p>
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">{remainingHours}h remaining</span>
            </div>
            
            {activeBacklog.length > 0 && (
              <div className="flex items-center gap-1 font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                <AlertCircle className="h-3 w-3" />
                {activeBacklog.length}
              </div>
            )}

            {weaknessLevel !== 'Low' && (
              <div className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-xs ${
                weaknessLevel === 'High' ? 'text-red-500 bg-red-500/10' : 'text-yellow-500 bg-yellow-500/10'
              }`}>
                <TrendingUp className="h-3 w-3" />
                {weaknessLevel}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}