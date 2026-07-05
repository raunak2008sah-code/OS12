import { useState, useRef } from 'react'
import { MessageSquare, Trash2, Send, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatIST } from '@/lib/time'
import type { Comment } from '@/lib/supabase/types'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { cn } from '@/lib/utils'

interface ChapterCommentsProps {
  comments: Comment[]
  currentUserId?: string
  onAddComment: (content: string) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
}

export function ChapterComments({ comments, currentUserId, onAddComment, onDeleteComment }: ChapterCommentsProps) {
  const [isExpanded, setIsExpanded] = useLocalStorage('os12-comments-expanded', true)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!content.trim()) return
    setIsSubmitting(true)
    try {
      await onAddComment(content)
      setContent('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <span className="font-semibold text-sm text-foreground">Discussion</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            {comments.length} Comments
          </span>
          <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isExpanded && "rotate-90")} />
        </div>
      </button>

      <div className={cn("grid transition-all duration-300", isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <CardContent className="p-3 border-t border-border/50 space-y-4">
            <div className="relative flex items-end gap-2 bg-muted/30 rounded-xl border border-border/50 p-1.5 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or share a thought..."
                className="w-full text-sm bg-transparent p-2 min-h-[40px] max-h-[200px] resize-none outline-none placeholder:text-muted-foreground/50"
                rows={1}
                required
              />
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting || !content.trim()}
                className="shrink-0 p-2 h-9 w-9 flex items-center justify-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm mb-0.5"
              >
                <Send className="h-3.5 w-3.5 ml-0.5" />
              </button>
            </div>

            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="text-xs font-medium text-muted-foreground text-center py-6 border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                  No comments yet. Start the discussion!
                </div>
              ) : (
                comments.map(comment => {
                  const isAuthor = comment.user_id === currentUserId
                  return (
                    <div key={comment.id} className="flex gap-3 group">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0 mt-0.5">
                        {(comment as any).profiles?.display_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0 bg-background rounded-2xl rounded-tl-none border border-border/50 p-3 shadow-sm transition-colors hover:border-primary/20 relative">
                        <div className="flex justify-between items-start gap-4 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold text-foreground truncate">
                              {(comment as any).profiles?.display_name || 'User'}
                            </span>
                            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider shrink-0">
                              {formatIST(new Date(comment.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          {isAuthor && (
                            <button
                              onClick={() => onDeleteComment(comment.id)}
                              className="text-muted-foreground/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all -mt-1 -mr-1 p-1"
                              title="Delete comment"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
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
