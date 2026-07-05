import { toZonedTime, formatInTimeZone } from 'date-fns-tz'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  isSameDay,
  addDays,
  differenceInDays,
  isSunday,
} from 'date-fns'

const DEFAULT_TIMEZONE = 'Asia/Kolkata'

/**
 * Returns the current live date mapped to the target timezone (IST default).
 * This ensures the server/client timezone does not affect calculations.
 */
export function getNowIST(tz = DEFAULT_TIMEZONE): Date {
  return toZonedTime(new Date(), tz)
}

/** Format a native date specifically as IST. */
export function formatIST(date: Date, formatStr: string, tz = DEFAULT_TIMEZONE): string {
  return formatInTimeZone(date, tz, formatStr)
}

/** Check if two dates are the same day in IST. */
export function isSameDayIST(dateLeft: Date, dateRight: Date, tz = DEFAULT_TIMEZONE): boolean {
  return isSameDay(toZonedTime(dateLeft, tz), toZonedTime(dateRight, tz))
}

/** Get the start of the day in IST. */
export function getStartOfDayIST(date: Date, tz = DEFAULT_TIMEZONE): Date {
  return startOfDay(toZonedTime(date, tz))
}

/** Get the end of the day in IST. */
export function getEndOfDayIST(date: Date, tz = DEFAULT_TIMEZONE): Date {
  return endOfDay(toZonedTime(date, tz))
}

/** Get start of the week in IST (Sunday = 0, Monday = 1). */
export function getStartOfWeekIST(date: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1, tz = DEFAULT_TIMEZONE): Date {
  return startOfWeek(toZonedTime(date, tz), { weekStartsOn })
}

/** Get end of the week in IST. */
export function getEndOfWeekIST(date: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1, tz = DEFAULT_TIMEZONE): Date {
  return endOfWeek(toZonedTime(date, tz), { weekStartsOn })
}

/** Check if the given date is a Sunday in IST. */
export function isSundayIST(date: Date, tz = DEFAULT_TIMEZONE): boolean {
  return isSunday(toZonedTime(date, tz))
}

/** Get countdown to a target date string. */
export function getCountdownDays(targetDateIso: string, tz = DEFAULT_TIMEZONE): number {
  const target = toZonedTime(new Date(targetDateIso), tz)
  const now = getNowIST(tz)
  return Math.max(0, differenceInDays(target, now))
}

/** Add standard days to a date in IST context. */
export function addDaysIST(date: Date, amount: number, tz = DEFAULT_TIMEZONE): Date {
  return addDays(toZonedTime(date, tz), amount)
}
