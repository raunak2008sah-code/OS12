import { useState } from 'react'
import { useSubjects, useChapters, useAllProgress } from '@/lib/supabase/queries'
import { useAuth } from '@/hooks/useAuth'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateBlocks'
import { SubjectCard } from '@/features/subjects/components/SubjectCard'
import { FilterBar } from '@/features/subjects/components/FilterBar'

export default function SubjectListPage() {
  const { user } = useAuth()
  const { data: subjects, isLoading: isLoadingSubjects, error: subjectsError, refetch: refetchSubjects } = useSubjects()
  const { data: chapters, isLoading: isLoadingChapters, error: chaptersError } = useChapters()
  const { data: progress, isLoading: isLoadingProgress } = useAllProgress(user?.id)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPhase, setSelectedPhase] = useState('all')

  const isLoading = isLoadingSubjects || isLoadingChapters || isLoadingProgress
  const error = subjectsError || chaptersError
  const hasNoData = !subjects?.length

  if (isLoading) return <LoadingState message="Loading subjects and progress..." />
  
  if (error) {
    return <ErrorState error={error} onRetry={() => void refetchSubjects()} />
  }

  if (hasNoData) {
    return <EmptyState title="No Subjects Found" description="There are no subjects configured in the curriculum." />
  }

  // Filter subjects based on search query
  const filteredSubjects = subjects.filter(sub => {
    if (searchQuery && !sub.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    // We could filter by phase if subjects had phases, but phases are on chapters. 
    // We'll just filter by search query for now.
    return true
  })

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500 pb-16 mx-auto max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Subjects</h1>
        <p className="text-muted-foreground mt-2">Your primary daily workspace. Manage workload and track progress.</p>
      </div>

      <FilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPhase={selectedPhase}
        onPhaseChange={setSelectedPhase}
        phases={[]} // Subjects don't have phases, chapters do
        selectedStatus="all"
        onStatusChange={() => {}}
        statuses={[]}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubjects.map((subject) => (
          <SubjectCard 
            key={subject.id} 
            subject={subject} 
            chapters={chapters || []}
            progress={progress || []}
          />
        ))}
        {filteredSubjects.length === 0 && (
          <div className="col-span-full">
            <EmptyState title="No results" description={`No subjects match "${searchQuery}"`} />
          </div>
        )}
      </div>
    </div>
  )
}
