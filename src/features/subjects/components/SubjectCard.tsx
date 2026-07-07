import { Link } from 'react-router-dom'
import { BookOpen, Clock, ChevronRight, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Subject, Chapter, ChapterProgress } from '@/lib/supabase/types'
import { subjectProgress, isChapterDone, getCurrentChapter } from '@/lib/progress'
import { useAuth } from '@/hooks/useAuth'
import { useAllNotes, useFormulaSheets, useMistakes, useAllComments } from '@/lib/supabase/queries'

interface SubjectCardProps {
  subject: Subject
  chapters: Chapter[]
  progress: ChapterProgress[]
}

export function SubjectCard({ subject, chapters, progress }: SubjectCardProps) {
  const { user } = useAuth()
  const { data: notes = [] } = useAllNotes(user?.id)
  const { data: formulas = [] } = useFormulaSheets(user?.id)
  const { data: mistakes = [] } = useMistakes(undefined, user?.id)
  const { data: comments = [] } = useAllComments(user?.id)

  const totalChapters = chapters.length
  const chapterIds = chapters.map(ch => ch.id)
  const completionPercent = subjectProgress(chapterIds, progress)
  
  const estimatedHours = chapters.reduce((acc, curr) => acc + (curr.estimated_hours || 0), 0)
  const completedHours = chapters
    .filter(ch => {
      const p = progress.find(pr => pr.chapter_id === ch.id)
      return isChapterDone(p?.status)
    })
    .reduce((acc, curr) => acc + (curr.estimated_hours || 0), 0)
  const remainingHours = estimatedHours - completedHours
  


  // Find the "current" chapter (most recently interacted incomplete chapter)
  const currentChapterInfo = getCurrentChapter(chapters, progress, notes, formulas, mistakes, comments, [subject])
  const currentChapter = currentChapterInfo?.chapter || null

  // Weakness indicator
  const hardChapters = chapters.filter(c => c.difficulty === 'hard')
  const hardIncomplete = hardChapters.filter(ch => {
    const p = progress.find(pr => pr.chapter_id === ch.id)
    return !p || !isChapterDone(p.status)
  })
  const weaknessLevel = hardIncomplete.length > 2 ? 'High' : hardIncomplete.length > 0 ? 'Medium' : 'Low'

  return (
    <Link to={`/subjects/${subject.id}`}>
      <Card className="group hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer h-full overflow-hidden relative">
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{subject.name}</h3>
                <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">{totalChapters} chapters</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 mt-1" />
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Progress</span>
              <span className="font-bold text-foreground">{completionPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700 ease-out rounded-full" 
                style={{ width: `${completionPercent}%` }} 
              />
            </div>
          </div>

          {/* Current Chapter */}
          {currentChapter ? (
            <div className="bg-muted/30 rounded-lg px-3 py-2 border border-border/30 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider shrink-0">Current</span>
              <span className="text-xs font-medium text-foreground truncate ml-2">{currentChapter.name}</span>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg px-3 py-2 border border-border/30">
              <span className="text-xs font-medium text-muted-foreground">All caught up!</span>
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30 text-[10px]">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="font-medium">{remainingHours}h remaining</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              {weaknessLevel !== 'Low' && (
                <div className={`flex items-center gap-1 font-bold px-1.5 py-0.5 rounded-md ${
                  weaknessLevel === 'High' ? 'text-red-500 bg-red-500/10' : 'text-yellow-500 bg-yellow-500/10'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  {weaknessLevel}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}