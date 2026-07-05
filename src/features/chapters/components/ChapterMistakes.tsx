import { useState } from 'react'
import { AlertTriangle, Plus, CheckCircle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatIST } from '@/lib/time'
import type { Mistake } from '@/lib/supabase/types'

interface ChapterMistakesProps {
  mistakes: Mistake[]
  onAddMistake: (content: string, tags: string[]) => Promise<void>
  onToggleResolved: (mistakeId: string, isResolved: boolean) => Promise<void>
}

export function ChapterMistakes({ mistakes, onAddMistake, onToggleResolved }: ChapterMistakesProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
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
      setIsAdding(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const unresolvedCount = mistakes.filter(m => !m.is_resolved).length

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 transition-all duration-300">
      <div className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors group cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="font-bold text-sm uppercase tracking-wider text-foreground">Mistake Log</span>
        </div>
        <div className="flex items-center gap-3">
          {unresolvedCount > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
              {unresolvedCount} Pending
            </span>
          )}
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <CardContent className="p-4 border-t border-border/50 space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Log Mistake
              </button>
            </div>

            {isAdding && (
              <form onSubmit={handleSubmit} className="p-4 bg-background rounded-xl border border-border/50 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">New Log</h4>
                </div>
                <div className="flex flex-col gap-3">
                  <select 
                    value={tag} 
                    onChange={e => setTag(e.target.value)}
                    className="text-sm rounded-lg border-border/50 bg-muted/30 p-2 focus:ring-1 focus:ring-primary outline-none w-full sm:w-auto font-medium"
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
                    placeholder="What went wrong? Why did it happen? How will you prevent it?"
                    className="w-full text-sm rounded-lg border-border/50 bg-muted/30 p-3 min-h-[100px] resize-y focus:ring-1 focus:ring-primary outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !content.trim()}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Log'}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {mistakes.length === 0 ? (
                <div className="text-sm font-medium text-muted-foreground text-center py-6 border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                  No mistakes logged yet. Perfect!
                </div>
              ) : (
                mistakes.map(mistake => (
                  <div key={mistake.id} className={`p-4 rounded-xl border transition-colors ${mistake.is_resolved ? 'bg-muted/30 border-border/30' : 'bg-background border-red-500/20 shadow-sm'}`}>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {mistake.tags.map(t => (
                            <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${mistake.is_resolved ? 'bg-muted text-muted-foreground' : 'bg-red-500/10 text-red-500'}`}>
                              {t}
                            </span>
                          ))}
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            {formatIST(new Date(mistake.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${mistake.is_resolved ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {mistake.content}
                        </p>
                      </div>
                      <button
                        onClick={() => onToggleResolved(mistake.id, !mistake.is_resolved)}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider transition-colors ${
                          mistake.is_resolved 
                            ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' 
                            : 'bg-muted text-muted-foreground hover:bg-foreground hover:text-background'
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
        </div>
      </div>
    </Card>
  )
}
