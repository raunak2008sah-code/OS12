import { Moon, Sun, LogOut } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export default function TopBar() {
  const { theme, setTheme } = useTheme()
  const { signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:justify-end">
      {/* Mobile Branding (visible only on mobile since desktop has sidebar) */}
      <div className="flex items-center md:hidden">
        <span className="text-xl font-bold tracking-tight text-foreground">OS12</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => void signOut()}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </header>
  )
}
