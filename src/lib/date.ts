// date.ts
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { startOfDay, addDays } from 'date-fns';

let _userTimeZone: string | undefined;

/** capture an explicit override */
export function setUserTimeZone(tz: string) {
  _userTimeZone = tz;
}

/** use stored zone or browser’s zone, else UTC */
export function getZone(): string {
  if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
    return _userTimeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return _userTimeZone ?? 'UTC';
}

/** the current “today” in the active zone */
export function nowZoned(): Date {
  return toZonedTime(new Date(), getZone());
}

/** day-of-month in the active zone */
export function todayDate(): number {
  return nowZoned().getDate();
}

// … the rest of your helpers remain the same …


/**
 * Compute the UTC boundaries for a given date in the active (or specified) time-zone.
 * Returns { start, end } such that any UTC timestamp >= start && < end falls on that date in the zone.
 */
export function getZonedDayRange(
  date: Date,
  zoneOverride?: string
): { start: Date; end: Date } {
  const tz = zoneOverride ?? getZone();
  // interpret the input date in the target zone
  const zoned = toZonedTime(date, tz);
  // get midnight at start of that date in zone
  const startZoned = startOfDay(zoned);
  // next midnight in zone
  const endZoned = addDays(startZoned, 1);
  // convert those back to UTC instants for querying
  const startUtc = fromZonedTime(startZoned, tz);
  const endUtc = fromZonedTime(endZoned, tz);
  return { start: startUtc, end: endUtc };
}
