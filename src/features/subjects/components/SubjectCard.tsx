import { Link } from 'react-router-dom'
import { Book, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  
  const activeBacklog = backlog.filter(b => 
    chapters.some(c => c.id === b.chapter_id)
  )

  return (
    <Link to={`/subjects/${subject.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-xl">
            <span className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              {subject.name}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completionPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out" 
                style={{ width: `${completionPercent}%` }} 
              />
            </div>
            <div className="text-xs text-muted-foreground text-right">
              {completedChapters} of {totalChapters} Chapters
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {estimatedHours}h Total
            </div>
            
            {activeBacklog.length > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                <AlertCircle className="h-3.5 w-3.5" />
                {activeBacklog.length} Backlog
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}