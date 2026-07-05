import { useToggleProgress } from '@/lib/supabase/queries'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { WORKFLOW_STEPS } from '../constants'

interface WorkflowChecklistProps {
  chapterId: string
  progress: { step_key: string }[]
}

export function WorkflowChecklist({ chapterId, progress }: WorkflowChecklistProps) {
  const { user } = useAuth()
  const { mutate: toggleProgress, isPending } = useToggleProgress()

  const completedSteps = new Set(progress.map((p) => p.step_key))

  const handleToggle = (stepKey: string, currentCompleted: boolean) => {
    if (!user) return
    toggleProgress({
      userId: user.id,
      chapterId,
      stepKey,
      isCompleted: !currentCompleted,
    })
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold tracking-tight text-foreground">Workflow Checklist</h3>
      <p className="text-sm text-muted-foreground">Track your progress through the standard chapter workflow.</p>
      
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {WORKFLOW_STEPS.map((step) => {
          const isCompleted = completedSteps.has(step.key)
          
          return (
            <label 
              key={step.key}
              className={cn(
                "group relative flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-all hover:bg-accent/50",
                isCompleted ? "border-primary/50 bg-primary/5" : "border-border bg-background"
              )}
            >
              <div className="flex h-5 items-center">
                <input
                  type="checkbox"
                  className="peer h-4 w-4 shrink-0 rounded border-primary/50 bg-background text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  checked={isCompleted}
                  onChange={() => handleToggle(step.key, isCompleted)}
                  disabled={isPending}
                />
              </div>
              <span className={cn("font-medium transition-colors", isCompleted ? "text-foreground" : "text-muted-foreground")}>
                {step.label}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
