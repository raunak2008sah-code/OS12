import { useState } from 'react'
import { Check, ChevronRight, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const WORKFLOW_STAGES = [
  'Lecture Pending',
  'NCERT Complete',
  'WINR Complete',
  'HC Verma / Module Complete',
  'PYQ Complete',
  'Revision 1 Done',
  'Notes Finalized',
  'Mock Test 1 Complete',
  'Mock Test 2 Complete',
  'Done'
]

interface ChapterWorkflowProps {
  currentStatus: string
  onStatusChange: (status: string) => void
}

export function ChapterWorkflow({ currentStatus, onStatusChange }: ChapterWorkflowProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const currentIndex = WORKFLOW_STAGES.indexOf(currentStatus)
  const safeIndex = currentIndex === -1 ? 0 : currentIndex

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm uppercase tracking-wider text-foreground">Workflow Tracker</span>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
      </button>
      
      <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <CardContent className="p-4 border-t border-border/50">
            <div className="flex flex-col gap-2 relative">
              {/* Vertical timeline line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-border/50" />
              
              {WORKFLOW_STAGES.map((stage, idx) => {
                const isCompleted = idx < safeIndex || (stage === 'Done' && safeIndex === 9)
                const isCurrent = idx === safeIndex
                
                let buttonStyle = 'text-muted-foreground hover:bg-muted/50'
                let iconStyle = 'bg-background border-2 border-border/50 text-transparent'
                
                if (isCompleted) {
                  buttonStyle = 'text-foreground hover:bg-muted/50'
                  iconStyle = 'bg-primary border-primary text-primary-foreground'
                } else if (isCurrent) {
                  buttonStyle = 'bg-primary/5 text-primary hover:bg-primary/10 font-medium'
                  iconStyle = 'bg-background border-2 border-primary text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]'
                }

                return (
                  <button
                    key={stage}
                    onClick={() => onStatusChange(stage)}
                    className={`group flex items-center gap-4 w-full p-2 rounded-xl text-left transition-all relative z-10 ${buttonStyle}`}
                  >
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all shrink-0 ${iconStyle}`}>
                      {isCompleted ? <Check className="h-3 w-3" /> : (idx + 1)}
                    </div>
                    <span className="text-sm">
                      {stage}
                    </span>
                    {isCurrent && (
                      <span className="ml-auto text-[10px] uppercase font-bold tracking-wider text-primary animate-pulse">
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
