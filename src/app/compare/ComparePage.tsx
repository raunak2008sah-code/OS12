import { useMemo } from 'react'
import { Users, Swords, Trophy, Activity, AlertTriangle, BookOpen, TrendingUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateOverallProgress, calculateSubjectProgress, isChapterDone } from '@/lib/progress'
import { 
  useChapters, 
  useAllChapterProgress, 
  useAllResourceProgress, 
  useMistakes,
  useFriendProfile,
  useSubjects
} from '@/lib/supabase/queries'

export default function ComparePage() {
  const { user } = useAuth()
  const userId = user?.id

  const { data: subjects = [] } = useSubjects()
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
    const myCompletedChapters = myProgress.filter(p => isChapterDone(p.status)).length
    const myPercent = calculateOverallProgress(chapters, myProgress, subjects)
    const myResourcesCount = myResources.filter(r => r.status === 'completed').length
    const myMistakesCount = myMistakes.length

    const friendCompletedChapters = friendProgress.filter(p => isChapterDone(p.status)).length
    const friendPercent = calculateOverallProgress(chapters, friendProgress, subjects)
    const friendResourcesCount = friendResources.filter(r => r.status === 'completed').length
    const friendMistakesCount = friendMistakes.length

    // Per-subject radar
    const subjectComparison = subjects.map(s => {
      return {
        name: s.name,
        myPercent: calculateSubjectProgress(s.id, chapters, myProgress, subjects),
        friendPercent: calculateSubjectProgress(s.id, chapters, friendProgress, subjects),
      }
    })

    return {
      me: { percent: myPercent, chapters: myCompletedChapters, resources: myResourcesCount, mistakes: myMistakesCount },
      friend: { percent: friendPercent, chapters: friendCompletedChapters, resources: friendResourcesCount, mistakes: friendMistakesCount },
      subjectComparison
    }
  }, [chapters, myProgress, myResources, myMistakes, friendProgress, friendResources, friendMistakes, subjects])

  if (!friend) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <header className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-xl border-b border-border/30">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Swords className="h-6 w-6 text-primary" /> Compare
          </h1>
        </header>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="p-6 rounded-full bg-muted/30">
            <Users className="h-16 w-16 text-muted-foreground/30" />
          </div>
          <h2 className="text-xl font-bold text-foreground">No Study Partner Found</h2>
          <p className="text-muted-foreground text-sm max-w-md text-center">Add a friend profile to start comparing progress side-by-side.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Swords className="h-6 w-6 text-primary" /> Compare
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">You vs {friend.display_name}</p>
          </div>
        </div>
      </header>

      {/* Head-to-Head Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserCard name="You" stats={stats.me} isMe />
        <UserCard name={friend.display_name || 'Friend'} stats={stats.friend} />
      </div>

      {/* Detailed Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ComparisonRow label="Overall Progress" me={stats.me.percent} friend={stats.friend.percent} unit="%" icon={Activity} />
          <ComparisonRow label="Chapters Completed" me={stats.me.chapters} friend={stats.friend.chapters} icon={Trophy} />
          <ComparisonRow label="Resources Finished" me={stats.me.resources} friend={stats.friend.resources} icon={BookOpen} />
          <ComparisonRow label="Mistakes Logged" me={stats.me.mistakes} friend={stats.friend.mistakes} icon={AlertTriangle} />
        </CardContent>
      </Card>

      {/* Subject-Level Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Subject Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {stats.subjectComparison.map(s => (
            <div key={s.name} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-primary">{s.myPercent}%</span>
                <span className="font-medium text-muted-foreground">{s.name}</span>
                <span className="font-semibold text-foreground">{s.friendPercent}%</span>
              </div>
              <div className="flex h-2.5 w-full bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-l-full transition-all duration-700" style={{ width: `${s.myPercent / 2}%` }} />
                <div className="flex-1" />
                <div className="h-full bg-foreground/60 rounded-r-full transition-all duration-700" style={{ width: `${s.friendPercent / 2}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function UserCard({ name, stats, isMe }: any) {
  return (
    <Card className={`relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300 ${isMe ? 'border-primary/40 shadow-lg shadow-primary/5' : ''}`}>
      {isMe && <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />}
      {isMe && <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">You</div>}
      <CardContent className="p-4 space-y-3">
        <div className="text-center space-y-2">
          <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black ${isMe ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {name.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-xl font-bold">{name}</h3>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Completion</div>
          <div className={`text-6xl font-black tracking-tighter ${isMe ? 'text-primary' : 'text-foreground'}`}>
            {stats.percent}%
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 border-t border-border/30 pt-4">
          <div className="text-center">
            <div className="text-xl font-black">{stats.chapters}</div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Chapters</div>
          </div>
          <div className="text-center border-x border-border/30">
            <div className="text-xl font-black">{stats.resources}</div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Resources</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black">{stats.mistakes}</div>
            <div className="text-[10px] text-muted-foreground uppercase font-semibold">Mistakes</div>
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
        <span className="font-bold text-primary">{me}{unit}</span>
        <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
          <Icon className="h-4 w-4" /> {label}
        </span>
        <span className="font-bold text-foreground">{friend}{unit}</span>
      </div>
      <div className="flex h-2.5 w-full bg-muted/30 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-l-full transition-all duration-700" style={{ width: `${mePercent / 2}%` }} />
        <div className="flex-1" />
        <div className="h-full bg-foreground/60 rounded-r-full transition-all duration-700" style={{ width: `${friendPercent / 2}%` }} />
      </div>
    </div>
  )
}
