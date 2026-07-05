import { useState, useEffect } from 'react'
import { getNowIST } from '@/lib/time'

/**
 * Returns a globally synchronized current time in IST.
 * Optionally re-renders every `refreshMs` milliseconds to keep the UI fresh.
 */
export function useTime(refreshMs = 60000) {
  const [now, setNow] = useState<Date>(() => getNowIST())

  useEffect(() => {
    // Sync to the exact next interval start so ticks are aligned (e.g., exactly at the start of a minute)
    const timeToNextTick = refreshMs - (Date.now() % refreshMs)
    
    let intervalId: ReturnType<typeof setInterval>
    
    const timeoutId = setTimeout(() => {
      setNow(getNowIST())
      intervalId = setInterval(() => setNow(getNowIST()), refreshMs)
    }, timeToNextTick)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [refreshMs])

  return now
}
