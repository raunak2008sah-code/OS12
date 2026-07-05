import { useState, useEffect } from 'react'
import { Zap, ChevronRight, Check, Bold, Italic, Type, Sigma } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { FormulaSheet } from '@/lib/supabase/types'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { cn } from '@/lib/utils'

interface ChapterFormulaProps {
  formulaSheet: FormulaSheet | null
  onSave: (content: string) => Promise<void>
}

export function ChapterFormula({ formulaSheet, onSave }: ChapterFormulaProps) {
  const [isExpanded, setIsExpanded] = useLocalStorage('os12-formula-expanded', true)
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    if (formulaSheet?.content && !isDirty) {
      setContent(formulaSheet.content)
    }
  }, [formulaSheet, isDirty])

  // Autosave
  useEffect(() => {
    if (!isDirty || !content) return
    const timer = setTimeout(() => {
      handleSave()
    }, 2000)
    return () => clearTimeout(timer)
  }, [content, isDirty])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(content)
      setIsDirty(false)
      setLastSaved(new Date())
    } finally {
      setIsSaving(false)
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 transition-all duration-300 h-full flex flex-col">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <Zap className="h-4 w-4 text-purple-500" />
          <span className="font-semibold text-sm text-foreground">Formula Sheet</span>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && !isDirty && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold bg-background px-2 py-0.5 rounded border border-border/50">
              <Check className="h-3 w-3 text-green-500" /> Saved
            </span>
          )}
          {isSaving && (
            <span className="text-[10px] text-purple-500 animate-pulse font-bold uppercase tracking-wider">
              Saving...
            </span>
          )}
          {isDirty && !isSaving && (
            <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">
              Unsaved
            </span>
          )}
          <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isExpanded && "rotate-90")} />
        </div>
      </button>
      
      <div className={cn("grid transition-all duration-300 flex-1", isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden h-full flex flex-col">
          <CardContent className="p-0 border-t border-border/50 flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center gap-1 p-2 bg-muted/10 border-b border-border/50">
              <button className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Bold (Markdown)"><Bold className="h-3.5 w-3.5" /></button>
              <button className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Italic (Markdown)"><Italic className="h-3.5 w-3.5" /></button>
              <button className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Equation (LaTeX)"><Sigma className="h-3.5 w-3.5" /></button>
              <button className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Heading (Markdown)"><Type className="h-3.5 w-3.5" /></button>
            </div>
            <textarea
              value={content}
              onChange={e => {
                setContent(e.target.value)
                setIsDirty(true)
              }}
              placeholder="Store your critical formulas and short-tricks here..."
              className="w-full flex-1 min-h-[250px] text-[13px] bg-transparent p-4 focus:ring-0 focus:outline-none resize-y placeholder:text-muted-foreground/50 font-mono leading-relaxed"
              spellCheck="false"
            />
            <div className="border-t border-border/50 px-4 py-2 flex items-center justify-between bg-muted/10 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              <span>{wordCount} words</span>
              <span>LaTeX / Markdown</span>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
