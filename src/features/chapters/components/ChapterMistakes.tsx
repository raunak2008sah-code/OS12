import { useState } from 'react'
import { AlertTriangle, Plus, CheckCircle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatIST } from '@/lib/time'
import type { Mistake } from '@/lib/supabase/types'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { cn } from '@/lib/utils'

interface ChapterMistakesProps {
  mistakes: Mistake[]
  onAddMistake: (content: string, tags: string[]) => Promise<void>
  onToggleResolved: (mistakeId: string, isResolved: boolean) => Promise<void>
}

export function ChapterMistakes({ mistakes, onAddMistake, onToggleResolved }: ChapterMistakesProps) {
  const [isExpanded, setIsExpanded] = useLocalStorage('os12-mistakes-expanded', true)
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
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="font-semibold text-sm text-foreground">Mistake Log</span>
        </div>
        <div className="flex items-center gap-3">
          {unresolvedCount > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20">
              {unresolvedCount} Pending
            </span>
          )}
          <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isExpanded && "rotate-90")} />
        </div>
      </button>

      <div className={cn("grid transition-all duration-300", isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <CardContent className="p-3 border-t border-border/50 space-y-3">
            <div className="flex justify-end">
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Log Mistake
              </button>
            </div>

            {isAdding && (
              <form onSubmit={handleSubmit} className="p-3 bg-background rounded-xl border border-border/50 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <select 
                    value={tag} 
                    onChange={e => setTag(e.target.value)}
                    className="text-[13px] rounded-lg border-border/50 bg-muted/30 p-2 focus:ring-1 focus:ring-primary outline-none w-full sm:w-[160px] font-medium"
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
                    placeholder="What went wrong? Why did it happen?"
                    className="w-full flex-1 text-[13px] rounded-lg border-border/50 bg-muted/30 p-2 min-h-[60px] resize-y focus:ring-1 focus:ring-primary outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1 border-border/30">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !content.trim()}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Log'}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mistakes.length === 0 ? (
                <div className="md:col-span-2 text-xs font-medium text-muted-foreground text-center py-6 border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                  No mistakes logged yet. Perfect!
                </div>
              ) : (
                mistakes.map(mistake => (
                  <div key={mistake.id} className={cn("p-3 rounded-xl border transition-colors flex flex-col gap-2", mistake.is_resolved ? 'bg-muted/30 border-border/30' : 'bg-background border-red-500/20 shadow-sm hover:border-red-500/40')}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        {mistake.tags.map(t => (
                          <span key={t} className={cn("px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider truncate", mistake.is_resolved ? 'bg-muted text-muted-foreground' : 'bg-red-500/10 text-red-500')}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider shrink-0 mt-0.5">
                        {formatIST(new Date(mistake.created_at), 'MMM d')}
                      </span>
                    </div>
                    <p className={cn("text-[13px] leading-relaxed whitespace-pre-wrap break-words flex-1", mistake.is_resolved ? 'text-muted-foreground line-through' : 'text-foreground/90')}>
                      {mistake.content}
                    </p>
                    <div className="flex justify-end pt-1 mt-auto border-t border-border/30">
                      <button
                        onClick={() => onToggleResolved(mistake.id, !mistake.is_resolved)}
                        className={cn("shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-colors", mistake.is_resolved ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : 'bg-muted text-muted-foreground hover:bg-foreground hover:text-background')}
                      >
                        <CheckCircle className="h-3 w-3" />
                        {mistake.is_resolved ? 'Resolved' : 'Resolve'}
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
