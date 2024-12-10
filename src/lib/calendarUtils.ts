
export default function calendarUtils() {
  const date = new Date();
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
