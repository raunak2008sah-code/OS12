import { useState } from 'react'
import { Moon, Sun, LogOut, Bell, Search } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { useBacklog, useAllRevisions } from '@/lib/supabase/queries'

export default function TopBar() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  const { data: backlogs = [] } = useBacklog(user?.id)
  const { data: revisions = [] } = useAllRevisions(user?.id)

  const activeBacklogs = backlogs.length
  const pendingRevisions = revisions.filter(r => r.status === 'pending').length

  const notifications = []
  if (activeBacklogs > 0) notifications.push({ id: 1, title: 'Backlog Alert', message: `You have ${activeBacklogs} active backlogs.`, type: 'warning' })
  if (pendingRevisions > 0) notifications.push({ id: 2, title: 'Revision Due', message: `You have ${pendingRevisions} pending revisions.`, type: 'info' })
  if (new Date().getDay() === 0) notifications.push({ id: 3, title: 'Sunday Ritual', message: 'Time for your weekly review and planning.', type: 'action' })

  const handleSearchClick = () => {
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
    window.dispatchEvent(event)
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <div className="flex items-center">
        <span className="text-xl font-bold tracking-tight text-foreground md:hidden mr-4">OS12</span>
        
        <button onClick={handleSearchClick} className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted border rounded-md transition-colors w-64">
          <Search className="h-4 w-4" />
          <span>Search everything...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handleSearchClick} className="md:hidden p-2 text-muted-foreground hover:text-foreground">
          <Search className="h-5 w-5" />
        </button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card shadow-lg p-2">
              <div className="p-2 border-b font-semibold text-sm">Notifications</div>
              <div className="max-h-[300px] overflow-y-auto p-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">You're all caught up!</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-3 text-sm hover:bg-muted/50 rounded-lg cursor-pointer">
                      <div className="font-semibold">{n.title}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
