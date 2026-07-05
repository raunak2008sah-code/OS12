import { useState } from 'react'
import { MessageSquare, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Comment } from '@/lib/supabase/types'

interface ChapterCommentsProps {
  comments: Comment[]
  currentUserId?: string
  onAddComment: (content: string) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
}

export function ChapterComments({ comments, currentUserId, onAddComment, onDeleteComment }: ChapterCommentsProps) {
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
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Discussion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Add a comment or question..."
            className="w-full text-sm rounded-md border-border bg-background p-3 min-h-[80px] resize-y focus:ring-1 focus:ring-primary outline-none"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
              No comments yet. Start the discussion!
            </div>
          ) : (
            comments.map(comment => {
              const isAuthor = comment.user_id === currentUserId
              return (
                <div key={comment.id} className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {(comment as any).profiles?.display_name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {(comment as any).profiles?.display_name || 'User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    {isAuthor && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap pl-8">
                    {comment.content}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
