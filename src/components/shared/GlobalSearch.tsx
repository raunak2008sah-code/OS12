import { useState, useEffect, useRef } from 'react'
import { Search, X, Book, Target, FileText, AlertTriangle, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { 
  useSubjects, 
  useChapters, 
  useAllNotes, 
  useMistakes, 
  useFormulaSheets 
} from '@/lib/supabase/queries'

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id

  const { data: subjects = [] } = useSubjects()
  const { data: chapters = [] } = useChapters()
  const { data: notes = [] } = useAllNotes(userId)
  const { data: mistakes = [] } = useMistakes(undefined, userId)
  const { data: formulas = [] } = useFormulaSheets(userId)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const lowerQuery = query.toLowerCase()
  const matchedSubjects = subjects.filter(s => s.name.toLowerCase().includes(lowerQuery))
  const matchedChapters = chapters.filter(c => c.name?.toLowerCase().includes(lowerQuery))
  const matchedNotes = notes.filter(n => n.content?.toLowerCase().includes(lowerQuery))
  const matchedMistakes = mistakes.filter(m => m.content?.toLowerCase().includes(lowerQuery) || m.tags.some(t => t.toLowerCase().includes(lowerQuery)))
  const matchedFormulas = formulas.filter(f => f.content?.toLowerCase().includes(lowerQuery))

  const handleSelect = (path: string) => {
    setIsOpen(false)
    navigate(path)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg"
            placeholder="Search subjects, chapters, notes, mistakes, formulas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>Type to search across the curriculum and your notes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matchedSubjects.length > 0 && (
                <div>
                  <h3 className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subjects</h3>
                  <div className="mt-1 space-y-1">
                    {matchedSubjects.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => handleSelect(`/subjects/${sub.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                      >
                        <Book className="h-4 w-4 text-primary" />
                        <span className="font-medium">{sub.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {matchedChapters.length > 0 && (
                <div>
                  <h3 className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chapters</h3>
                  <div className="mt-1 space-y-1">
                    {matchedChapters.map(chap => {
                      const subject = subjects.find(s => s.id === chap.subject_id)
                      return (
                        <button
                          key={chap.id}
                          onClick={() => handleSelect(`/chapters/${chap.id}`)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                        >
                          <Target className="h-4 w-4 text-blue-500" />
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{chap.name}</span>
                            <span className="text-xs text-muted-foreground">{subject?.name}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {matchedNotes.length > 0 && (
                <div>
                  <h3 className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</h3>
                  <div className="mt-1 space-y-1">
                    {matchedNotes.map(note => {
                      const chap = chapters.find(c => c.id === note.chapter_id)
                      return (
                        <button
                          key={note.id}
                          onClick={() => handleSelect(`/chapters/${note.chapter_id}`)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                        >
                          <FileText className="h-4 w-4 text-green-500 shrink-0" />
                          <div className="flex flex-col truncate">
                            <span className="font-medium text-sm truncate">{note.content?.substring(0, 50)}...</span>
                            <span className="text-xs text-muted-foreground">{chap?.name}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {matchedMistakes.length > 0 && (
                <div>
                  <h3 className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mistakes</h3>
                  <div className="mt-1 space-y-1">
                    {matchedMistakes.map(mistake => {
                      const chap = chapters.find(c => c.id === mistake.chapter_id)
                      return (
                        <button
                          key={mistake.id}
                          onClick={() => handleSelect(`/chapters/${mistake.chapter_id}`)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                        >
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                          <div className="flex flex-col truncate">
                            <span className="font-medium text-sm truncate">{mistake.content?.substring(0, 50)}...</span>
                            <span className="text-xs text-muted-foreground">{chap?.name}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {matchedFormulas.length > 0 && (
                <div>
                  <h3 className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Formulas</h3>
                  <div className="mt-1 space-y-1">
                    {matchedFormulas.map(formula => {
                      const chap = chapters.find(c => c.id === formula.chapter_id)
                      return (
                        <button
                          key={formula.id}
                          onClick={() => handleSelect(`/chapters/${formula.chapter_id}`)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                        >
                          <BookOpen className="h-4 w-4 text-purple-500 shrink-0" />
                          <div className="flex flex-col truncate">
                            <span className="font-medium text-sm truncate">{formula.content?.substring(0, 50)}...</span>
                            <span className="text-xs text-muted-foreground">{chap?.name}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
