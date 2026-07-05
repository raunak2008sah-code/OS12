import { useMemo } from 'react'
import { Activity } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useChapters, useAllChapterProgress, useBacklog } from '@/lib/supabase/queries'

export function HealthIndicator() {
  const { user } = useAuth()
  const { data: chapters = [] } = useChapters()
  const { data: progress = [] } = useAllChapterProgress(user?.id)
  const { data: backlogItems = [] } = useBacklog(user?.id)

  const completionPercent = useMemo(() => {
    if (!chapters.length) return 0
    const completedIds = new Set(progress.filter(p => p.status === 'Completed').map(p => p.chapter_id))
    const completed = chapters.filter(c => completedIds.has(c.id)).length
    return Math.round((completed / chapters.length) * 100)
  }, [chapters, progress])

  const hasBacklog = backlogItems.length > 0

  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{completionPercent}%</span>
        <span className="text-muted-foreground">Syllabus</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${hasBacklog ? 'bg-red-500' : 'bg-green-500'}`} />
        <span className="text-muted-foreground">
          {hasBacklog ? `${backlogItems.length} active backlogs` : 'Track healthy'}
        </span>
      </div>
    </div>
  )
}
