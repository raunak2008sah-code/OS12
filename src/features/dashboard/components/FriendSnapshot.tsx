import { Users, UserX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useFriendProfile, useAllChapterProgress, useChapters } from '@/lib/supabase/queries'
import { useAuth } from '@/hooks/useAuth'
import { useMemo } from 'react'

export function FriendSnapshot() {
  const { user } = useAuth()
  const { data: friend } = useFriendProfile(user?.id)
  const { data: chapters = [] } = useChapters()
  const { data: friendProgress = [] } = useAllChapterProgress(friend?.id)
  const { data: myProgress = [] } = useAllChapterProgress(user?.id)

  const myCompleted = useMemo(
    () => myProgress.filter(p => p.status === 'Completed' || p.status === 'Fully Completed').length,
    [myProgress]
  )
  const friendCompleted = useMemo(
    () => friendProgress.filter(p => p.status === 'Completed' || p.status === 'Fully Completed').length,
    [friendProgress]
  )
  const totalChapters = chapters.length || 1

  if (!friend) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Friend Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <UserX className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-foreground">No peers connected</p>
            <p className="text-sm text-muted-foreground mt-1">
              When another user joins, their progress will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Friend Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <span className="text-sm font-semibold text-primary">
              {friend.display_name?.charAt(0)?.toUpperCase() ?? friend.email?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {friend.display_name || friend.email?.split('@')[0] || 'Anonymous'}
            </p>
            <p className="text-xs text-muted-foreground">
              {friendCompleted} / {totalChapters} chapters completed
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">You</span>
              <span className="tabular-nums font-medium">{Math.round((myCompleted / totalChapters) * 100)}%</span>
            </div>
            <Progress value={(myCompleted / totalChapters) * 100} className="h-2" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{friend.display_name || 'Friend'}</span>
              <span className="tabular-nums font-medium">{Math.round((friendCompleted / totalChapters) * 100)}%</span>
            </div>
            <Progress value={(friendCompleted / totalChapters) * 100} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}