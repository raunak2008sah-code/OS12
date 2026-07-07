import { useState, useEffect, useRef } from 'react'
import { Search, Book, Target, FileText, Settings, Map, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { 
  useSubjects, 
  useChapters, 
  useAllNotes
} from '@/lib/supabase/queries'

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id

  const { data: subjects = [] } = useSubjects()
  const { data: chapters = [] } = useChapters()
  const { data: notes = [] } = useAllNotes(userId)

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
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  const lowerQuery = query.toLowerCase()
  
  // Aggregate all results into a single flat list for keyboard navigation
  const results: any[] = []

  if (query.length > 0) {
    // 1. Core pages
    const pages = [
      { id: 'p1', type: 'Page', title: 'Roadmap', path: '/roadmap', icon: Map, color: 'text-blue-500' },
      { id: 'p2', type: 'Page', title: 'Settings', path: '/settings', icon: Settings, color: 'text-gray-500' }
    ].filter(p => p.title.toLowerCase().includes(lowerQuery))
    results.push(...pages)

    // 2. Subjects
    subjects.filter(s => s.name.toLowerCase().includes(lowerQuery)).forEach(s => {
      results.push({ id: s.id, type: 'Subject', title: s.name, path: `/subjects/${s.id}`, icon: Book, color: 'text-primary' })
    })

    // 3. Chapters
    chapters.filter(c => c.name?.toLowerCase().includes(lowerQuery)).forEach(c => {
      const subject = subjects.find(s => s.id === c.subject_id)
      results.push({ id: c.id, type: 'Chapter', title: c.name, subtitle: subject?.name, path: `/chapters/${c.id}`, icon: Target, color: 'text-blue-500' })
    })

    // 4. Notes
    notes.filter(n => n.content?.toLowerCase().includes(lowerQuery)).forEach(n => {
      const chap = chapters.find(c => c.id === n.chapter_id)
      results.push({ id: n.id, type: 'Note', title: n.content?.substring(0, 50) + '...', subtitle: chap?.name, path: `/chapters/${n.chapter_id}`, icon: FileText, color: 'text-green-500' })
    })


  }

  const handleSelect = (path: string) => {
    setIsOpen(false)
    navigate(path)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length))
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault()
        handleSelect(results[selectedIndex].path)
      }
    }
    window.addEventListener('keydown', handleNavigation)
    return () => window.removeEventListener('keydown', handleNavigation)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, results, selectedIndex])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] bg-background/80 backdrop-blur-xl">
      <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-2xl rounded-2xl border border-border/60 bg-card/95 backdrop-blur-md shadow-[0_12px_48px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in zoom-in-[0.97] duration-[220ms] ease-[cubic-bezier(0,0,0.2,1)]">
        {/* Input area */}
        <div className="flex items-center border-b border-border/50 px-4 py-4">
          <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg"
            placeholder="Search subjects, chapters, notes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border/60 bg-muted/30 px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
            <span className="text-xs">esc</span>
          </kbd>
        </div>

        {/* Results area */}
        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
          {query.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground/70">
              Type to search across OS12
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground/70">
              No results found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, index) => {
                const Icon = item.icon
                const isSelected = index === selectedIndex
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item.path)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors duration-[150ms] text-left group animate-in fade-in slide-in-from-bottom-2 ${
                      isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/40 text-foreground'
                    }`}
                    style={{ animationDuration: '220ms', animationDelay: `${Math.min(index * 20, 120)}ms`, animationFillMode: 'both' }}
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`p-1.5 rounded-md ${isSelected ? 'bg-primary/20' : 'bg-muted'} ${item.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="font-semibold text-sm truncate">{item.title}</span>
                        {item.subtitle && (
                          <span className={`text-xs truncate ${isSelected ? 'text-primary/70' : 'text-muted-foreground'}`}>
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {item.type}
                      </span>
                      {isSelected && <ExternalLink className="h-4 w-4 opacity-50" />}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-border/50 px-4 py-3 bg-muted/10 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/50 font-mono">↓</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/50 font-mono">↑</kbd>
            <span>to navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/50 font-mono">↵</kbd>
            <span>to open</span>
          </div>
        </div>
      </div>
    </div>
  )
}
