import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, BookOpen, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Roadmap', to: '/roadmap', icon: Map },
  { name: 'Subjects', to: '/subjects', icon: BookOpen },
  { name: 'Progress', to: '/progress', icon: TrendingUp },
  { name: 'Compare', to: '/compare', icon: Users },
]

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="hidden flex-col border-r border-border bg-sidebar md:flex md:w-16 lg:w-64 transition-all duration-300">
      <div className="flex h-16 shrink-0 items-center justify-center lg:justify-start lg:px-6 border-b border-sidebar-border">
        <span className="text-xl font-bold tracking-tight text-sidebar-foreground lg:block hidden">OS12</span>
        <span className="text-xl font-bold tracking-tight text-sidebar-foreground lg:hidden block">O</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
        <nav className="space-y-2 px-2 lg:px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    'md:justify-center lg:justify-start lg:gap-3',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )
                }
                title={item.name}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="hidden lg:block whitespace-nowrap">{item.name}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-center lg:justify-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <span className="text-sm font-medium text-primary">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden lg:flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.email?.split('@')[0]}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
