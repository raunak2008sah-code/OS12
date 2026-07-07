import type { Chapter, ChapterProgress, Note, Subject, ResourceProgress, Revision } from '@/lib/supabase/types'
import { getSubjectConfig, getWorkflowForChapter } from '@/lib/subjectProfiles'

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
 * Returns whether a chapter is fully completed (reached 'Done').
 */
export function isChapterDone(status: string | undefined | null): boolean {
  return status === 'Done'
}

// ---------------------------------------------------------------------------
// Dynamic (subject-aware) progress helpers
// ---------------------------------------------------------------------------

/**
 * Returns the completed steps for a chapter against a specific workflow.
 */
export function getCompletedStepsForWorkflow(status: string | undefined | null, stages: string[]): number {
  if (!status) return 0
  if (status === 'Done') return stages.length
  const idx = stages.indexOf(status)
  return idx === -1 ? 0 : idx
}

/**
 * Compute the workflow completion percentage for a SINGLE chapter
 * against a specific set of workflow stages.
 */
export function chapterWorkflowPercentDynamic(status: string | undefined | null, stages: string[]): number {
  return Math.round((getCompletedStepsForWorkflow(status, stages) / stages.length) * 100)
}

/**
 * Compute subject progress where each chapter may have a different
 * number of workflow stages (e.g. Chemistry categories).
 * This is the canonical subject progress calculation.
 */
export function calculateSubjectProgress(
  subjectId: string,
  chapters: Chapter[],
  progress: { chapter_id: string; status: string }[],
  subjects: Subject[]
): number {
  const subjectChapters = chapters.filter(c => c.subject_id === subjectId)
  if (subjectChapters.length === 0) return 0

  let totalSteps = 0
  let completedSteps = 0
  const subject = subjects.find(s => s.id === subjectId)
  const config = getSubjectConfig(subject?.slug)

  for (const ch of subjectChapters) {
    const stages = getWorkflowForChapter(config, ch.name)
    totalSteps += stages.length
    const p = progress.find(pr => pr.chapter_id === ch.id)
    completedSteps += getCompletedStepsForWorkflow(p?.status, stages)
  }
  return totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100)
}

/**
 * Compute overall progress across ALL subjects.
 * Formula: total completed workflow steps / total workflow steps * 100
 */
export function calculateOverallProgress(
  chapters: Chapter[],
  progress: { chapter_id: string; status: string }[],
  subjects: Subject[]
): number {
  if (chapters.length === 0) return 0
  let totalSteps = 0
  let completedSteps = 0
  
  for (const ch of chapters) {
    const subject = subjects.find(s => s.id === ch.subject_id)
    const config = getSubjectConfig(subject?.slug)
    const stages = getWorkflowForChapter(config, ch.name)
    totalSteps += stages.length
    const p = progress.find(pr => pr.chapter_id === ch.id)
    completedSteps += getCompletedStepsForWorkflow(p?.status, stages)
  }
  return totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100)
}

/**
 * Select the most recently interacted incomplete chapter.
 * Priority:
 * 1. Workflow stage updated (completed_at)
 * 2. Resource update (completed_at)
 * 3. Note edit (updated_at)
 * 4. Formula updated (updated_at)
 * 5. Mistake added (created_at)
 * 6. Comment added (created_at)
 * 7. Revision completed (completed_at)
 * 8. Fallback to first incomplete chapter by order_index
 */
export function getCurrentChapter(
  chapters: Chapter[],
  progress: ChapterProgress[],
  notes: Note[],
  resources: ResourceProgress[],
  revisions: Revision[],
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
    const chResources = resources.filter(r => r.chapter_id === ch.id)
    const chRevisions = revisions.filter(r => r.chapter_id === ch.id)

    // Interaction timestamps (ms since epoch)
    const pTime = chProgress?.completed_at ? new Date(chProgress.completed_at).getTime() : 0
    const resTime = chResources.length > 0 ? Math.max(...chResources.map(r => r.completed_at ? new Date(r.completed_at).getTime() : 0)) : 0
    const nTime = (chNote?.content && chNote.content.trim().length > 0 && chNote.updated_at) ? new Date(chNote.updated_at).getTime() : 0
    const revTime = chRevisions.length > 0 ? Math.max(...chRevisions.map(r => r.completed_at ? new Date(r.completed_at).getTime() : 0)) : 0

    // Find the absolute maximum interaction time across the categories
    const times = [
      { type: 1, time: pTime },
      { type: 2, time: resTime },
      { type: 3, time: nTime },
      { type: 4, time: revTime }
    ]

    const maxInteraction = times.reduce((max, curr) => curr.time > max.time ? curr : max, { type: 0, time: 0 })

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
  
  // Resolve subject-aware workflow for correct steps
  const currentSubject = subjects.find(s => s.id === current.chapter.subject_id)
  const config = getSubjectConfig(currentSubject?.slug)
  const stages = getWorkflowForChapter(config, current.chapter.name)
  
  const idx = stages.indexOf(status)
  const safeIdx = idx === -1 ? 0 : idx
  
  let completedStep = null
  if (status === 'Done') {
    completedStep = 'Done'
  } else if (safeIdx > 0) {
    completedStep = stages[safeIdx - 1]
  }

  const activeStep = status === 'Done' ? 'Done' : stages[safeIdx]

  return {
    chapter: current.chapter,
    subject: currentSubject,
    status: completedStep || '', // Fix TS error (string | null to string)
    nextStep: activeStep // Previously this was activeStep + 1
  }
}

/**
 * Returns the latest completed workflow stage details by timestamp.
 */
export function getLatestCompletedWorkflow(
  progress: ChapterProgress[],
  chapters: Chapter[],
  subjects: Subject[]
): { chapterName: string; status: string; completedAt: string } | null {
  const active = progress.filter(p => p.status && p.completed_at && p.status !== 'Lecture Pending')
  if (active.length === 0) return null
  
  const sorted = active.sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
  const latest = sorted[0]
  
  const chapter = chapters.find(c => c.id === latest.chapter_id)
  const subject = subjects.find(s => s.id === chapter?.subject_id)
  
  // Resolve subject-aware workflow
  const config = getSubjectConfig(subject?.slug)
  const stages = getWorkflowForChapter(config, chapter?.name || '')
  
  const idx = stages.indexOf(latest.status)
  
  // The 'status' in DB represents the ACTIVE stage. 
  // Therefore, the last COMPLETED stage is the one before it (idx - 1).
  let completedStage = latest.status
  if (latest.status !== 'Done' && idx > 0) {
    completedStage = stages[idx - 1]
  } else if (idx === 0) {
    // If the active stage is the very first stage, no stage has been completed yet.
    return null
  }
  
  return {
    chapterName: chapter?.name || 'Unknown Chapter',
    status: completedStage,
    completedAt: latest.completed_at!
  }
}

/**
 * Returns the number of workflow stages completed today.
 */
export function getCompletedTodayCount(progress: ChapterProgress[]): number {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  return progress.filter(p => {
    if (!p.completed_at || !p.status || p.status === 'Lecture Pending') return false
    const d = new Date(p.completed_at)
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return dStr === todayStr
  }).length
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
