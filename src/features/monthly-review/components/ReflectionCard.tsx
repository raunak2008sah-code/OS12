import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useMonthlyProgress, useSaveMonthlyProgress } from '@/lib/supabase/queries'
import { CheckCircle2, AlertCircle, Loader2, Sparkles, AlertTriangle, BookOpen, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReflectionCardProps {
  month: string // e.g., '2026-07-01'
}

export function ReflectionCard({ month }: ReflectionCardProps) {
  const { user } = useAuth()
  const { data: progress, isLoading } = useMonthlyProgress(user?.id, month)
  const { mutate: saveProgress } = useSaveMonthlyProgress()
  
  const [formData, setFormData] = useState({
    went_well: '',
    didnt_go_well: '',
    lessons_learned: '',
    goals_next_month: ''
  })
  const [isDirty, setIsDirty] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  
  // Debounce timeout ref
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!isLoading && !hasInitialized.current) {
      if (progress) {
        setFormData({
          went_well: progress.went_well || '',
          didnt_go_well: progress.didnt_go_well || '',
          lessons_learned: progress.lessons_learned || '',
          goals_next_month: progress.goals_next_month || ''
        })
      }
      setIsDirty(false)
      hasInitialized.current = true
    }
  }, [progress, isLoading])

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
      saveProgress(
        { userId: user.id, month, data: formData },
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
    
  }, [formData, isDirty, month, user, saveProgress])

  // Prevent accidental navigation if unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-border bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const sections = [
    { id: 'went_well', label: 'Wins This Month', icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'didnt_go_well', label: 'Problems Faced', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 'lessons_learned', label: 'Lessons Learned', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'goals_next_month', label: 'Goals For Next Month', icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ] as const

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
        <h3 className="font-semibold tracking-tight text-foreground">Monthly Reflection</h3>
        
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
          {saveStatus === 'idle' && progress?.updated_at && (
            <span className="text-muted-foreground">
              Last edited {new Date(progress.updated_at).toLocaleString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="grid gap-px bg-border sm:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <div key={section.id} className="bg-card p-6 focus-within:ring-2 focus-within:ring-primary focus-within:z-10 relative">
              <div className="mb-4 flex items-center gap-3">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", section.bg, section.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <label htmlFor={section.id} className="font-medium text-foreground">
                  {section.label}
                </label>
              </div>
              <textarea
                id={section.id}
                value={formData[section.id]}
                onChange={(e) => handleChange(section.id, e.target.value)}
                placeholder={`What are your ${section.label.toLowerCase()}?`}
                className="min-h-[120px] w-full resize-y bg-transparent text-sm leading-relaxed text-foreground focus:outline-none placeholder:text-muted-foreground/60"
                spellCheck="false"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
