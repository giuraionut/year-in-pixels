import { getCalendarData } from './logic';
import { Card } from '@/components/ui/card';
import DayDialog from './dayDialog';
const { daysByMonth, weekdayNames, currentMonth } = getCalendarData();
const Days = ({
  selectedMonth,
}: {
  selectedMonth: { index: number; name: string };
}) => {
  console.log('days.tsx');
  return (
    <div className='grid grid-cols-4 gap-2'>
      {daysByMonth[selectedMonth.index].map((day) => (
        <DayDialog day={day} key={day.dayIndex}>
          <Card
            className={`p-2 cursor-pointer ${
              day.currentDay && currentMonth.index === selectedMonth.index
                ? 'dark'
                : ''
            }`}
          >
            {day.dayIndex} - {weekdayNames[day.weekdayIndex]}
          </Card>
        </DayDialog>
      ))}
    </div>
  );
};

export default Days;
