import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useFriendProfile, useProgress } from '@/lib/supabase/queries'
import type { Chapter } from '@/lib/supabase/types'
import { WORKFLOW_STEPS } from '@/features/chapter-workflow/constants'

interface FriendSnapshotProps {
  chapters: Chapter[]
}

export function FriendSnapshot({ chapters }: FriendSnapshotProps) {
  const { user } = useAuth()
  const { data: friend } = useFriendProfile(user?.id)
  const { data: friendProgress } = useProgress(friend?.id)

  const stats = useMemo(() => {
    if (!friendProgress || !chapters) return { percent: 0, latestChapter: null }

    const validChapters = chapters.filter(c => !c.is_placeholder)
    const totalChapters = validChapters.length
    if (totalChapters === 0) return { percent: 0, latestChapter: null }

    let completedCount = 0
    let latest: Chapter | null = null
    let highestIndex = -1

    validChapters.forEach(chapter => {
      const p = friendProgress.filter(fp => fp.chapter_id === chapter.id)
      const isComplete = WORKFLOW_STEPS.every(step => p.some(sp => sp.step_key === step.key))
      
      if (isComplete) {
        completedCount++
      } else if (p.length > 0) {
        // If not complete but has progress, this is their active chapter
        if (chapter.order_index && chapter.order_index > highestIndex) {
          highestIndex = chapter.order_index
          latest = chapter
        }
      }
    })

    return {
      percent: Math.round((completedCount / totalChapters) * 100),
      latestChapter: latest as Chapter | null
    }
  }, [chapters, friendProgress])

  if (!friend) return null

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold tracking-tight text-foreground">{friend.display_name}'s Status</h2>
        </div>
        <Link to="/compare" className="text-muted-foreground hover:text-primary transition-colors">
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Current Focus
          </p>
          <h3 className="mt-1 text-sm font-medium text-foreground line-clamp-1">
            {stats.latestChapter ? stats.latestChapter.name : 'All caught up / Planning'}
          </h3>
        </div>

        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Overall Completion</span>
            <span className="text-foreground">{stats.percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className="h-full bg-primary/40 transition-all duration-500 ease-out"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
