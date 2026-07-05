import { useState } from 'react'
import { MessageSquare, Trash2, Send, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatIST } from '@/lib/time'
import type { Comment } from '@/lib/supabase/types'

interface ChapterCommentsProps {
  comments: Comment[]
  currentUserId?: string
  onAddComment: (content: string) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
}

export function ChapterComments({ comments, currentUserId, onAddComment, onDeleteComment }: ChapterCommentsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setIsSubmitting(true)
    try {
      await onAddComment(content)
      setContent('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          <span className="font-bold text-sm uppercase tracking-wider text-foreground">Discussion</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            {comments.length} Comments
          </span>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <CardContent className="p-4 border-t border-border/50 space-y-6">
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Ask a question or share a thought..."
                className="w-full text-sm rounded-xl border border-border/50 bg-muted/30 p-4 pr-12 min-h-[80px] resize-y focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="absolute right-3 bottom-3 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-sm font-medium text-muted-foreground text-center py-6 border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                  No comments yet. Start the discussion!
                </div>
              ) : (
                comments.map(comment => {
                  const isAuthor = comment.user_id === currentUserId
                  return (
                    <div key={comment.id} className="flex gap-4 p-4 bg-background rounded-xl border border-border/50 shadow-sm transition-colors hover:border-primary/20">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary shrink-0 shadow-inner">
                        {(comment as any).profiles?.display_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">
                              {(comment as any).profiles?.display_name || 'User'}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                              {formatIST(new Date(comment.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          {isAuthor && (
                            <button
                              onClick={() => onDeleteComment(comment.id)}
                              className="text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
