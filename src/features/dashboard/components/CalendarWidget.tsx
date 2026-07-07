import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { getNowIST, isSameDayIST, formatIST } from '@/lib/time'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths, isBefore } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { useMonthlyCheckins } from '@/lib/supabase/queries'
import { cn } from '@/lib/utils'

export function CalendarWidget() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(() => getNowIST())
  const now = getNowIST()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const { data: checkins = [] } = useMonthlyCheckins(user?.id, year, month)
  const checkinSet = useMemo(() => new Set(checkins.map(c => c.date)), [checkins])

  const days = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const jumpToToday = () => setCurrentDate(getNowIST())

  const startDayOfWeek = days[0].getDay()
  const emptyDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  return (
    <div className="flex flex-col rounded-xl border border-border/40 bg-card shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Calendar</h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-muted/50 rounded-md text-muted-foreground transition-colors duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <button onClick={jumpToToday} className="text-[10px] font-medium px-2 py-0.5 bg-secondary/50 text-secondary-foreground rounded hover:bg-secondary transition-colors duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Today</button>
          <button onClick={nextMonth} className="p-1 hover:bg-muted/50 rounded-md text-muted-foreground transition-colors duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      
      <div className="text-center font-bold text-[13px] mb-3 text-foreground tracking-tight">
        {format(currentDate, 'MMMM yyyy')}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground/60 mb-1 tracking-wider uppercase">
        <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: emptyDays }).map((_, i) => (
          <div key={`empty-${i}`} className="h-7 rounded-sm" />
        ))}
        {days.map((day) => {
          const isToday = isSameDayIST(day, now)
          const dateStr = formatIST(day, 'yyyy-MM-dd')
          const isChecked = checkinSet.has(dateStr)
          
          const isPast = !isToday && isBefore(day, now)

          let stateClasses = "text-foreground hover:bg-muted/30"
          let tooltip = format(day, 'PP')

          if (isChecked) {
            stateClasses = "bg-green-500/10 text-green-600 dark:text-green-400 font-bold shadow-[inset_0_0_0_1px_rgba(34,197,94,0.2)]"
            tooltip = "✓ Studied"
          } else if (isPast) {
            stateClasses = "bg-red-500/5 text-red-500/70 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.1)]"
            tooltip = "✗ Missed"
          } else if (isToday) {
            stateClasses = "border border-primary text-primary font-bold shadow-[inset_0_0_0_1px_var(--color-primary)] bg-primary/5"
            tooltip = "Today"
          } else {
            // Future Day
            stateClasses = "text-muted-foreground/40 hover:bg-muted/30 cursor-default"
          }

          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "flex h-7 items-center justify-center rounded-md text-[11px] transition-colors duration-[150ms] cursor-pointer",
                stateClasses
              )}
              title={tooltip}
            >
              {format(day, 'd')}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-medium text-muted-foreground/80">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
          <span>Studied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500/80 shadow-[0_0_4px_rgba(239,68,68,0.3)]" />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-muted border border-border/50" />
          <span>Future</span>
        </div>
      </div>
    </div>
  )
}
