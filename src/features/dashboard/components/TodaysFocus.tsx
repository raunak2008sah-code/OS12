import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react'
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
    <div className="py-8">
      {focusChapter ? (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              {focusChapter.subject?.name ?? 'Unknown Subject'}
            </p>
            <Link
              to={`/chapters/${focusChapter.chapter.id}`}
              className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground hover:text-primary transition-colors inline-block"
            >
              {focusChapter.chapter.name}
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary w-fit">
              <Circle className="h-4 w-4 fill-primary" />
              <span className="text-sm font-semibold">{focusChapter.status}</span>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 text-muted-foreground w-fit">
              <Circle className="h-4 w-4" />
              <span className="text-sm font-medium">{focusChapter.nextStep}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">All caught up.</h2>
          <p className="text-muted-foreground text-lg">
            No chapters are currently in progress. Enjoy the calm.
          </p>
        </div>
      )}
    </div>
  )
}