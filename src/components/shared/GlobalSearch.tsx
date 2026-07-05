import { useState, useEffect, useRef } from 'react'
import { Search, X, Book, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSubjects, useChapters } from '@/lib/supabase/queries'

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const { data: subjects } = useSubjects()
  const { data: chapters } = useChapters()

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

  // Simple fuzzy search
  const lowerQuery = query.toLowerCase()
  const matchedSubjects = subjects?.filter(s => s.name.toLowerCase().includes(lowerQuery)) || []
  const matchedChapters = chapters?.filter(c => c.name?.toLowerCase().includes(lowerQuery)) || []
  
  const handleSelect = (path: string) => {
    setIsOpen(false)
    navigate(path)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg"
            placeholder="Search subjects, chapters..."
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
              <p>Type to search across the curriculum</p>
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
                      const subject = subjects?.find(s => s.id === chap.subject_id)
                      return (
                        <button
                          key={chap.id}
                          onClick={() => handleSelect(`/subjects/go/${chap.id}`)}
                          className="w-full flex flex-col items-start px-3 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="font-medium">{chap.name}</span>
                          </div>
                          {subject && <span className="text-xs text-muted-foreground ml-6">{subject.name}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {matchedSubjects.length === 0 && matchedChapters.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No results found for "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-muted/30 border-t border-border px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Use</span>
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-background font-mono font-medium shadow-sm">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-background font-mono font-medium shadow-sm">↓</kbd>
            <span>to navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-background font-mono font-medium shadow-sm">Enter</kbd>
            <span>to select</span>
          </div>
        </div>
      </div>
    </div>
  )
}
