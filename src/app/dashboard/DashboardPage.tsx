import { useAuth } from '@/hooks/useAuth'
import { useChapters, useProgress, useRoadmapMonths, useRoadmapPhases, useSubjects } from '@/lib/supabase/queries'
import { TodaysFocus } from '@/features/dashboard/components/TodaysFocus'
import { BacklogBanner } from '@/features/dashboard/components/BacklogBanner'
import { PhaseSnapshot } from '@/features/dashboard/components/PhaseSnapshot'
import { FriendSnapshot } from '@/features/dashboard/components/FriendSnapshot'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: chapters, isLoading: chaptersLoading } = useChapters()
  const { data: subjects, isLoading: subjectsLoading } = useSubjects()
  const { data: progress, isLoading: progressLoading } = useProgress(user?.id)
  const { data: months, isLoading: monthsLoading } = useRoadmapMonths()
  const { data: phases, isLoading: phasesLoading } = useRoadmapPhases()

  const isLoading = chaptersLoading || subjectsLoading || progressLoading || monthsLoading || phasesLoading

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!chapters || !subjects || !progress || !months || !phases) {
    return null
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in-50 duration-500 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">What today is for, and where you stand.</p>
      </div>

      <BacklogBanner chapters={chapters} progress={progress} months={months} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          <TodaysFocus chapters={chapters} subjects={subjects} progress={progress} />
          
          {/* Recent Activity / Quick Actions could go here, per PRD. We will stub them for now if we want, or keep it perfectly minimal. */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm opacity-50 grayscale pointer-events-none">
             <h3 className="font-semibold text-foreground mb-2">Quick Actions (Coming soon)</h3>
             <p className="text-sm text-muted-foreground">Mistake Notebook, Sunday Ritual...</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <PhaseSnapshot phases={phases} months={months} />
          <FriendSnapshot chapters={chapters} />
        </div>
      </div>
    </div>
  )
}
