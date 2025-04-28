import { toZonedTime, formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { startOfDay, addDays } from "date-fns";

let _userTimeZone: string | undefined;

/** call once on the client to capture zone */
export function setUserTimeZone(tz: string) {
  _userTimeZone = tz;
}

/** returns the IANA zone to use—either what the user told us, or UTC */
export function getZone() {
  return _userTimeZone ?? "UTC";
}

/** the current “today” in the active zone, as a Date object */
export function nowZoned(): Date {
  return toZonedTime(new Date(), getZone());
}

/** day-of-month in the active zone */
export function todayDate(): number {
  return nowZoned().getDate();
}

/** formatted yyyy-MM-dd in the active zone */
export function todayISO(): string {
  return formatInTimeZone(new Date(), getZone(), "yyyy-MM-dd");
}

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
