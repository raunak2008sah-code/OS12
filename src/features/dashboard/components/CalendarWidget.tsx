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
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm text-foreground tracking-tight">Calendar</h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-muted rounded-md text-muted-foreground"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <button onClick={jumpToToday} className="text-[10px] font-medium px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80">Today</button>
          <button onClick={nextMonth} className="p-1 hover:bg-muted rounded-md text-muted-foreground"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      
      <div className="text-center font-semibold text-xs mb-2 text-foreground">
        {format(currentDate, 'MMMM yyyy')}
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-muted-foreground mb-1">
        <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
      </div>
      
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: emptyDays }).map((_, i) => (
          <div key={`empty-${i}`} className="h-7 rounded-sm" />
        ))}
        {days.map((day) => {
          const isToday = isSameDayIST(day, now)
          const dateStr = formatIST(day, 'yyyy-MM-dd')
          const isChecked = checkinSet.has(dateStr)
          
          const isPast = !isToday && isBefore(day, now)

          let stateClasses = "text-foreground"
          let tooltip = format(day, 'PP')

          if (isChecked) {
            stateClasses = "bg-green-500/20 text-green-600 dark:text-green-400 font-bold"
            tooltip = "✓ Studied"
          } else if (isPast) {
            stateClasses = "bg-red-500/10 text-red-500/80"
            tooltip = "✗ Missed"
          } else if (isToday) {
            stateClasses = "border border-primary text-primary font-bold"
            tooltip = "Today"
          } else {
            // Future Day
            stateClasses = "text-muted-foreground/50 cursor-default"
          }

          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "flex h-7 items-center justify-center rounded-sm text-xs transition-colors",
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
      <div className="mt-3 flex items-center justify-center gap-3 text-[10px] font-medium text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500/80" />
          <span>Studied</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/80" />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-muted border border-border/50" />
          <span>Future</span>
        </div>
      </div>
    </div>
  )
}
