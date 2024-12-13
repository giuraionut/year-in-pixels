/**
 * Utility function to generate calendar-related data for a given year.
 *
 * This function processes a `Date` object and returns detailed information about the months, weekdays, and days of the given year.
 * It calculates the total days in each month and categorizes them by weekdays, while also identifying the current day.
 *
 * @param {Date} date - A `Date` object representing the reference date (typically the current date).
 * @returns {Object} An object containing:
 * - `months`: An array of month objects, each containing:
 *    - `index`: The month index (0-based).
 *    - `name`: The full name of the month.
 *    - `totalDays`: The total number of days in the month.
 * - `daysByMonth`: A record with keys as month indices and values as arrays of day objects, each containing:
 *    - `dayIndex`: The 1-based index of the day.
 *    - `weekdayIndex`: The weekday index (0 for Sunday, 6 for Saturday).
 *    - `currentDay`: A boolean indicating if the day is the current date.
 * - `weekdayNames`: An array of weekday names from Monday to Sunday.
 *
 * @example
 * const date = new Date(); // Current date
 * const calendar = calendarUtils(date);
 * console.log(calendar.months); // Array of month details
 * console.log(calendar.daysByMonth); // Record of days categorized by months
 * console.log(calendar.weekdayNames); // Weekday names array (["Monday", "Tuesday", ...])
 *
 * @throws {Error} If the provided date is invalid.
 */

export default function calendarUtils(date: Date) {
  const currentYear = date.getFullYear();

  const weekdayNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const months = Array.from({ length: 12 }, (_, i) => {
    const monthDate = new Date(currentYear, i); // Current month (0-based index)
    const totalDays = new Date(currentYear, i + 1, 0).getDate(); // Total days in the month

    return {
      index: i, // Month index (0-based)
      name: monthDate.toLocaleDateString('default', { month: 'long' }), // Month name
      totalDays, // Total number of days in the month
    };
  });

  // Explicitly typing the accumulator as a Record<number, Array<{ dayIndex: number; weekdayIndex: number }>>
  // Adjusting dayIndex to be 1-based
  const daysByMonth = months.reduce<
    Record<
      number,
      { dayIndex: number; weekdayIndex: number; currentDay: boolean }[]
    >
  >(
    (acc, month) => {
      const daysArray = Array.from({ length: month.totalDays }, (_, dayIndex) => {
        const dayDate = new Date(currentYear, month.index, dayIndex); // Day date (0-based dayIndex)
        return {
          dayIndex: dayIndex + 1, // Day index (1-based)
          weekdayIndex: dayDate.getDay(), // Weekday index (0-based, Sunday = 0)
          currentDay: date.getDate() === dayIndex + 1, // Comparison using 1-based day for current date
        };
      });

      acc[month.index] = daysArray;
      return acc;
    },
    {}
  );


  return {
    months,
    daysByMonth,
    weekdayNames,
  };
};
