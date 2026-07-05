import { useMemo } from 'react'
import { Users, Swords, Trophy, Activity, AlertTriangle, BookOpen } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  useChapters, 
  useAllChapterProgress, 
  useAllResourceProgress, 
  useMistakes,
  useFriendProfile
} from '@/lib/supabase/queries'

export default function ComparePage() {
  const { user } = useAuth()
  const userId = user?.id

  const { data: chapters = [] } = useChapters()
  
  // My Data
  const { data: myProgress = [] } = useAllChapterProgress(userId)
  const { data: myResources = [] } = useAllResourceProgress(userId)
  const { data: myMistakes = [] } = useMistakes(undefined, userId)

  // Friend Data
  const { data: friend } = useFriendProfile(userId)
  const { data: friendProgress = [] } = useAllChapterProgress(friend?.id)
  const { data: friendResources = [] } = useAllResourceProgress(friend?.id)
  const { data: friendMistakes = [] } = useMistakes(undefined, friend?.id)

  const stats = useMemo(() => {
    const totalChapters = chapters.length

    // My Stats
    const myCompletedChapters = myProgress.filter(p => p.status === 'Completed' || p.status === 'Done').length
    const myPercent = totalChapters > 0 ? Math.round((myCompletedChapters / totalChapters) * 100) : 0
    const myResourcesCount = myResources.filter(r => r.status === 'completed').length
    const myMistakesCount = myMistakes.length

    // Friend Stats
    const friendCompletedChapters = friendProgress.filter(p => p.status === 'Completed' || p.status === 'Done').length
    const friendPercent = totalChapters > 0 ? Math.round((friendCompletedChapters / totalChapters) * 100) : 0
    const friendResourcesCount = friendResources.filter(r => r.status === 'completed').length
    const friendMistakesCount = friendMistakes.length

    return {
      me: {
        percent: myPercent,
        chapters: myCompletedChapters,
        resources: myResourcesCount,
        mistakes: myMistakesCount
      },
      friend: {
        percent: friendPercent,
        chapters: friendCompletedChapters,
        resources: friendResourcesCount,
        mistakes: friendMistakesCount
      }
    }
  }, [chapters, myProgress, myResources, myMistakes, friendProgress, friendResources, friendMistakes])

  if (!friend) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Users className="h-16 w-16 text-muted-foreground opacity-50" />
        <h2 className="text-xl font-bold">No Friends Found</h2>
        <p className="text-muted-foreground">Add a friend to start comparing progress.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Swords className="h-8 w-8 text-primary" />
            Compare
          </h1>
          <p className="text-muted-foreground">See how you measure up against {friend.display_name}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UserCard name="You" stats={stats.me} isMe />
        <UserCard name={friend.display_name || 'Friend'} stats={stats.friend} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ComparisonRow label="Overall Progress" me={stats.me.percent} friend={stats.friend.percent} unit="%" icon={Activity} />
          <ComparisonRow label="Chapters Completed" me={stats.me.chapters} friend={stats.friend.chapters} icon={Trophy} />
          <ComparisonRow label="Resources Finished" me={stats.me.resources} friend={stats.friend.resources} icon={BookOpen} />
          <ComparisonRow label="Mistakes Logged" me={stats.me.mistakes} friend={stats.friend.mistakes} icon={AlertTriangle} />
        </CardContent>
      </Card>
    </div>
  )
}

function UserCard({ name, stats, isMe }: any) {
  return (
    <Card className={`relative overflow-hidden ${isMe ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''}`}>
      {isMe && <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg text-xs font-bold">YOU</div>}
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-sm text-muted-foreground uppercase font-bold tracking-wider mb-2">Completion</div>
          <div className={`text-6xl font-black ${isMe ? 'text-primary' : 'text-foreground'}`}>
            {stats.percent}%
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div className="text-center">
            <div className="text-xl font-bold">{stats.chapters}</div>
            <div className="text-xs text-muted-foreground">Chapters</div>
          </div>
          <div className="text-center border-l">
            <div className="text-xl font-bold">{stats.resources}</div>
            <div className="text-xs text-muted-foreground">Resources</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ComparisonRow({ label, me, friend, unit = '', icon: Icon }: any) {
  const total = Math.max(me, friend) || 1
  const mePercent = Math.round((me / total) * 100)
  const friendPercent = Math.round((friend / total) * 100)

  return (
    <div className="space-y-2 py-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-primary">{me}{unit}</span>
        <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
          <Icon className="h-4 w-4" /> {label}
        </span>
        <span className="font-semibold text-foreground">{friend}{unit}</span>
      </div>
      <div className="flex h-3 w-full bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${mePercent / 2}%` }} />
        <div className="flex-1 bg-transparent" />
        <div className="h-full bg-foreground" style={{ width: `${friendPercent / 2}%` }} />
      </div>
    </div>
  )
}
