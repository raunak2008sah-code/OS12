import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, BookOpen, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Roadmap', to: '/roadmap', icon: Map },
  { name: 'Subjects', to: '/subjects', icon: BookOpen },
  { name: 'Progress', to: '/progress', icon: TrendingUp },
  { name: 'Compare', to: '/compare', icon: Users },
]

export default function BottomBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background px-2 pb-safe">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="sr-only sm:not-sr-only sm:text-[10px]">{item.name}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
