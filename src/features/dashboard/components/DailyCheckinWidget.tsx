import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Flame, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDailyCheckins, useCreateDailyCheckin } from '@/lib/supabase/queries'
import { formatIST } from '@/lib/time'
import { calculateStudyStreak, formatRelativeTime } from '@/lib/progress'

export function DailyCheckinWidget() {
  const { user } = useAuth()
  const { data: checkins = [] } = useDailyCheckins(user?.id)
  const createCheckin = useCreateDailyCheckin()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Determine Today in IST
  const todayStr = formatIST(new Date(), 'yyyy-MM-dd')

  const todayCheckin = checkins.find(c => c.date === todayStr)
  const isCheckedToday = !!todayCheckin

  const lastCheckin = checkins.length > 0 ? checkins[0] : null
  const lastCheckinStr = lastCheckin && lastCheckin.checked_at
    ? formatRelativeTime(lastCheckin.checked_at)
    : 'Never'

  // Calculate Streak using canonical helper
  const streak = calculateStudyStreak(checkins)

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
    <Card className="overflow-hidden shadow-sm border-border/40 hover:border-border/60 transition-colors duration-[220ms] ease-out group">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Left Side: Check-in Action */}
          <div className="flex-1 p-5 sm:border-r border-border/40">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" /> Daily Check-in
            </h3>
            
            <button
              onClick={handleCheckin}
              disabled={isCheckedToday || isSubmitting}
              className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isCheckedToday 
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 cursor-default' 
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_2px_12px_rgba(0,0,0,0.1)] active:scale-[0.99]'
              }`}
            >
              {isCheckedToday ? (
                <>
                  <div className="h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                  Today Completed
                </>
              ) : (
                <>
                  <div className="h-4 w-4 rounded-sm border-2 border-primary-foreground/40 flex items-center justify-center" />
                  Mark today as studied
                </>
              )}
            </button>
          </div>

          {/* Right Side: Stats */}
          <div className="sm:w-64 p-5 bg-muted/20 flex flex-col justify-center gap-4 group-hover:bg-muted/30 transition-colors duration-[220ms]">
            <div>
              <p className="text-[11px] uppercase font-semibold tracking-wider text-muted-foreground/80 mb-1.5">Current Streak</p>
              <div className="flex items-center gap-2">
                <Flame className={`w-5 h-5 transition-transform duration-500 ${streak > 0 ? 'text-orange-500 fill-orange-500/20' : 'text-muted-foreground/40'}`} />
                <span className={`text-2xl font-bold tracking-tight ${streak > 0 ? 'text-orange-500' : 'text-foreground'}`}>
                  {streak}
                </span>
                <span className={`text-sm font-semibold ${streak > 0 ? 'text-orange-500/70' : 'text-muted-foreground/60'}`}>
                  Days
                </span>
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase font-semibold tracking-wider text-muted-foreground/80 mb-1.5">Last Check-in</p>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Clock className="w-4 h-4 text-muted-foreground/50" />
                {lastCheckinStr}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
