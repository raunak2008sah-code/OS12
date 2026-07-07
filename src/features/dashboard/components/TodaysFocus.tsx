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
    <Card className="group relative border-border/40 shadow-sm overflow-hidden hover:border-border/60 transition-all duration-[220ms] ease-out">
      {/* Subtle hover glow behind the card content */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors duration-[220ms] pointer-events-none" />
      
      <div className="bg-primary/[0.03] px-5 py-3 border-b border-border/40 flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <h2 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Today's Focus</h2>
      </div>
      <CardContent className="p-5">
        {focusChapter ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 z-10 relative">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {focusChapter.subject?.name ?? 'Unknown Subject'}
              </p>
              <Link
                to={`/chapters/${focusChapter.chapter.id}`}
                className="text-2xl font-bold tracking-tight text-foreground hover:text-primary transition-colors duration-[150ms] inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                {focusChapter.chapter.name}
              </Link>
            </div>

            <div className="flex items-center gap-3 bg-muted/20 px-4 py-2.5 rounded-lg border border-border/40 z-10 relative shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
              {focusChapter.status && (
                <>
                  <div className="flex items-center gap-2 opacity-60">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-[13px] font-medium line-through">{focusChapter.status}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                </>
              )}
              <div className="flex items-center gap-2 bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                <Circle className="h-3.5 w-3.5 text-primary fill-primary/20" />
                <span className="text-[13px] font-bold text-primary">{focusChapter.nextStep}</span>
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