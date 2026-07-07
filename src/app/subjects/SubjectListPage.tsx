import { useAuth } from '@/hooks/useAuth'
import { SubjectCard } from '@/features/subjects/components/SubjectCard'
import { useSubjects, useChapters, useAllChapterProgress } from '@/lib/supabase/queries'
import { BookOpen, BarChart3 } from 'lucide-react'
import { calculateOverallProgress } from '@/lib/progress'

export default function SubjectListPage() {
  const { user } = useAuth()
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects()
  const { data: allChapters = [], isLoading: loadingChapters } = useChapters()
  const { data: progress = [], isLoading: loadingProgress } = useAllChapterProgress(user?.id)

  const isLoading = loadingSubjects || loadingChapters || loadingProgress

  // Stats
  const totalChapters = allChapters.length
  const overallPercent = calculateOverallProgress(allChapters, progress, subjects)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="h-10 w-48 bg-muted/50 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-56 bg-card/50 border border-border/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-[350ms] ease-[cubic-bezier(0,0,0.2,1)] p-4 md:p-6 lg:p-8 pt-4">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              Subjects
            </h1>
            <p className="text-[13px] text-muted-foreground/80 mt-1">
              {subjects.length} subjects • {totalChapters} chapters • {overallPercent}% progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-muted/20 border border-border/40 rounded-xl px-4 py-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">{overallPercent}%</span>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/80">overall</span>
            </div>
          </div>
        </div>
      </header>

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] rounded-2xl border-2 border-dashed border-border/40 bg-card/30">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No subjects found</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">Add subjects from the database to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {subjects.map(subject => {
            const subjectChapters = allChapters.filter(c => c.subject_id === subject.id)
            return (
              <SubjectCard 
                key={subject.id} 
                subject={subject} 
                chapters={subjectChapters}
                progress={progress.filter(p => subjectChapters.some(c => c.id === p.chapter_id))}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}