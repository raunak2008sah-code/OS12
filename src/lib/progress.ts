import type { Chapter, ChapterProgress, Note, FormulaSheet, Mistake, Comment, Subject } from '@/lib/supabase/types'

/**
 * Canonical workflow stages for OS12.
 * This is the SINGLE SOURCE OF TRUTH for stage definitions.
 * Every progress calculation in the app MUST use this array.
 */
export const WORKFLOW_STAGES = [
  'Lecture Pending',
  'NCERT Complete',
  'WINR Complete',
  'HC Verma / Module Complete',
  'PYQ Complete',
  'Revision 1 Done',
  'Notes Finalized',
  'Mock Test 1 Complete',
  'Mock Test 2 Complete',
  'Done'
] as const

export type WorkflowStage = typeof WORKFLOW_STAGES[number]

/**
 * Returns the 0-based index of a workflow stage.
 * Returns 0 for unknown/missing statuses (treated as 'Lecture Pending').
 */
export function getStageIndex(status: string | undefined | null): number {
  if (!status) return 0
  const idx = WORKFLOW_STAGES.indexOf(status as WorkflowStage)
  return idx === -1 ? 0 : idx
}

/**
 * Returns the completed steps for a chapter based on its status.
 * - 'Lecture Pending' or undefined = 0 steps completed
 * - 'NCERT Complete' = 1 step completed
 * - 'WINR Complete' = 2 steps completed
 * ...
 * - 'Mock Test 2 Complete' = 8 steps completed
 * - 'Done' = 10 steps completed
 */
export function getCompletedSteps(status: string | undefined | null): number {
  if (!status) return 0
  if (status === 'Done') return 10
  const idx = WORKFLOW_STAGES.indexOf(status as any)
  return idx === -1 ? 0 : idx
}

/**
 * Returns whether a chapter is fully completed (reached 'Done').
 */
export function isChapterDone(status: string | undefined | null): boolean {
  return status === 'Done'
}

/**
 * Compute the workflow completion percentage for a SINGLE chapter.
 * 'Lecture Pending' = 0%
 * 'NCERT Complete' = 10%
 * ...
 * 'Mock Test 2 Complete' = 80%
 * 'Done' = 100%
 */
export function chapterWorkflowPercent(status: string | undefined | null): number {
  return getCompletedSteps(status) * 10
}

/**
 * Compute weighted subject progress across all chapters.
 *
 * Formula:
 *   overallProgress = completedWorkflowSteps / totalWorkflowSteps * 100
 */
export function subjectProgress(
  chapterIds: string[],
  progress: { chapter_id: string; status: string }[]
): number {
  if (chapterIds.length === 0) return 0
  const totalWorkflowSteps = chapterIds.length * 10
  let completedWorkflowSteps = 0
  for (const chapterId of chapterIds) {
    const p = progress.find(pr => pr.chapter_id === chapterId)
    completedWorkflowSteps += getCompletedSteps(p?.status)
  }
  return Math.round((completedWorkflowSteps / totalWorkflowSteps) * 100)
}

/**
 * Select the most recently interacted incomplete chapter.
 * Priority:
 * 1. Last workflow stage updated (completed_at)
 * 2. Last note edited (updated_at)
 * 3. Last formula updated (updated_at)
 * 4. Last mistake added (created_at)
 * 5. Last comment (created_at)
 * 6. First incomplete chapter
 */
