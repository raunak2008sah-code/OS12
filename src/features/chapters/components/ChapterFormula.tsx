import { useState, useEffect } from 'react'
import { BookOpen, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FormulaSheet } from '@/lib/supabase/types'

interface ChapterFormulaProps {
  formulaSheet: FormulaSheet | null
  onSave: (content: string) => Promise<void>
}

export function ChapterFormula({ formulaSheet, onSave }: ChapterFormulaProps) {
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (formulaSheet?.content && !isDirty) {
      setContent(formulaSheet.content)
    }
  }, [formulaSheet, isDirty])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(content)
      setIsDirty(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4 flex flex-row items-center justify-between shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-500" />
          Formula Sheet
        </CardTitle>
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <Save className="h-3.5 w-3.5" />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <textarea
          value={content}
          onChange={e => {
            setContent(e.target.value)
            setIsDirty(true)
          }}
          placeholder="Jot down important formulas, shortcuts, and key derivations here..."
          className="w-full h-full min-h-[250px] text-sm rounded-lg border border-border bg-background/50 p-4 focus:ring-1 focus:ring-primary outline-none font-mono resize-y"
        />
      </CardContent>
    </Card>
  )
}
