import { useParams } from 'react-router-dom'
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
  useNotes,
  useSaveNote
} from '@/lib/supabase/queries'
import { chapterWorkflowPercentDynamic } from '@/lib/progress'
import { getSubjectConfig, getWorkflowForChapter, getResourcesForChapter } from '@/lib/subjectProfiles'

import { ChapterHeader } from '@/features/chapters/components/ChapterHeader'
import { ChapterWorkflow } from '@/features/chapters/components/ChapterWorkflow'
import { ChapterResources } from '@/features/chapters/components/ChapterResources'
import { ChapterRevisions } from '@/features/chapters/components/ChapterRevisions'
import { ChapterNotes } from '@/features/chapters/components/ChapterNotes'



export default function ChapterDetailPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const { user } = useAuth()
  const userId = user?.id

  // Data fetching
  const { data: chapter, isLoading: loadingChapter } = useChapter(chapterId || '')
  const { data: subject, isLoading: loadingSubject } = useSubject(chapter?.subject_id || '')
  const { data: progress } = useChapterProgress(userId, chapterId)
  const { data: phases } = useRoadmapPhases()
  const { data: resourceProgress = [] } = useResourceProgress(userId, chapterId)
  const { data: allResources = [] } = useResources()
  const { data: revisions = [] } = useRevisions(userId, chapterId)
  const { data: note } = useNotes(chapterId || '', userId)

  // Mutations
  const { mutateAsync: toggleProgress } = useToggleChapterProgress()
  const { mutateAsync: toggleResource } = useToggleResourceProgress()
  const { mutateAsync: toggleRevision } = useToggleRevision()
  const { mutateAsync: saveNote } = useSaveNote()

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

  const handleSaveNote = async (content: string) => {
    if (!userId || !chapterId) return
    await saveNote({ userId, chapterId, content })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-[350ms] ease-[cubic-bezier(0,0,0.2,1)] pb-8">
      <ChapterHeader 
        chapter={chapter}
        subject={subject}
        progress={progress || undefined}
        phase={activePhase}
        completionPercent={completionPercent}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pb-8">
        {/* Left Column - Workflow, Resources, Revisions */}
        <div className="lg:col-span-7 space-y-5 lg:sticky lg:top-24">
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

        {/* Right Column - Notes Workspace */}
        <div className="lg:col-span-5">
          <ChapterNotes 
            note={note || null}
            onSave={handleSaveNote}
          />
        </div>
      </div>
    </div>
  )
}