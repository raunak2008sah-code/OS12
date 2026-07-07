import { useState, useEffect, useRef } from 'react'
import { Moon, Sun, LogOut, Bell, Search, Settings as SettingsIcon, Calendar as CalendarIcon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { useAllRevisions } from '@/lib/supabase/queries'
import { useTime } from '@/hooks/useTime'
import { isSundayIST, formatIST } from '@/lib/time'
import { useNavigate } from 'react-router-dom'

export default function TopBar() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  
  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  const { data: revisions = [] } = useAllRevisions(user?.id)

  const now = useTime(60000) // update every minute

  const pendingRevisions = revisions.filter(r => r.status === 'pending').length

  const notifications = []

  if (pendingRevisions > 0) notifications.push({ id: 2, title: 'Revision Due', message: `You have ${pendingRevisions} pending revisions.`, type: 'info' })
  if (isSundayIST(now)) notifications.push({ id: 3, title: 'Sunday Ritual', message: 'Time for your weekly review and planning.', type: 'action' })

  const handleSearchClick = () => {
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
    window.dispatchEvent(event)
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/80 px-4 md:px-6 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold tracking-tight text-foreground md:hidden">OS12</span>
        
        <button onClick={handleSearchClick} className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/40 hover:bg-muted/80 border border-transparent hover:border-border rounded-lg transition-all w-64 shadow-sm group">
          <Search className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
          <span>Search everything...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 shadow-sm border">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Date and Time Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50 text-sm font-medium text-muted-foreground mr-2">
          <CalendarIcon className="h-4 w-4 text-primary/70" />
          <span>{formatIST(now, 'EEE, MMM d')}</span>
          <span className="w-px h-3 bg-border mx-1" />
          <span>{formatIST(now, 'h:mm a')}</span>
        </div>

        <button onClick={handleSearchClick} className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
          <Search className="h-5 w-5" />
        </button>

        <div className="relative" ref={notificationsRef}>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-muted transition-colors relative"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-background"></span>
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card shadow-xl p-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 border-b font-semibold text-sm">Notifications</div>
              <div className="max-h-[300px] overflow-y-auto p-1 py-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                    <Bell className="h-8 w-8 opacity-20" />
                    You're all caught up!
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-3 text-sm hover:bg-muted rounded-lg cursor-pointer transition-colors">
                      <div className="font-semibold">{n.title}</div>
                      <div className="text-muted-foreground text-xs mt-1">{n.message}</div>
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
          className="rounded-full hover:bg-muted transition-colors"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Moon className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>

        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 hover:ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all"
          >
            <span className="text-sm font-semibold text-primary">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-xl p-1 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3 py-2 border-b border-border/50 mb-1">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Premium User</p>
              </div>
              <button
                onClick={() => { setShowProfileMenu(false); navigate('/settings') }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                Settings
              </button>
              <button
                onClick={() => { setShowProfileMenu(false); signOut() }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
