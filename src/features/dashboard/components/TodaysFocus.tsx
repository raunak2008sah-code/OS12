import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Circle, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useChapters, useAllChapterProgress, useSubjects } from '@/lib/supabase/queries'
import { useAuth } from '@/hooks/useAuth'

const WORKFLOW_STEPS = [
  'Lecture Pending',
  'Lecture Completed',
  'Notes Completed',
  'NCERT Completed',
  'WINR Completed',
  'Board PYQs Done',
  'JEE PYQs Done',
  'H.C. Verma Done',
  'Mixed Test Done',
  'Fully Completed',
] as const

function getNextStep(status: string): string {
  const idx = WORKFLOW_STEPS.indexOf(status as typeof WORKFLOW_STEPS[number])
  if (idx === -1 || idx >= WORKFLOW_STEPS.length - 1) return 'Fully Completed'
  return WORKFLOW_STEPS[idx + 1]
}

export function TodaysFocus() {
  const { user } = useAuth()
  const { data: chapters = [] } = useChapters()
  const { data: progress = [] } = useAllChapterProgress(user?.id)
  const { data: subjects = [] } = useSubjects()

  const focusChapter = useMemo(() => {
    if (!chapters.length) return null

    const completedIds = new Set(
      progress.filter(p => p.status === 'Fully Completed' || p.status === 'Completed').map(p => p.chapter_id)
    )

    const inProgressEntries = progress.filter(
      p => p.status !== 'Fully Completed' && p.status !== 'Completed' && p.status !== 'Lecture Pending'
    )

    if (inProgressEntries.length > 0) {
      const entry = inProgressEntries[0]
      const chapter = chapters.find(c => c.id === entry.chapter_id)
      if (chapter) {
        const subject = subjects.find(s => s.id === chapter.subject_id)
        return {
          chapter,
          subject,
          status: entry.status,
          nextStep: getNextStep(entry.status),
        }
      }
    }

    const untouched = chapters.find(c => !completedIds.has(c.id) && !progress.some(p => p.chapter_id === c.id))
    if (untouched) {
      const subject = subjects.find(s => s.id === untouched.subject_id)
      return {
        chapter: untouched,
        subject,
        status: 'Lecture Pending',
        nextStep: 'Lecture Completed',
      }
    }

    return null
  }, [chapters, progress, subjects])

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <div className="bg-primary/5 px-6 py-4 border-b border-border/50 flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground tracking-tight">Today&apos;s Focus</h2>
      </div>
      <CardContent className="p-6">
        {focusChapter ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-muted-foreground line-through">{focusChapter.status}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
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