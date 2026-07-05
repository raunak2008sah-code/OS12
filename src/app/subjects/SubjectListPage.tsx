import { useAuth } from '@/hooks/useAuth'
import { SubjectCard } from '@/features/subjects/components/SubjectCard'
import { useSubjects, useChapters, useAllChapterProgress, useBacklog } from '@/lib/supabase/queries'

export default function SubjectListPage() {
  const { user } = useAuth()
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects()
  const { data: allChapters = [], isLoading: loadingChapters } = useChapters()
  const { data: progress = [], isLoading: loadingProgress } = useAllChapterProgress(user?.id)
  const { data: backlog = [], isLoading: loadingBacklog } = useBacklog(user?.id)

  const isLoading = loadingSubjects || loadingChapters || loadingProgress || loadingBacklog

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Subjects</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your chapters, track progress, and view resources for each subject.
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
          No subjects found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map(subject => (
            <SubjectCard 
              key={subject.id} 
              subject={subject} 
              chapters={allChapters.filter(c => c.subject_id === subject.id)}
              progress={progress}
              backlog={backlog}
            />
          ))}
        </div>
      )}
    </div>
  )
}