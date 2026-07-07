import { Check, ChevronRight, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { cn } from '@/lib/utils'

interface ChapterWorkflowProps {
  currentStatus: string
  onStatusChange: (status: any) => void
  stages: string[]
}

export function ChapterWorkflow({ currentStatus, onStatusChange, stages }: ChapterWorkflowProps) {
  const [isExpanded, setIsExpanded] = useLocalStorage('os12-workflow-expanded', true)
  const currentIndex = stages.indexOf(currentStatus)
  const safeIndex = currentIndex === -1 ? 0 : currentIndex

  const completionPercent = Math.round(((safeIndex + (currentStatus === 'Done' ? 1 : 0)) / stages.length) * 100)

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">Workflow Tracker</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            {completionPercent}%
          </span>
          <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isExpanded && "rotate-90")} />
        </div>
      </button>
      
      <div className={cn("grid transition-all duration-300", isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <CardContent className="p-3 border-t border-border/50">
            <div className="flex flex-col relative space-y-0.5">
              {/* Vertical timeline line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border/50" />
              
              {stages.map((stage, idx) => {
                const isCompleted = idx < safeIndex || (stage === 'Done' && safeIndex === stages.length - 1)
                const isCurrent = idx === safeIndex
                
                let buttonStyle = 'text-muted-foreground/60 hover:bg-muted/50 hover:text-foreground'
                let iconStyle = 'bg-background border border-border/50 text-transparent'
                
                if (isCompleted) {
                  buttonStyle = 'text-foreground/90 hover:bg-muted/50'
                  iconStyle = 'bg-green-500/20 border-green-500 text-green-500'
                } else if (isCurrent) {
                  buttonStyle = 'bg-primary/5 text-primary hover:bg-primary/10 font-semibold'
                  iconStyle = 'bg-background border-2 border-primary text-primary shadow-sm'
                }

                return (
                  <button
                    key={stage}
                    onClick={() => onStatusChange(stage)}
                    className={cn(
                      "group flex items-center gap-3 w-full px-2 py-1.5 h-10 rounded-lg text-left transition-all relative z-10",
                      buttonStyle
                    )}
                  >
                    <div className={cn("flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold transition-all shrink-0", iconStyle)}>
                      {isCompleted ? <Check className="h-3 w-3" /> : (idx + 1)}
                    </div>
                    <span className="text-xs truncate">
                      {stage}
                    </span>
                    {isCurrent && (
                      <span className="ml-auto text-[9px] uppercase font-bold tracking-wider text-primary animate-pulse">
                        Active
                      </span>
                    )}
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

