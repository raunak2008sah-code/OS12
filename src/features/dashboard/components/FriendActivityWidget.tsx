import { Link } from 'react-router-dom'
import { Flame, ChevronRight, BookOpen, PenTool, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { 
  useFriendProfile,
  useAllChapterProgress,
  useAllRevisions,
  useAllNotes,
  useChapters,
  useSubjects,
  useAllResourceProgress
} from '@/lib/supabase/queries'
import { 
  calculateOverallProgress, 
  getCurrentChapter, 
  getLatestCompletedWorkflow,
  getCompletedTodayCount,
  calculateStudyStreak, 
  formatRelativeTime 
} from '@/lib/progress'

export function FriendActivityWidget() {
  const { user } = useAuth()
  const { data: friend } = useFriendProfile(user?.id)
  
  const { data: progress = [] } = useAllChapterProgress(friend?.id)
  const { data: revisions = [] } = useAllRevisions(friend?.id)
  const { data: notes = [] } = useAllNotes(friend?.id)
  const { data: resources = [] } = useAllResourceProgress(friend?.id)
  const { data: chapters = [] } = useChapters()
  const { data: subjects = [] } = useSubjects()

  if (!friend) return null

  // Calculate overall progress % using unified canonical formula
  const friendPercent = calculateOverallProgress(chapters, progress, subjects)

  // Collect all timestamps for Last Seen and Streak
  const allTimestamps: string[] = []
  progress.forEach(p => { if (p.completed_at) allTimestamps.push(p.completed_at) })
  notes.forEach(n => { if (n.updated_at) allTimestamps.push(n.updated_at) })

  resources.forEach(r => { if (r.completed_at) allTimestamps.push(r.completed_at) })
  revisions.forEach(r => { if (r.completed_at) allTimestamps.push(r.completed_at) })

  // Last Seen
  const sortedTimestamps = [...allTimestamps].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  const lastSeenStr = sortedTimestamps[0] ? formatRelativeTime(sortedTimestamps[0]) : 'Never'
  const isOnline = sortedTimestamps[0] && (new Date().getTime() - new Date(sortedTimestamps[0]).getTime() < 3600000)

  // Streak
  const streak = calculateStudyStreak(allTimestamps)

  // Friend Current Chapter & Latest Activity
  const friendCurrentInfo = getCurrentChapter(chapters, progress, notes, resources, revisions, subjects)
  const currentChapterName = friendCurrentInfo?.chapter?.name || 'None'
  
  const latestActivity = getLatestCompletedWorkflow(progress, chapters)
  const completedTodayCount = getCompletedTodayCount(progress)

  // Latest note snippet
  const latestNote = [...notes].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]
  const latestNoteText = latestNote 
    ? `${chapters.find(c => c.id === latestNote.chapter_id)?.name || 'Ch'}: ${latestNote.content ? latestNote.content.substring(0, 30) : 'Empty'}...`
    : 'None'

  // Latest revision
  const latestRevision = [...revisions].sort((a, b) => {
    const tA = a.completed_at ? new Date(a.completed_at).getTime() : 0
    const tB = b.completed_at ? new Date(b.completed_at).getTime() : 0
    return tB - tA
  })[0]
  const latestRevisionText = latestRevision?.completed_at
    ? `${chapters.find(c => c.id === latestRevision.chapter_id)?.name || 'Ch'} (Day ${latestRevision.revision_day})`
    : 'None'

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden h-auto min-h-[220px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            {friend.avatar_url ? (
              <img src={friend.avatar_url} alt={friend.display_name || 'Friend'} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {(friend.display_name || friend.email).charAt(0).toUpperCase()}
              </div>
            )}
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${isOnline ? 'bg-green-500' : 'bg-muted-foreground'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground tracking-tight flex items-center gap-2">
              {friend.display_name || friend.email.split('@')[0]}
              <span className="text-xs font-normal text-muted-foreground">
                {isOnline ? 'Online now' : `Active ${lastSeenStr}`}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">Friend Activity</p>
          </div>
        </div>
        <Link 
          to="/compare" 
          className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          Open Compare <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Content - Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 flex-1">
        
        {/* Left Column: Progress & Current Status */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Overall Progress</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tighter">{friendPercent}%</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Study Streak</p>
              <div className="flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
                <span className="text-xl font-bold tracking-tighter text-orange-500">{streak}</span>
                <span className="text-sm font-medium text-orange-500/80">Days</span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
            <div className="grid grid-cols-2 gap-3 items-start">
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-wider text-primary/70 mb-1 truncate">Current Chapter</p>
                <p className="font-semibold text-foreground truncate text-sm">{currentChapterName}</p>
              </div>
              
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-wider text-primary/70 mb-1 truncate">Latest Activity</p>
                {latestActivity ? (
                  <div className="flex items-center gap-1.5 font-medium text-foreground text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{latestActivity.status}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic truncate">No completed steps yet</p>
                )}
              </div>
            </div>

            {completedTodayCount > 0 && (
              <div className="pt-2 mt-3 border-t border-primary/10">
                <p className="text-xs text-muted-foreground">
                  Completed Today: <span className="font-semibold text-foreground">{completedTodayCount}</span> workflow stages
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Latest Updates */}
        <div className="space-y-2 flex flex-col justify-center border-l border-border/50 pl-4">
          <div className="group">
            <div className="flex items-center gap-1.5 mb-0.5">
              <PenTool className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground group-hover:text-primary transition-colors">Latest Note</p>
            </div>
            <p className="text-sm font-medium text-foreground truncate" title={latestNoteText}>{latestNoteText}</p>
          </div>

          <div className="group">
            <div className="flex items-center gap-1.5 mb-0.5">
              <BookOpen className="w-3.5 h-3.5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground group-hover:text-blue-500 transition-colors">Latest Revision</p>
            </div>
            <p className="text-sm font-medium text-foreground truncate" title={latestRevisionText}>{latestRevisionText}</p>
          </div>
        </div>
        
      </div>
    </div>
  )
}
