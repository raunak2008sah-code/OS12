import { useState } from 'react'
import { AlertTriangle, Plus, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Mistake } from '@/lib/supabase/types'

interface ChapterMistakesProps {
  mistakes: Mistake[]
  onAddMistake: (content: string, tags: string[]) => Promise<void>
  onToggleResolved: (mistakeId: string, isResolved: boolean) => Promise<void>
}

export function ChapterMistakes({ mistakes, onAddMistake, onToggleResolved }: ChapterMistakesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState('')
  const [tag, setTag] = useState('conceptual')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setIsSubmitting(true)
    try {
      await onAddMistake(content, [tag])
      setContent('')
      setIsOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Mistake Notebook
        </CardTitle>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Log Mistake
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOpen && (
          <form onSubmit={handleSubmit} className="p-4 bg-muted/50 rounded-xl border space-y-3">
            <h4 className="text-sm font-semibold">New Mistake Log</h4>
            <div className="flex flex-col gap-2">
              <select 
                value={tag} 
                onChange={e => setTag(e.target.value)}
                className="text-sm rounded-md border-border bg-background p-2 focus:ring-1 focus:ring-primary outline-none w-full sm:w-auto"
              >
                <option value="conceptual">Conceptual Error</option>
                <option value="calculation">Calculation Mistake</option>
                <option value="silly">Silly Mistake</option>
                <option value="memory">Formula/Memory Issue</option>
                <option value="reading">Question Reading Error</option>
              </select>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Describe the mistake, reason, and preventive measure..."
                className="w-full text-sm rounded-md border-border bg-background p-3 min-h-[100px] resize-y focus:ring-1 focus:ring-primary outline-none"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || !content.trim()}
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Log'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {mistakes.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
              No mistakes logged for this chapter. Great job!
            </div>
          ) : (
            mistakes.map(mistake => (
              <div key={mistake.id} className={`p-4 rounded-xl border ${mistake.is_resolved ? 'bg-muted/30 border-border/50' : 'bg-card border-red-500/20'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {mistake.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500">
                          {t}
                        </span>
                      ))}
                      <span className="text-xs text-muted-foreground">
                        {new Date(mistake.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm whitespace-pre-wrap ${mistake.is_resolved ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {mistake.content}
                    </p>
                  </div>
                  <button
                    onClick={() => onToggleResolved(mistake.id, !mistake.is_resolved)}
                    className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                      mistake.is_resolved 
                        ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' 
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {mistake.is_resolved ? 'Resolved' : 'Mark Resolved'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
