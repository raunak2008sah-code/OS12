import { useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'

import { 
  useChapter, 
  useSubject, 
  useChapterProgress, 
  useToggleChapterProgress,
  useRoadmapPhases,
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
} from '@/lib/supabase/queries'
import { chapterWorkflowPercentDynamic } from '@/lib/progress'
import { getSubjectConfig, getWorkflowForChapter, getResourcesForChapter } from '@/lib/subjectProfiles'

import { ChapterHeader } from '@/features/chapters/components/ChapterHeader'
import { ChapterWorkflow } from '@/features/chapters/components/ChapterWorkflow'
import { ChapterResources } from '@/features/chapters/components/ChapterResources'
import { ChapterRevisions } from '@/features/chapters/components/ChapterRevisions'
import { ChapterMistakes } from '@/features/chapters/components/ChapterMistakes'
import { ChapterNotes } from '@/features/chapters/components/ChapterNotes'
import { ChapterFormula } from '@/features/chapters/components/ChapterFormula'
import { ChapterComments } from '@/features/chapters/components/ChapterComments'
import { supabase } from '@/lib/supabase/client'



export default function ChapterDetailPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const { user } = useAuth()
  const userId = user?.id
  const queryClient = useQueryClient()

  // Data fetching
  const { data: chapter, isLoading: loadingChapter } = useChapter(chapterId || '')
  const { data: subject, isLoading: loadingSubject } = useSubject(chapter?.subject_id || '')
  const { data: progress } = useChapterProgress(userId, chapterId)
  const { data: phases } = useRoadmapPhases()
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

  // Resolve subject-specific workflow and resources
  const subjectConfig = getSubjectConfig(subject.slug)
  const resolvedStages = getWorkflowForChapter(subjectConfig, chapter.name)
  const resolvedResourceNames = getResourcesForChapter(subjectConfig, chapter.name)

  // Filter global resources to only show ones relevant to this subject
  const filteredResources = allResources.filter(r =>
    resolvedResourceNames.some(name => r.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(r.name.toLowerCase()))
  )

  const completionPercent = chapterWorkflowPercentDynamic(currentStatus, resolvedStages)

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
    if (!chapterId) return
    await supabase.from('comments').delete().eq('id', commentId)
    queryClient.invalidateQueries({ queryKey: ['comments', chapterId] })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-8">
      <ChapterHeader 
        chapter={chapter}
        subject={subject}
        progress={progress || undefined}
        phase={activePhase}
        completionPercent={completionPercent}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column - Workflow, Resources, Revisions */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <ChapterWorkflow 
            currentStatus={currentStatus}
            onStatusChange={handleStatusChange}
            stages={resolvedStages}
          />
          <ChapterResources 
            resources={filteredResources}
            progress={resourceProgress}
            onToggle={handleResourceToggle}
          />
          <ChapterRevisions 
            revisions={revisions}
            onToggle={handleRevisionToggle}
          />
        </div>

        {/* Right Column - Notes, Formula, Mistakes, Comments */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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