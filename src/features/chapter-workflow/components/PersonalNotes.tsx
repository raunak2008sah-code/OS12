import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotes, useSaveNote } from '@/lib/supabase/queries'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export function PersonalNotes({ chapterId }: { chapterId: string }) {
  const { user } = useAuth()
  const { data: note, isLoading } = useNotes(chapterId, user?.id)
  const { mutate: saveNote } = useSaveNote()
  
  const [content, setContent] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  
  // Debounce timeout ref
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!isLoading && !hasInitialized.current) {
      if (note) {
        setContent(note.content || '')
      }
      setIsDirty(false)
      hasInitialized.current = true
    }
  }, [note, isLoading])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  // Auto-save logic
  useEffect(() => {
    if (!isDirty || !user) return

    setSaveStatus('saving')
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(
        { chapterId, userId: user.id, content },
        {
          onSuccess: () => {
            setSaveStatus('saved')
            setIsDirty(false)
            setTimeout(() => setSaveStatus('idle'), 2000)
          },
          onError: () => setSaveStatus('error')
        }
      )
    }, 1000) // 1 second debounce
    
  }, [content, isDirty, chapterId, user, saveNote])

  // Prevent accidental navigation if unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = '' // Modern browsers require this
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
        <h3 className="font-medium tracking-tight text-foreground">Personal Notes</h3>
        
        <div className="flex items-center gap-2 text-xs font-medium">
          {saveStatus === 'saving' && (
            <span className="flex items-center text-muted-foreground"><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center text-emerald-500"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center text-destructive"><AlertCircle className="mr-1.5 h-3.5 w-3.5" /> Save failed</span>
          )}
          {saveStatus === 'idle' && note?.updated_at && (
            <span className="text-muted-foreground">
              Last edited {new Date(note.updated_at).toLocaleString()}
            </span>
          )}
        </div>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          setIsDirty(true)
        }}
        placeholder="Write your markdown notes here..."
        className="min-h-[300px] w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-foreground focus:outline-none placeholder:text-muted-foreground/60"
        spellCheck="false"
      />
    </div>
  )
}
