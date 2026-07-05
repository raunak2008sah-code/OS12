import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, BookOpen, TrendingUp, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Roadmap', to: '/roadmap', icon: Map },
  { name: 'Subjects', to: '/subjects', icon: BookOpen },
  { name: 'Progress', to: '/progress', icon: TrendingUp },
  { name: 'Settings', to: '/settings', icon: Settings },
]

export default function BottomBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-border/50 bg-background/80 backdrop-blur-xl px-2 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl text-xs font-medium transition-all duration-300 active:scale-95',
                isActive
                  ? 'text-foreground bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={cn("h-5 w-5 transition-transform duration-300", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                </div>
                <span className="sr-only sm:not-sr-only sm:text-[10px] truncate w-full text-center">{item.name}</span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-foreground" />
                )}
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

