import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, Settings, TrendingUp, Users, FileText } from 'lucide-react'
import { useSubjects, useChapters } from '@/lib/supabase/queries'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { data: subjects = [] } = useSubjects()
  const { data: chapters = [] } = useChapters()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) return null

  // Filter logic
  const lowerQuery = query.toLowerCase()
  const filteredSubjects = subjects.filter(s => s.name.toLowerCase().includes(lowerQuery))
  const filteredChapters = chapters.filter(c => c.name.toLowerCase().includes(lowerQuery))
  
  const handleSelect = (path: string) => {
    navigate(path)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Palette */}
      <div className="relative w-full max-w-2xl bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-border/50 px-3">
          <Search className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
          <input
            autoFocus
            className="flex h-14 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground text-foreground border-none ring-0 focus:ring-0"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">esc</span>
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {query === '' && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Search for subjects, chapters, notes, or quick commands.
            </div>
          )}

          {query !== '' && filteredSubjects.length === 0 && filteredChapters.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {filteredSubjects.length > 0 && (
            <div className="mb-4">
              <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subjects</h4>
              {filteredSubjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelect(`/subjects/${s.id}`)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-left"
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {filteredChapters.length > 0 && (
            <div className="mb-4">
              <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chapters</h4>
              {filteredChapters.map(c => {
                const subject = subjects.find(s => s.id === c.subject_id)
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(`/chapters/${c.id}`)}
                    className="w-full flex items-center justify-between px-2 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </div>
                    {subject && (
                      <span className="text-xs text-muted-foreground shrink-0 ml-2 bg-muted px-2 py-0.5 rounded-md">
                        {subject.name}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Quick Actions always show if matching */}
          {query !== '' && (
            <div>
              <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Links</h4>
              {[{ name: 'Progress Hub', path: '/progress', icon: TrendingUp }, { name: 'Compare', path: '/compare', icon: Users }, { name: 'Settings', path: '/settings', icon: Settings }].filter(l => l.name.toLowerCase().includes(lowerQuery)).map(link => (
                <button
                  key={link.name}
                  onClick={() => handleSelect(link.path)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-left"
                >
                  <link.icon className="w-4 h-4 shrink-0" />
                  {link.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
