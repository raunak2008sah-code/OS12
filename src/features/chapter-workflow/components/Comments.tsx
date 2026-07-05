import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useComments, useAddComment, useDeleteComment } from '@/lib/supabase/queries'
import { Send, Trash2, Loader2, MessageSquare } from 'lucide-react'

// Simple relative time formatter
function getRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export function Comments({ chapterId }: { chapterId: string }) {
  const { user } = useAuth()
  const { data: comments, isLoading } = useComments(chapterId)
  const { mutate: addComment, isPending: isAdding } = useAddComment()
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment()
  
  const [newComment, setNewComment] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return
    
    addComment({ chapterId, userId: user.id, content: newComment }, {
      onSuccess: () => setNewComment('')
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-6 py-4">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold tracking-tight text-foreground">Community Discussion</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        {!comments?.length ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No comments yet. Start the discussion!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-semibold text-primary">
                    {comment.profiles?.display_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {comment.profiles?.display_name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(comment.created_at)}
                      </span>
                    </div>
                    
                    {user?.id === comment.user_id && (
                      <button 
                        onClick={() => deleteComment({ commentId: comment.id, userId: user.id })}
                        disabled={isDeleting}
                        className="text-muted-foreground transition-colors hover:text-destructive focus:outline-none"
                        title="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border bg-muted/10 p-4">
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
          <button 
            type="submit" 
            disabled={!newComment.trim() || isAdding}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-[-2px]" />}
          </button>
        </form>
      </div>
    </div>
  )
}
