  export type Day = {
    dayIndex: number;
    weekdayIndex: number;
    currentDay: boolean;
  };
  export type SelectedMonth = {
    index: number;
    name: string;
  };

export default function calendarUtils() {
  const date = new Date();
  const currentYear = date.getFullYear();
  const currentMonth = {
    index: date.getMonth() + 1,
    name: date.toLocaleDateString('default', { month: 'long' }),
  };

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
    const monthDate = new Date(currentYear, i); // Current month
    const totalDays = new Date(currentYear, i + 1, 0).getDate(); // Total days in the month

    return {
      index: i + 1, // Month index (1-based)
      name: monthDate.toLocaleDateString('default', { month: 'long' }), // Month name
      currentMonth: date.getMonth() === i, // Check if it's the current month
      totalDays, // Total number of days in the month
    };
  });

  // Explicitly typing the accumulator as a Record<number, Array<{ dayIndex: number; weekdayIndex: number }>>
  const daysByMonth = months.reduce<
    Record<
      number,
      { dayIndex: number; weekdayIndex: number; currentDay: boolean }[]
    >
  >(
    (acc, month) => {
      const daysArray = Array.from(
        { length: month.totalDays },
        (_, dayIndex) => {
          const dayDate = new Date(currentYear, month.index - 1, dayIndex + 1); // Day date
          return {
            dayIndex: dayIndex + 1, // Day index (1-based)
            weekdayIndex: dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1, // Weekday index (Monday = 0)
            currentDay: date.getDate() === dayIndex + 1,
          };
        }
      );

      acc[month.index] = daysArray;
      return acc;
    },
    {} // Initial accumulator as an empty object
  );

  return {
    year: currentYear,
    months,
    daysByMonth,
    weekdayNames,
    currentMonth,
  };
};
