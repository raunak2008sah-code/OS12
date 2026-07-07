import { Timer } from 'lucide-react'
import { getCountdownDays } from '@/lib/time'

export function CountdownWidget() {
  // OS12 Default Exam Targets (could be fetched from profile)
  const defaultTargets = [
    { name: 'JEE Main (Session 1)', date: '2027-01-24T00:00:00Z' },
    { name: 'Class 12 Boards', date: '2027-02-15T00:00:00Z' },
    { name: 'JEE Advanced', date: '2027-05-28T00:00:00Z' }
  ]
  const targets = defaultTargets

  return (
    <div className="flex flex-col rounded-xl border border-border/40 bg-card shadow-sm hover:border-border/60 transition-colors duration-[220ms] ease-out p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="h-4 w-4 text-primary" />
        <h2 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Countdowns</h2>
      </div>
      
      <div className="flex flex-col gap-3">
        {targets.map((target: any, idx: number) => {
          // If the profile has strings like 'JEE Main', map them to fixed dates for demo, 
          // or parse if it's an object. Let's handle the object format for robustness.
          const name = typeof target === 'string' ? target : target.name
          const date = typeof target === 'string' ? '2027-01-24T00:00:00Z' : target.date
          
          const daysLeft = getCountdownDays(date)
          
          return (
            <div key={idx} className="flex flex-col gap-1 p-3 rounded-lg bg-muted/20 border border-border/40 hover:bg-muted/30 transition-colors duration-[150ms] group">
              <span className="text-[11px] font-semibold text-muted-foreground/80 tracking-wider uppercase group-hover:text-muted-foreground transition-colors">{name}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">{daysLeft}</span>
                <span className="text-xs font-semibold text-muted-foreground/60">days left</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
