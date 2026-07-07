import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Flame, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDailyCheckins, useCreateDailyCheckin } from '@/lib/supabase/queries'
import { formatIST, addDaysIST } from '@/lib/time'
import { formatRelativeTime } from '@/lib/progress'

export function DailyCheckinWidget() {
  const { user } = useAuth()
  const { data: checkins = [] } = useDailyCheckins(user?.id)
  const createCheckin = useCreateDailyCheckin()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Determine Today and Yesterday in IST
  const todayStr = formatIST(new Date(), 'yyyy-MM-dd')
  const yesterdayStr = formatIST(addDaysIST(new Date(), -1), 'yyyy-MM-dd')

  const todayCheckin = checkins.find(c => c.date === todayStr)
  const isCheckedToday = !!todayCheckin

  const lastCheckin = checkins.length > 0 ? checkins[0] : null
  const lastCheckinStr = lastCheckin && lastCheckin.checked_at
    ? formatRelativeTime(lastCheckin.checked_at)
    : 'Never'

  // Calculate Streak
  let streak = 0
  const checkinDates = new Set(checkins.map(c => c.date))
  
  if (checkinDates.has(todayStr) || checkinDates.has(yesterdayStr)) {
    // Start counting backwards
    let currentDate = checkinDates.has(todayStr) ? new Date() : addDaysIST(new Date(), -1)
    
    while (true) {
      const dateStr = formatIST(currentDate, 'yyyy-MM-dd')
      if (checkinDates.has(dateStr)) {
        streak++
        currentDate = addDaysIST(currentDate, -1)
      } else {
        break
      }
    }
  }

  const handleCheckin = async () => {
    if (!user || isCheckedToday || isSubmitting) return
    setIsSubmitting(true)
    try {
      await createCheckin.mutateAsync({ userId: user.id, date: todayStr })
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="overflow-hidden shadow-sm border-border/60">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Left Side: Check-in Action */}
          <div className="flex-1 p-5 sm:border-r border-border/50">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" /> Daily Check-in
            </h3>
            
            <button
              onClick={handleCheckin}
              disabled={isCheckedToday || isSubmitting}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all ${
                isCheckedToday 
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 cursor-default' 
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
              }`}
            >
              {isCheckedToday ? (
                <>
                  <div className="h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  Today Completed
                </>
              ) : (
                <>
                  <div className="h-5 w-5 rounded border-2 border-primary-foreground/30 flex items-center justify-center" />
                  Mark today as studied
                </>
              )}
            </button>
          </div>

          {/* Right Side: Stats */}
          <div className="sm:w-64 p-5 bg-muted/10 flex flex-col justify-center gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Current Streak</p>
              <div className="flex items-center gap-1.5">
                <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500 fill-orange-500/20' : 'text-muted-foreground'}`} />
                <span className={`text-xl font-bold tracking-tighter ${streak > 0 ? 'text-orange-500' : 'text-foreground'}`}>
                  {streak}
                </span>
                <span className={`text-sm font-medium ${streak > 0 ? 'text-orange-500/80' : 'text-muted-foreground'}`}>
                  Days
                </span>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Last Check-in</p>
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Clock className="w-4 h-4 text-muted-foreground/60" />
                {lastCheckinStr}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
