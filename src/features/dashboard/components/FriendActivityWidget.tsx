import { Users, Flame, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { 
  useFriendProfile,
  useAllChapterProgress,
  useMistakes,
  useAllRevisions,
  useAllNotes,
  useFormulaSheets,
  useAllComments,
  useChapters
} from '@/lib/supabase/queries'
import { 
  subjectProgress, 
  getCurrentChapter, 
  calculateStudyStreak, 
  formatRelativeTime 
} from '@/lib/progress'

export function FriendActivityWidget() {
  const { user } = useAuth()
  const { data: friend } = useFriendProfile(user?.id)
  
  const { data: progress = [] } = useAllChapterProgress(friend?.id)
  const { data: mistakes = [] } = useMistakes(undefined, friend?.id)
  const { data: revisions = [] } = useAllRevisions(friend?.id)
  const { data: notes = [] } = useAllNotes(friend?.id)
  const { data: formulas = [] } = useFormulaSheets(friend?.id)
  const { data: comments = [] } = useAllComments(friend?.id)
  const { data: chapters = [] } = useChapters()

  if (!friend) return null

  // Calculate overall progress % using canonical formula
  const friendPercent = subjectProgress(chapters.map(c => c.id), progress)

  // Collect all timestamps for Last Seen and Streak
  const allTimestamps: string[] = []
  progress.forEach(p => { if (p.completed_at) allTimestamps.push(p.completed_at) })
  notes.forEach(n => { if (n.updated_at) allTimestamps.push(n.updated_at) })
  formulas.forEach(f => { if (f.updated_at) allTimestamps.push(f.updated_at) })
  mistakes.forEach(m => {
    if (m.updated_at) allTimestamps.push(m.updated_at)
    if (m.created_at) allTimestamps.push(m.created_at)
  })
  comments.forEach(c => { if (c.created_at) allTimestamps.push(c.created_at) })

  // Last Seen
  const sortedTimestamps = [...allTimestamps].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  const lastSeenStr = sortedTimestamps[0] ? formatRelativeTime(sortedTimestamps[0]) : 'Never'

  // Streak
  const streak = calculateStudyStreak(allTimestamps)

  // Friend Current Chapter & Last Workflow Step
  const friendCurrentInfo = getCurrentChapter(chapters, progress, notes, formulas, mistakes, comments, [])
  const currentChapterName = friendCurrentInfo?.chapter?.name || 'None'
  const lastWorkflowStep = friendCurrentInfo?.status || 'None'

  // Latest note snippet
  const latestNote = [...notes].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]
  const latestNoteText = latestNote 
    ? `${chapters.find(c => c.id === latestNote.chapter_id)?.name || 'Ch'}: ${latestNote.content ? latestNote.content.substring(0, 15) : 'Empty'}`
    : 'None'

  // Latest mistake
  const latestMistake = [...mistakes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  const latestMistakeText = latestMistake
    ? `${chapters.find(c => c.id === latestMistake.chapter_id)?.name || 'Ch'}: ${latestMistake.content.substring(0, 15)}`
    : 'None'

  // Latest revision
  const latestRevision = [...revisions].sort((a, b) => {
    const tA = a.completed_at ? new Date(a.completed_at).getTime() : 0
    const tB = b.completed_at ? new Date(b.completed_at).getTime() : 0
    return tB - tA
  })[0]
  const latestRevisionText = latestRevision?.completed_at
    ? `${chapters.find(c => c.id === latestRevision.chapter_id)?.name || 'Ch'}: Day ${latestRevision.revision_day}`
    : 'None'

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm p-5 h-[270px] justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground tracking-tight text-sm">
            👤 {friend.display_name || friend.email.split('@')[0]}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {friendPercent}% Progress
          </span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs py-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Current Chapter</span>
          <span className="font-medium text-foreground truncate">{currentChapterName}</span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Last Step</span>
          <span className="font-medium text-foreground truncate">{lastWorkflowStep}</span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Latest Note</span>
          <span className="font-medium text-foreground truncate" title={latestNoteText}>{latestNoteText}</span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Latest Mistake</span>
          <span className="font-medium text-foreground truncate" title={latestMistakeText}>{latestMistakeText}</span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Latest Revision</span>
          <span className="font-medium text-foreground truncate" title={latestRevisionText}>{latestRevisionText}</span>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Last Seen</span>
          <span className="font-medium text-foreground flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground/60" /> {lastSeenStr}
          </span>
        </div>
      </div>

      {/* Footer Streak */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
        <span className="text-muted-foreground font-medium">Study Streak</span>
        <span className="flex items-center gap-1 font-bold text-orange-500">
          <Flame className="w-4 h-4 fill-orange-500/20" /> {streak} Day{streak !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
