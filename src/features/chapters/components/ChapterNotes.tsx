import { useState, useEffect, useRef } from 'react'
import { FileText, Check, Bold, Italic, List, Code, Heading, ListOrdered, CheckSquare, Quote, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Note } from '@/lib/supabase/types'
import { formatRelativeTime } from '@/lib/progress'

interface ChapterNotesProps {
  note: Note | null
  onSave: (content: string) => Promise<void>
}

export function ChapterNotes({ note, onSave }: ChapterNotesProps) {
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (note?.content && !isDirty) {
      setContent(note.content)
      if (note.updated_at) {
        setLastSaved(new Date(note.updated_at))
      }
    }
  }, [note, isDirty])

  // Autosave
  useEffect(() => {
    if (!isDirty || !content) return
    const timer = setTimeout(() => {
      handleSave()
    }, 2000)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    const beforeText = content.substring(0, start)
    const afterText = content.substring(end)
    
    const newText = beforeText + prefix + selectedText + suffix + afterText
    setContent(newText)
    setIsDirty(true)
    
    // Focus and reset cursor position after React re-renders
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  
  const getSaveStatus = () => {
    if (isSaving) return <span className="text-[10px] text-blue-500 animate-pulse font-bold uppercase tracking-wider">Saving...</span>
    if (isDirty) return <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">Unsaved</span>
    if (lastSaved) return (
      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium bg-background px-2 py-0.5 rounded border border-border/50">
        <Check className="h-3 w-3 text-green-500" /> 
        Last saved {formatRelativeTime(lastSaved.toISOString())}
      </span>
    )
    return null
  }

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm h-full flex flex-col min-h-[600px]">
      <div className="w-full flex items-center justify-between px-6 py-4 bg-muted/10 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="font-semibold text-sm text-foreground">Markdown Notes</span>
        </div>
        <div className="flex items-center gap-3">
          {getSaveStatus()}
        </div>
      </div>
      
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="flex items-center gap-1 px-4 py-2 bg-muted/5 border-b border-border/30 overflow-x-auto">
          <button onClick={() => insertMarkdown('**', '**')} className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Bold"><Bold className="h-4 w-4" /></button>
          <button onClick={() => insertMarkdown('_', '_')} className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Italic"><Italic className="h-4 w-4" /></button>
          <div className="w-px h-4 bg-border/50 mx-1" />
          <button onClick={() => insertMarkdown('### ')} className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Heading"><Heading className="h-4 w-4" /></button>
          <button onClick={() => insertMarkdown('- ')} className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Bullet List"><List className="h-4 w-4" /></button>
          <button onClick={() => insertMarkdown('1. ')} className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Numbered List"><ListOrdered className="h-4 w-4" /></button>
          <button onClick={() => insertMarkdown('- [ ] ')} className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Checkbox"><CheckSquare className="h-4 w-4" /></button>
          <div className="w-px h-4 bg-border/50 mx-1" />
          <button onClick={() => insertMarkdown('> ')} className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Quote"><Quote className="h-4 w-4" /></button>
          <button onClick={() => insertMarkdown('```\n', '\n```')} className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Code Block"><Code className="h-4 w-4" /></button>
          <button onClick={() => insertMarkdown('\n---\n')} className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors" title="Horizontal Line"><Minus className="h-4 w-4" /></button>
        </div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => {
            setContent(e.target.value)
            setIsDirty(true)
          }}
          placeholder={"Start writing your study notes...\n\nUse this space for:\n• Class notes\n• Shortcuts\n• Tricks\n• Important formulas\n• Doubts\n• Revision points"}
          className="w-full flex-1 text-[14px] bg-transparent p-6 focus:ring-0 focus:outline-none resize-none placeholder:text-muted-foreground/40 font-mono leading-relaxed"
          spellCheck="false"
        />
        <div className="border-t border-border/50 px-6 py-3 flex items-center justify-between bg-muted/5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
          <span>{wordCount} words</span>
          <span>Markdown Supported</span>
        </div>
      </CardContent>
    </Card>
  )
}
