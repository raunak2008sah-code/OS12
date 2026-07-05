import { Loader2, AlertCircle, FileX2 } from 'lucide-react'

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-lg border border-border border-dashed p-8 text-center animate-in fade-in-50">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: Error | null; onRetry?: () => void }) {
  return (
    <div className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in-50">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div className="space-y-1">
        <h3 className="font-semibold tracking-tight text-destructive">Something went wrong</h3>
        <p className="text-sm text-destructive/80 max-w-md mx-auto">
          {error?.message || 'An unexpected error occurred while fetching data.'}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-md bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title = 'No data found', description = 'There is nothing to display here yet.', icon: Icon = FileX2 }: { title?: string; description?: string; icon?: React.ElementType }) {
  return (
    <div className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-lg border border-border border-dashed p-8 text-center bg-muted/20 animate-in fade-in-50">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
      </div>
    </div>
  )
}
