import { useState } from 'react'
import { BookOpen, CheckCircle2, Circle, PenTool, ChevronRight, ChevronDown, Clock, FileText, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { ResourceProgress } from '@/lib/supabase/types'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ChapterResourcesProps {
  resources: { id: string; name?: string; resource_name?: string; title?: string }[]
  progress: (ResourceProgress & { resources: { name?: string; resource_name?: string; title?: string } | null })[]
  onToggle: (resourceId: string, status: string) => void
}

export function ChapterResources({ resources, progress, onToggle }: ChapterResourcesProps) {
  const [isExpanded, setIsExpanded] = useLocalStorage('os12-resources-expanded', true)
  const [expandedResourceId, setExpandedResourceId] = useState<string | null>(null)

  const completedCount = resources.filter(res => {
    const currentProgress = progress.find(p => p.resource_id === res.id)
    return currentProgress?.status === 'completed'
  }).length

  const completionPercent = resources.length ? Math.round((completedCount / resources.length) * 100) : 0

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">Resources</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              {completedCount} / {resources.length} completed
            </span>
            <span className="text-xs font-semibold text-primary">{completionPercent}%</span>
            <Progress value={completionPercent} className="w-12 h-1.5 hidden sm:block" />
          </div>
          <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isExpanded && "rotate-90")} />
        </div>
      </button>
      
      <div className={cn("grid transition-all duration-300", isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <CardContent className="p-3 border-t border-border/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {resources.map(res => {
                const currentProgress = progress.find(p => p.resource_id === res.id)
                const status = currentProgress?.status || 'pending'
                const nextStatus = status === 'pending' ? 'in_progress' : status === 'in_progress' ? 'completed' : 'pending'
                
                let badgeStyle = 'bg-background border-border/50 hover:border-primary/50 text-muted-foreground'
                let Icon = Circle
                let statusText = 'Not Started'
                
                if (status === 'completed') {
                  badgeStyle = 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
                  Icon = CheckCircle2
                  statusText = 'Completed'
                } else if (status === 'in_progress') {
                  badgeStyle = 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-sm'
                  Icon = PenTool
                  statusText = 'In Progress'
                }

                const isCardExpanded = expandedResourceId === res.id

                return (
                  <div 
                    key={res.id} 
                    className={cn(
                      "flex flex-col rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer group",
                      badgeStyle,
                      isCardExpanded && "col-span-1 sm:col-span-2 lg:col-span-3 shadow-md"
                    )}
                  >
                    <div 
                      className="flex flex-col gap-1 p-3"
                      onClick={() => setExpandedResourceId(isCardExpanded ? null : res.id)}
                    >
                      <div className="flex items-start gap-2.5">
                        <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="font-medium text-sm break-words group-hover:text-foreground transition-colors">{res.name || res.resource_name || res.title || 'Unnamed Resource'}</span>
                          <span className="text-xs text-muted-foreground font-medium opacity-80">
                            {statusText}
                          </span>
                        </div>
                        <div 
                          className="p-1 hover:bg-foreground/10 rounded-md transition-colors shrink-0 self-start"
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggle(res.id, nextStatus)
                          }}
                        >
                          <ChevronDown className={cn("h-3.5 w-3.5 opacity-50", isCardExpanded && "rotate-180")} />
                        </div>
                      </div>
                    </div>

                    {isCardExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-border/30 text-xs animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="flex flex-col gap-1 p-2 bg-background/50 rounded-lg">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3"/> Est. Time</span>
                            <span className="font-medium text-foreground">45 mins</span>
                          </div>
                          <div className="flex flex-col gap-1 p-2 bg-background/50 rounded-lg">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3"/> Notes</span>
                            <span className="font-medium text-foreground">0 attached</span>
                          </div>
                          <div className="flex flex-col gap-1 p-2 bg-background/50 rounded-lg">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Mistakes</span>
                            <span className="font-medium text-foreground">0 logged</span>
                          </div>
                          <div className="flex items-center justify-center p-2">
                             <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggle(res.id, nextStatus)
                                }}
                                className="w-full px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 text-foreground font-semibold rounded-md transition-colors"
                              >
                                {status === 'completed' ? 'Mark Incomplete' : status === 'in_progress' ? 'Mark Completed' : 'Start Working'}
                             </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
