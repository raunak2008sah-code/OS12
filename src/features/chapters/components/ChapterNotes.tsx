import { useState, useEffect } from 'react'
import { FileText, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Note } from '@/lib/supabase/types'

interface ChapterNotesProps {
  note: Note | null
  onSave: (content: string) => Promise<void>
}

export function ChapterNotes({ note, onSave }: ChapterNotesProps) {
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (note?.content && !isDirty) {
      setContent(note.content)
    }
  }, [note, isDirty])

  // Optional: Auto-save could be added here using a debounced effect
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (isDirty) handleSave()
  //   }, 5000)
  //   return () => clearTimeout(timer)
  // }, [content, isDirty])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(content)
      setIsDirty(false)
    } finally {
      setIsSaving(false)
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4 flex flex-row items-center justify-between shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Notes
        </CardTitle>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">{wordCount} words</span>
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[400px]">
        <textarea
          value={content}
          onChange={e => {
            setContent(e.target.value)
            setIsDirty(true)
          }}
          placeholder="Start writing your chapter notes here. Markdown is supported..."
          className="w-full h-full min-h-[350px] text-sm rounded-lg border border-border bg-background/50 p-4 focus:ring-1 focus:ring-primary outline-none resize-y"
        />
      </CardContent>
    </Card>
  )
}
