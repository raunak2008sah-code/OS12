import { Users } from 'lucide-react'

export default function ComparePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Compare</h1>
        <p className="text-muted-foreground mt-2">See how you measure up against your peers.</p>
      </div>

      <div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-border border-dashed bg-muted/10 p-8 text-center animate-in fade-in-50">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h3 className="text-lg font-semibold tracking-tight">Social Comparison</h3>
          <p className="text-sm text-muted-foreground">
            This module will allow you to compare your progress, workflow completion, and monthly reflections with authorized peers.
          </p>
        </div>
      </div>
    </div>
  )
}
