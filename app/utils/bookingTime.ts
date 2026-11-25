import { fromDate, getLocalTimeZone, toCalendarDateTime } from '@internationalized/date'
import type { CalendarDate, Time } from '@internationalized/date'

export function localBookingDate(date?: CalendarDate, time?: Time, timeZone = getLocalTimeZone()) {
  if (!date || !time || date.era !== 'AD' || date.year > 9999) return null

  const local = toCalendarDateTime(date, time)
  // A repeated hour at the end of DST refers to its first occurrence.
  const instant = local.toDate(timeZone, 'earlier')
  // A skipped hour at the start of DST cannot round-trip.
  if (toCalendarDateTime(fromDate(instant, timeZone)).compare(local) !== 0) return null
  const year = instant.getUTCFullYear()
  return year >= 1 && year <= 9999 ? instant : null
}
