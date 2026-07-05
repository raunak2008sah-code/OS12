import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
  const currentIndex = WORKFLOW_STAGES.indexOf(currentStatus)
  const safeIndex = currentIndex === -1 ? 0 : currentIndex

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">The 10-Stage Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {WORKFLOW_STAGES.map((stage, idx) => {
            const isCompleted = idx < safeIndex || (stage === 'Done' && safeIndex === 9)
            const isCurrent = idx === safeIndex
            
            let buttonStyle = 'bg-muted text-muted-foreground hover:bg-muted/80'
            let iconStyle = 'bg-background/50 text-muted-foreground'
            
            if (isCompleted) {
              buttonStyle = 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400'
              iconStyle = 'bg-green-500 text-white'
            } else if (isCurrent) {
              buttonStyle = 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md ring-2 ring-primary/20'
              iconStyle = 'bg-background/20 text-primary-foreground'
            }

            return (
              <button
                key={stage}
                onClick={() => onStatusChange(stage)}
                className={`group flex items-center justify-between w-full p-3 rounded-lg text-left transition-all ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${iconStyle}`}>
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : (idx + 1)}
                  </div>
                  <span className={`font-semibold text-sm ${isCurrent ? 'opacity-100' : 'opacity-90'}`}>
                    {stage}
                  </span>
                </div>
                <div className={`text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity ${isCurrent ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  Set active
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
