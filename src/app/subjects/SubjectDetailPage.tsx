import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Book, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { FilterBar } from '@/features/subjects/components/FilterBar'
import { ChapterCard } from '@/features/subjects/components/ChapterCard'
import { 
  useSubject, 
  useChapters, 
  useAllChapterProgress, 
  useAllResourceProgress, 
  useMistakes, 
  useFormulaSheets, 
  useBacklog, 
  useAllNotes, 
  useAllRevisions,
  useRoadmapPhases,
  useRoadmapMonths
} from '@/lib/supabase/queries'

export default function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const { user } = useAuth()
  
  const { data: subject, isLoading: loadingSubject } = useSubject(subjectId || '')
  const { data: chapters = [], isLoading: loadingChapters } = useChapters(subjectId)
  
  const { data: progress = [], isLoading: loadingProgress } = useAllChapterProgress(user?.id)
  const { data: resources = [], isLoading: loadingResources } = useAllResourceProgress(user?.id)
  const { data: mistakes = [], isLoading: loadingMistakes } = useMistakes(undefined, user?.id)
  const { data: formulaSheets = [], isLoading: loadingFormula } = useFormulaSheets(user?.id)
  const { data: backlog = [], isLoading: loadingBacklog } = useBacklog(user?.id)
  const { data: notes = [], isLoading: loadingNotes } = useAllNotes(user?.id)
  const { data: revisions = [], isLoading: loadingRevisions } = useAllRevisions(user?.id)
  
  const { data: phases = [] } = useRoadmapPhases()
  const { data: months = [] } = useRoadmapMonths()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPhase, setSelectedPhase] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  const isLoading = loadingSubject || loadingChapters || loadingProgress || loadingResources || loadingMistakes || loadingFormula || loadingBacklog || loadingNotes || loadingRevisions

  const { filteredChapters, completionStats } = useMemo(() => {
    let filtered = chapters
    let completedCount = 0
    let totalEstimated = 0
    let activeBacklogCount = 0

    // Compute stats
    chapters.forEach(ch => {
      totalEstimated += ch.estimated_hours || 0
      const p = progress.find(pr => pr.chapter_id === ch.id)
      if (p?.status === 'Completed' || p?.status === 'Done') completedCount++
      if (backlog.some(b => b.chapter_id === ch.id)) activeBacklogCount++
    })

    if (searchQuery) {
      filtered = filtered.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (selectedPhase !== 'all') {
      filtered = filtered.filter(c => c.phase === selectedPhase)
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(c => {
        const p = progress.find(pr => pr.chapter_id === c.id)
        if (selectedStatus === 'Not Started') return !p || p.status === 'Lecture Pending'
        return p?.status === selectedStatus
      })
    }
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(c => c.difficulty === selectedDifficulty)
    }

    return {
      filteredChapters: filtered,
      completionStats: {
        total: chapters.length,
        completed: completedCount,
        percent: chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0,
        estimatedHours: totalEstimated,
        backlogs: activeBacklogCount
      }
    }
  }, [chapters, progress, backlog, searchQuery, selectedPhase, selectedStatus, selectedDifficulty])

  const phaseOptions = useMemo(() => phases.map(p => ({ label: p.name, value: p.id })), [phases])
  const statusOptions = [
    { label: 'Not Started', value: 'Not Started' },
    { label: 'Lecture Pending', value: 'Lecture Pending' },
    { label: 'NCERT Complete', value: 'NCERT Complete' },
    { label: 'WINR Complete', value: 'WINR Complete' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Done', value: 'Done' }
  ]
  const difficultyOptions = [
    { label: 'Easy', value: 'easy' },
    { label: 'Medium', value: 'medium' },
    { label: 'Hard', value: 'hard' }
  ]

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!subject) return <div>Subject not found</div>

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <Link to="/subjects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Subjects
      </Link>

      <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Book className="h-8 w-8 text-primary" />
            {subject.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage chapters and resources for {subject.name}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div className="space-y-1 text-center border-r pr-4">
            <div className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
              <CheckCircle className="h-4 w-4 text-green-500" /> Progress
            </div>
            <div className="text-xl font-bold">{completionStats.percent}%</div>
          </div>
          <div className="space-y-1 text-center border-r pr-4">
            <div className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
              <Clock className="h-4 w-4 text-blue-500" /> Est. Time
            </div>
            <div className="text-xl font-bold">{completionStats.estimatedHours}h</div>
          </div>
          <div className="space-y-1 text-center">
            <div className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
              <AlertCircle className={`h-4 w-4 ${completionStats.backlogs > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} /> Backlog
            </div>
            <div className={`text-xl font-bold ${completionStats.backlogs > 0 ? 'text-orange-500' : 'text-foreground'}`}>
              {completionStats.backlogs}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur py-2">
        <FilterBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedPhase={selectedPhase}
          onPhaseChange={setSelectedPhase}
          phases={phaseOptions}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          statuses={statusOptions}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          difficulties={difficultyOptions}
        />
      </div>

      <div className="space-y-4 mt-6">
        {filteredChapters.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
            <p>No chapters match your filters.</p>
            <button onClick={() => {
              setSearchQuery('')
              setSelectedPhase('all')
              setSelectedStatus('all')
              setSelectedDifficulty('all')
            }} className="mt-2 text-primary hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          filteredChapters.map(chapter => (
            <ChapterCard 
              key={chapter.id}
              chapter={chapter}
              progress={progress.find(p => p.chapter_id === chapter.id)}
              resources={resources.filter(r => r.chapter_id === chapter.id)}
              notes={notes}
              mistakes={mistakes}
              formulaSheets={formulaSheets}
              revisions={revisions}
              backlog={backlog}
              phases={phases}
              months={months}
            />
          ))
        )}
      </div>
    </div>
  )
}