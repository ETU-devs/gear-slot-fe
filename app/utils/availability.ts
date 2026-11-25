import type { CalendarDate } from '@internationalized/date'
import type { BusyInterval } from '#shared/types/api'

export function localDayRange(date: CalendarDate, timeZone: string) {
  if (date.era !== 'AD' || date.year > 9999) return

  // Resolve each midnight separately. A clock change can shorten or lengthen the day.
  const start = date.toDate(timeZone)
  const end = date.add({ days: 1 }).toDate(timeZone)
  if (start >= end || start.getUTCFullYear() < 1 || end.getUTCFullYear() > 9999) return
  return { start, end }
}

export function clipBusyIntervals(intervals: BusyInterval[], start: Date, end: Date) {
  return intervals
    .map(interval => ({
      start: Math.max(start.getTime(), Date.parse(interval.start_time)),
      end: Math.min(end.getTime(), Date.parse(interval.end_time))
    }))
    .filter(interval => interval.start < interval.end)
    .sort((left, right) => left.start - right.start)
}
