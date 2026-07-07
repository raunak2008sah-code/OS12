import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Circle, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  useChapters, 
  useAllChapterProgress, 
  useSubjects,
  useAllNotes,
  useAllResourceProgress,
  useAllRevisions
} from '@/lib/supabase/queries'
import { useAuth } from '@/hooks/useAuth'
import { getCurrentChapter } from '@/lib/progress'

export function TodaysFocus() {
  const { user } = useAuth()
  const { data: chapters = [] } = useChapters()
  const { data: progress = [] } = useAllChapterProgress(user?.id)
  const { data: subjects = [] } = useSubjects()
  const { data: notes = [] } = useAllNotes(user?.id)
  const { data: resources = [] } = useAllResourceProgress(user?.id)
  const { data: revisions = [] } = useAllRevisions(user?.id)

  const focusChapter = useMemo(() => {
    return getCurrentChapter(chapters, progress, notes, resources, revisions, subjects)
  }, [chapters, progress, notes, resources, revisions, subjects])

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <div className="bg-primary/5 px-6 py-4 border-b border-border/50 flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground tracking-tight">Today&apos;s Focus</h2>
      </div>
      <CardContent className="p-4 sm:p-5">
        {focusChapter ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {focusChapter.subject?.name ?? 'Unknown Subject'}
              </p>
              <Link
                to={`/chapters/${focusChapter.chapter.id}`}
                className="text-2xl font-bold tracking-tight text-foreground hover:text-primary transition-colors inline-block"
              >
                {focusChapter.chapter.name}
              </Link>
            </div>

            <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border/50">
              {focusChapter.status && (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-muted-foreground line-through">{focusChapter.status}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </>
              )}
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-primary">{focusChapter.nextStep}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-foreground">All caught up.</p>
            <p className="text-sm text-muted-foreground mt-1">No active chapters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}