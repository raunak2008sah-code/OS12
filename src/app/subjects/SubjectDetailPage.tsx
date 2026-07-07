import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, Book, Clock, Target } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { subjectProgressDynamic, isChapterDone } from '@/lib/progress'
import { FilterBar } from '@/features/subjects/components/FilterBar'
import { ChapterCard } from '@/features/subjects/components/ChapterCard'
import { 
  useSubject, 
  useChapters, 
  useAllChapterProgress, 
  useAllResourceProgress, 
  useMistakes, 
  useFormulaSheets, 
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
  const { data: notes = [], isLoading: loadingNotes } = useAllNotes(user?.id)
  const { data: revisions = [], isLoading: loadingRevisions } = useAllRevisions(user?.id)
  
  const { data: phases = [] } = useRoadmapPhases()
  const { data: months = [] } = useRoadmapMonths()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPhase, setSelectedPhase] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  const isLoading = loadingSubject || loadingChapters || loadingProgress || loadingResources || loadingMistakes || loadingFormula || loadingNotes || loadingRevisions

  const { filteredChapters, completionStats } = useMemo(() => {
    let filtered = chapters
    let completedCount = 0
    let totalEstimated = 0

    // Compute stats
    chapters.forEach(ch => {
      totalEstimated += ch.estimated_hours || 0
      const p = progress.find(pr => pr.chapter_id === ch.id)
      if (isChapterDone(p?.status)) completedCount++
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
        percent: subject ? subjectProgressDynamic(chapters, progress, [subject]) : 0,
        estimatedHours: totalEstimated
      }
    }
  }, [chapters, progress, searchQuery, selectedPhase, selectedStatus, selectedDifficulty, subject])

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
      <div className="mx-auto max-w-[1400px] space-y-4">
        {/* Skeleton header */}
        <div className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-xl border-b border-border/30">
          <div className="h-4 w-32 bg-muted/50 rounded-lg animate-pulse" />
          <div className="h-8 w-64 bg-muted/50 rounded-lg animate-pulse mt-3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-40 bg-card border border-border/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!subject) return <div className="text-center py-12 text-muted-foreground">Subject not found</div>

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 pb-8">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-xl border-b border-border/30">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <Link to="/subjects" className="hover:text-foreground transition-colors">Subjects</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{subject.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Book className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{subject.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {completionStats.total} chapters • {completionStats.completed} completed
              </p>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <StatPill icon={Target} label="Progress" value={`${completionStats.percent}%`} color="text-primary" />
            <StatPill icon={Clock} label="Est. Time" value={`${completionStats.estimatedHours}h`} color="text-blue-500" />
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <div className="sticky top-[105px] z-[9] bg-background/95 backdrop-blur-sm py-2 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8">
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

      {/* Chapters Grid */}
      <div className="space-y-4 mt-4">
        {filteredChapters.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-muted/10 text-muted-foreground gap-3">
            <p className="font-medium">No chapters match your filters.</p>
            <button onClick={() => {
              setSearchQuery('')
              setSelectedPhase('all')
              setSelectedStatus('all')
              setSelectedDifficulty('all')
            }} className="text-sm text-primary hover:underline font-semibold">
              Clear all filters
            </button>
          </div>
        ) : (
          <ChapterGroups 
            chapters={filteredChapters} 
            progress={progress} 
            resources={resources} 
            notes={notes} 
            mistakes={mistakes} 
            formulaSheets={formulaSheets} 
            revisions={revisions} 
            phases={phases} 
            months={months}
            subjectSlug={subject?.slug}
          />
        )}
      </div>
    </div>
  )
}

function ChapterGroups({ chapters, progress, ...props }: any) {
  const [showCompleted, setShowCompleted] = useState(false)

  const active = chapters.filter((c: any) => {
    const p = progress.find((pr: any) => pr.chapter_id === c.id)
    return !p || !isChapterDone(p.status)
  })
  const completed = chapters.filter((c: any) => {
    const p = progress.find((pr: any) => pr.chapter_id === c.id)
    return isChapterDone(p?.status)
  })

  return (
    <div className="space-y-4">
      {active.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Active Chapters</h2>
          <div className="space-y-4">
            {active.map((chapter: any) => (
              <ChapterCard 
                key={chapter.id}
                chapter={chapter}
                progress={progress.find((p: any) => p.chapter_id === chapter.id)}
                subjectSlug={props.subjectSlug}
                {...props}
              />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-4">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <ChevronRight className={`h-5 w-5 transition-transform ${showCompleted ? 'rotate-90' : ''}`} />
            <h2 className="text-lg font-bold">Completed Chapters ({completed.length})</h2>
          </div>
          {showCompleted && (
            <div className="space-y-4">
              {completed.map((chapter: any) => (
                <ChapterCard 
                  key={chapter.id}
                  chapter={chapter}
                  progress={progress.find((p: any) => p.chapter_id === chapter.id)}
                  subjectSlug={props.subjectSlug}
                  {...props}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatPill({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-4 py-2.5 shadow-sm">
      <Icon className={`h-4 w-4 ${color}`} />
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-lg font-bold text-foreground leading-none">{value}</p>
      </div>
    </div>
  )
}