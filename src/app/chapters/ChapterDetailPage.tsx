import { useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

import { 
  useChapter, 
  useSubject, 
  useChapterProgress, 
  useToggleChapterProgress,
  useRoadmapPhases,
  useBacklog,
  useResourceProgress,
  useToggleResourceProgress,
  useResources,
  useRevisions,
  useToggleRevision,
  useMistakes,
  useAddMistake,
  useToggleMistakeResolved,
  useNotes,
  useSaveNote,
  useFormulaSheet,
  useSaveFormulaSheet,
  useComments,
  useAddComment
  // onDeleteComment is not implemented in queries.ts, we'll omit or add it if needed
} from '@/lib/supabase/queries'

import { ChapterHeader } from '@/features/chapters/components/ChapterHeader'
import { ChapterWorkflow } from '@/features/chapters/components/ChapterWorkflow'
import { ChapterResources } from '@/features/chapters/components/ChapterResources'
import { ChapterRevisions } from '@/features/chapters/components/ChapterRevisions'
import { ChapterMistakes } from '@/features/chapters/components/ChapterMistakes'
import { ChapterNotes } from '@/features/chapters/components/ChapterNotes'
import { ChapterFormula } from '@/features/chapters/components/ChapterFormula'
import { ChapterComments } from '@/features/chapters/components/ChapterComments'
import { supabase } from '@/lib/supabase/client'

const WORKFLOW_STAGES = [
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
]

export default function ChapterDetailPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const { user } = useAuth()
  const userId = user?.id

  // Data fetching
  const { data: chapter, isLoading: loadingChapter } = useChapter(chapterId || '')
  const { data: subject, isLoading: loadingSubject } = useSubject(chapter?.subject_id || '')
  const { data: progress } = useChapterProgress(userId, chapterId)
  const { data: phases } = useRoadmapPhases()
  const { data: backlog = [] } = useBacklog(userId)
  const { data: resourceProgress = [] } = useResourceProgress(userId, chapterId)
  const { data: allResources = [] } = useResources()
  const { data: revisions = [] } = useRevisions(userId, chapterId)
  const { data: mistakes = [] } = useMistakes(chapterId, userId)
  const { data: note } = useNotes(chapterId || '', userId)
  const { data: formulaSheet } = useFormulaSheet(userId, chapterId)
  const { data: comments = [] } = useComments(chapterId || '')

  // Mutations
  const { mutateAsync: toggleProgress } = useToggleChapterProgress()
  const { mutateAsync: toggleResource } = useToggleResourceProgress()
  const { mutateAsync: toggleRevision } = useToggleRevision()
  const { mutateAsync: addMistake } = useAddMistake()
  const { mutateAsync: toggleMistake } = useToggleMistakeResolved()
  const { mutateAsync: saveNote } = useSaveNote()
  const { mutateAsync: saveFormulaSheet } = useSaveFormulaSheet()
  const { mutateAsync: addComment } = useAddComment()

  if (loadingChapter || loadingSubject) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!chapter || !subject) {
    return <div className="text-center py-12 text-muted-foreground">Chapter or Subject not found</div>
  }

  const currentStatus = progress?.status || 'Lecture Pending'
  const activePhase = phases?.find(p => p.id === chapter.phase)
  const activeBacklog = backlog.find(b => b.chapter_id === chapter.id)

  const currentIndex = WORKFLOW_STAGES.indexOf(currentStatus)
  const safeIndex = currentIndex === -1 ? 0 : currentIndex
  const completionPercent = Math.round(((safeIndex + (currentStatus === 'Done' ? 1 : 0)) / WORKFLOW_STAGES.length) * 100)

  // Handlers
  const handleStatusChange = async (status: string) => {
    if (!userId || !chapterId) return
    await toggleProgress({ userId, chapterId, status })
  }

  const handleResourceToggle = async (resourceId: string, status: string) => {
    if (!userId || !chapterId) return
    await toggleResource({ userId, chapterId, resourceId, status })
  }

  const handleRevisionToggle = async (day: number, status: string) => {
    if (!userId || !chapterId) return
    await toggleRevision({ userId, chapterId, revisionDay: day, status })
  }

  const handleAddMistake = async (content: string, tags: string[]) => {
    if (!userId || !chapterId) return
    await addMistake({ user_id: userId, chapter_id: chapterId, content, tags })
  }

  const handleToggleMistake = async (mistakeId: string, isResolved: boolean) => {
    if (!userId || !chapterId) return
    await toggleMistake({ mistakeId, isResolved, userId, chapterId })
  }

  const handleSaveNote = async (content: string) => {
    if (!userId || !chapterId) return
    await saveNote({ userId, chapterId, content })
  }

  const handleSaveFormula = async (content: string) => {
    if (!userId || !chapterId) return
    await saveFormulaSheet({ userId, chapterId, content })
  }

  const handleAddComment = async (content: string) => {
    if (!userId || !chapterId) return
    await addComment({ userId, chapterId, content })
  }

  const handleDeleteComment = async (commentId: string) => {
    // Basic implementation since it wasn't in queries.ts
    await supabase.from('comments').delete().eq('id', commentId)
    // Would ideally invalidate query here, but we can rely on a fast reload or just implement it right here
    window.location.reload()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <ChapterHeader 
        chapter={chapter}
        subject={subject}
        progress={progress || undefined}
        phase={activePhase}
        backlog={activeBacklog}
        completionPercent={completionPercent}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Workflow, Resources, Revisions */}
        <div className="lg:col-span-1 space-y-8">
          <ChapterWorkflow 
            currentStatus={currentStatus}
            onStatusChange={handleStatusChange}
          />
          <ChapterResources 
            resources={allResources}
            progress={resourceProgress}
            onToggle={handleResourceToggle}
          />
          <ChapterRevisions 
            revisions={revisions}
            onToggle={handleRevisionToggle}
          />
        </div>

        {/* Right Column - Notes, Formula, Mistakes, Comments */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ChapterNotes 
              note={note || null}
              onSave={handleSaveNote}
            />
            <ChapterFormula 
              formulaSheet={formulaSheet || null}
              onSave={handleSaveFormula}
            />
          </div>
          
          <ChapterMistakes 
            mistakes={mistakes}
            onAddMistake={handleAddMistake}
            onToggleResolved={handleToggleMistake}
          />
          
          <ChapterComments 
            comments={comments}
            currentUserId={userId}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      </div>
    </div>
  )
}