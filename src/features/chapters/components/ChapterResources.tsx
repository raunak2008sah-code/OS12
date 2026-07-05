import { useState } from 'react'
import { BookOpen, CheckCircle2, Circle, PenTool, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { ResourceProgress } from '@/lib/supabase/types'

interface ChapterResourcesProps {
  resources: { id: string; name: string }[]
  progress: (ResourceProgress & { resources: { name: string } | null })[]
  onToggle: (resourceId: string, status: string) => void
}

export function ChapterResources({ resources, progress, onToggle }: ChapterResourcesProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const completedCount = resources.filter(res => {
    const currentProgress = progress.find(p => p.resource_id === res.id)
    return currentProgress?.status === 'completed'
  }).length

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm uppercase tracking-wider text-foreground">Resources</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            {completedCount} / {resources.length}
          </span>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </button>
      
      <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <CardContent className="p-4 border-t border-border/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resources.map(res => {
                const currentProgress = progress.find(p => p.resource_id === res.id)
                const status = currentProgress?.status || 'pending'
                
                const nextStatus = status === 'pending' ? 'in_progress' : status === 'in_progress' ? 'completed' : 'pending'
                
                let badgeStyle = 'bg-background border-border/50 text-muted-foreground hover:border-primary/50'
                let Icon = Circle
                
                if (status === 'completed') {
                  badgeStyle = 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
                  Icon = CheckCircle2
                } else if (status === 'in_progress') {
                  badgeStyle = 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                  Icon = PenTool
                }

                return (
                  <button
                    key={res.id}
                    onClick={() => onToggle(res.id, nextStatus)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${badgeStyle}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="font-semibold text-sm truncate">{res.name}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 shrink-0 ml-2">
                      {status.replace('_', ' ')}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
