import { useAuth } from '@/hooks/useAuth'
import { ShieldX, LogOut } from 'lucide-react'

export default function AccessRestrictedPage() {
  const { signOut, user } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-8 w-8 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Access Restricted
        </h1>

        <p className="mt-3 text-muted-foreground">
          The account{' '}
          <span className="font-medium text-foreground">{user?.email}</span>{' '}
          does not have access to OS12.
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          This application is designed for authorized users only.
        </p>

        <button
          onClick={() => void signOut()}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