export function getCurrentChapter(
  chapters: Chapter[],
  progress: ChapterProgress[],
  notes: Note[],
  formulas: FormulaSheet[],
  mistakes: Mistake[],
  comments: Comment[],
  subjects: Subject[]
): { chapter: Chapter; subject: Subject | undefined; status: string; nextStep: string } | null {
  if (chapters.length === 0) return null

  // Filter for incomplete chapters (status !== 'Done')
  const incompleteChapters = chapters.filter(c => {
    const p = progress.find(pr => pr.chapter_id === c.id)
    return !p || p.status !== 'Done'
  })

  if (incompleteChapters.length === 0) {
    return null
  }

  const chaptersWithInteractions = incompleteChapters.map(ch => {
    const chProgress = progress.find(p => p.chapter_id === ch.id)
    const chNote = notes.find(n => n.chapter_id === ch.id)
    const chFormula = formulas.find(f => f.chapter_id === ch.id)
    const chMistakes = mistakes.filter(m => m.chapter_id === ch.id)
    const chComments = comments.filter(cm => cm.chapter_id === ch.id)

    // Interaction timestamps (ms since epoch)
    const pTime = chProgress?.completed_at ? new Date(chProgress.completed_at).getTime() : 0
    const nTime = (chNote?.content && chNote.content.trim().length > 0 && chNote.updated_at) ? new Date(chNote.updated_at).getTime() : 0
    const fTime = chFormula?.updated_at ? new Date(chFormula.updated_at).getTime() : 0
    const mTime = chMistakes.length > 0 ? Math.max(...chMistakes.map(m => new Date(m.created_at).getTime())) : 0
    const cTime = chComments.length > 0 ? Math.max(...chComments.map(c => new Date(c.created_at).getTime())) : 0

    // Find the absolute maximum interaction time across the 5 categories
    const times = [
      { type: 1, time: pTime },
      { type: 2, time: nTime },
      { type: 3, time: fTime },
      { type: 4, time: mTime },
      { type: 5, time: cTime }
    ]

    const maxInteraction = times.reduce((max, curr) => curr.time > max.time ? curr : max, { type: 6, time: 0 })

    return {
      chapter: ch,
      maxTime: maxInteraction.time
    }
  })

  // Sort: most recently interacted first, fallback to first incomplete chapter (by order_index)
  const sorted = chaptersWithInteractions.sort((a, b) => {
    if (b.maxTime !== a.maxTime) {
      return b.maxTime - a.maxTime
    }
    return (a.chapter.order_index || 999) - (b.chapter.order_index || 999)
  })

  const current = sorted[0]
  if (!current) return null

  const chProgress = progress.find(p => p.chapter_id === current.chapter.id)
  const status = chProgress?.status || 'Lecture Pending'
  
  const idx = WORKFLOW_STAGES.indexOf(status as any)
  const nextStep = (idx === -1 || idx >= WORKFLOW_STAGES.length - 1) ? 'Done' : WORKFLOW_STAGES[idx + 1]

  return {
    chapter: current.chapter,
    subject: subjects.find(s => s.id === current.chapter.subject_id),
    status,
    nextStep
  }
}

/**
 * Real Study Streak calculator.
 * Group all timestamps by YYYY-MM-DD and check consecutive days.
 */
export function calculateStudyStreak(timestamps: string[]): number {
  if (timestamps.length === 0) return 0
  
  const activeDates = new Set<string>()
  for (const ts of timestamps) {
    if (!ts) continue
    const d = new Date(ts)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    activeDates.add(`${yyyy}-${mm}-${dd}`)
  }
  
  const sortedDates = Array.from(activeDates).sort((a, b) => b.localeCompare(a))
  if (sortedDates.length === 0) return 0
  
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const todayStr = `${yyyy}-${mm}-${dd}`
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const y_yyyy = yesterday.getFullYear()
  const y_mm = String(yesterday.getMonth() + 1).padStart(2, '0')
  const y_dd = String(yesterday.getDate()).padStart(2, '0')
  const yesterdayStr = `${y_yyyy}-${y_mm}-${y_dd}`
  
  const latestActiveDate = sortedDates[0]
  if (latestActiveDate !== todayStr && latestActiveDate !== yesterdayStr) {
    return 0
  }
  
  let streak = 0
  let checkDate = new Date(latestActiveDate)
  
  while (true) {
    const c_yyyy = checkDate.getFullYear()
    const c_mm = String(checkDate.getMonth() + 1).padStart(2, '0')
    const c_dd = String(checkDate.getDate()).padStart(2, '0')
    const checkStr = `${c_yyyy}-${c_mm}-${c_dd}`
    
    if (activeDates.has(checkStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return streak
}

/**
 * Format timestamp as relative time
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (diffMs < 0) return 'Just now'
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays}d ago`
}
