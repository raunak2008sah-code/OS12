import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { getNowIST, isSameDayIST } from '@/lib/time'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths } from 'date-fns'

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(() => getNowIST())
  const now = getNowIST()

  const days = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const jumpToToday = () => setCurrentDate(getNowIST())

  // Calculate empty padding for start of month (assuming Monday start = 1, Sunday start = 0)
  // Let's assume week starts on Monday for OS12 standard, so getDay() where 1=Mon, 0=Sun.
  const startDayOfWeek = days[0].getDay()
  const emptyDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground tracking-tight">Calendar</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-muted rounded-md text-muted-foreground"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={jumpToToday} className="text-xs font-medium px-2 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">Today</button>
          <button onClick={nextMonth} className="p-1 hover:bg-muted rounded-md text-muted-foreground"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      
      <div className="text-center font-semibold mb-4 text-foreground">
        {format(currentDate, 'MMMM yyyy')}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
        <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: emptyDays }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8 rounded-md" />
        ))}
        {days.map((day) => {
          const isToday = isSameDayIST(day, now)
          return (
            <div 
              key={day.toISOString()} 
              className={`flex h-8 items-center justify-center rounded-md text-sm font-medium transition-colors
                ${isToday ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted/50 text-foreground cursor-pointer'}
              `}
              title={format(day, 'PP')}
            >
              {format(day, 'd')}
            </div>
          )
        })}
      </div>
    </div>
  )
}
