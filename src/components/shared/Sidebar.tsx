import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, BookOpen, TrendingUp, Users, Settings, BookMarked, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', to: '/', icon: LayoutDashboard },
      { name: 'Roadmap', to: '/roadmap', icon: Map },
      { name: 'Subjects', to: '/subjects', icon: BookOpen },
    ]
  },
  {
    label: 'Analytics',
    items: [
      { name: 'Progress', to: '/progress', icon: TrendingUp },
      { name: 'Compare', to: '/compare', icon: Users },
    ]
  },
  {
    label: 'System',
    items: [
      { name: 'Manual', to: '/manual', icon: BookMarked },
      { name: 'Settings', to: '/settings', icon: Settings },
    ]
  }
]

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="hidden flex-col border-r border-border/60 bg-sidebar/50 backdrop-blur-xl md:flex md:w-20 lg:w-64 transition-all duration-300">
      <div className="flex h-16 shrink-0 items-center justify-center lg:justify-start lg:px-6 border-b border-border/50">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-6 w-6" />
          <span className="text-xl font-bold tracking-tight lg:block hidden">OS12</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 overflow-x-hidden custom-scrollbar">
        <nav className="space-y-6 px-3 lg:px-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              <h4 className="hidden lg:block px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.label}
              </h4>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300',
                        'md:justify-center lg:justify-start lg:gap-3',
                        isActive
                          ? 'bg-primary/5 text-primary shadow-sm'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )
                    }
                    title={item.name}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                        )}
                        <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="hidden lg:block whitespace-nowrap">{item.name}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-border/50 p-4">
        <div className="flex items-center justify-center lg:justify-start gap-3 rounded-xl p-2 hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shadow-sm">
            <span className="text-sm font-bold text-primary">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden lg:flex flex-col overflow-hidden">
            <span className="truncate text-sm font-semibold text-foreground">
              {user?.email?.split('@')[0]}
            </span>
            <span className="truncate text-xs text-muted-foreground">Premium User</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
