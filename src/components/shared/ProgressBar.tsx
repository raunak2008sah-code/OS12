import { cn } from '@/lib/utils'

interface ProgressBarProps {
  progress: number // 0 to 100
  className?: string
  barClassName?: string
}

export function ProgressBar({ progress, className, barClassName }: ProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div 
        className={cn("h-full bg-primary transition-all duration-500 ease-in-out", barClassName)} 
        style={{ width: `${safeProgress}%` }} 
      />
    </div>
  )
}
