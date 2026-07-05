import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useChapters, useAllChapterProgress, useSubjects } from '@/lib/supabase/queries'
import { useAuth } from '@/hooks/useAuth'

/**
 * Section 12 — Chapter Status System (10 stages)
 *
 * ⬜ Lecture Pending
 * 🟨 Lecture Completed
 * 🟨 Notes Completed
 * 🟨 NCERT Completed
 * 🟨 WINR Completed
 * 🟨 Board PYQs Done
 * 🟨 JEE PYQs Done
 * ⬛ H.C. Verma Done (Physics only)
 * ⭐ Mixed Test Done
 * ✅ Fully Completed
 */
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

    // Find the first in-progress chapter (has progress but not completed)
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

    // Otherwise find the first chapter with no progress at all
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Today&apos;s Focus
        </CardTitle>
      </CardHeader>
      <CardContent>
        {focusChapter ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {focusChapter.subject?.name ?? 'Unknown Subject'}
              </p>
              <Link
                to={`/chapters/${focusChapter.chapter.id}`}
                className="text-lg font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 mt-1"
              >
                {focusChapter.chapter.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Workflow Progress</p>
              <div className="space-y-1.5">
                {WORKFLOW_STEPS.slice(0, focusChapter.chapter.subject_id && subjects.find(s => s.id === focusChapter.chapter.subject_id)?.name !== 'Physics' ? -2 : undefined).map((step) => {
                  const currentIdx = WORKFLOW_STEPS.indexOf(focusChapter.status as typeof WORKFLOW_STEPS[number])
                  const stepIdx = WORKFLOW_STEPS.indexOf(step)
                  const isDone = stepIdx <= currentIdx && currentIdx >= 0
                  const isCurrent = stepIdx === currentIdx + 1

                  return (
                    <div key={step} className={`flex items-center gap-2 text-xs ${isCurrent ? 'text-primary font-semibold' : isDone ? 'text-muted-foreground line-through' : 'text-muted-foreground/60'}`}>
                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      ) : (
                        <Circle className={`h-3.5 w-3.5 shrink-0 ${isCurrent ? 'text-primary' : ''}`} />
                      )}
                      {step}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
            <p className="font-medium text-foreground">All caught up!</p>
            <p className="text-sm text-muted-foreground mt-1">
              No chapters are currently in progress.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}