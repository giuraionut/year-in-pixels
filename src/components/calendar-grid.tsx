import { cn } from '@/lib/utils';
import { Mood, MoodToPixel, Pixel, Event } from '@prisma/client';
import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isEqual,
  startOfDay,
  addMonths,
  addDays,
  getDay,
  format,
} from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MonthSelector } from '@/app/pixels/MonthSelector';
import { YearSelector } from '@/app/pixels/YearSelector';

type CalendarGridProps = {
  currentDate: Date; // renamed from `date`
  pixels?: Pixel[];
  className?: string;
  userMoods?: Mood[];
  userEvents?: Event[];
  /**
   * Render function for each day cell
   * @param day       the specific date for this cell
   * @param bgcolor   computed background style
   */
  children: (day: Date, bgcolor: string) => React.ReactNode;
};

export default function CalendarGrid({
  currentDate,
  pixels,
  className,
  children,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startWeekday = getDay(monthStart);
  const prevMonthEnd = startOfDay(endOfMonth(addMonths(currentDate, -1)));
  const previousMonthDays = Array.from({ length: startWeekday }, (_, idx) =>
    addDays(prevMonthEnd, idx - startWeekday + 1)
  );

  const weekdayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getPixelForDate = (day: Date) =>
    pixels?.find((px) => isEqual(startOfDay(px.pixelDate), startOfDay(day)));


  const renderDayCell = (day: Date) => {
    const px = getPixelForDate(day);
    const eventCount = px?.events?.length || 0;
    const moodsList = px?.moods || [];

    // Compute background based on moods
    const moodColors = moodsList.map(
      (mtp: MoodToPixel) => JSON.parse(mtp.mood.color).value
    );

    console.log('THE DATE', day)
    let background = '';
    if (moodColors.length === 1) {
      background = moodColors[0];
    } else if (moodColors.length > 1) {
      const count = moodColors.length;
      const spacing = 100 / count;
      const stops = moodColors
        .map(
          (col: string, i: number) =>
            `${col} ${i * spacing}%, ${col} ${(i + 1) * spacing}%`
        )
        .join(', ');
      background = `linear-gradient(to right, ${stops})`;
    }

    return (
      <div key={day.toISOString()} className='relative inline-flex'>
        {children(day, background)}

        {eventCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='absolute top-0.5 right-0.5 grid w-5 h-5 translate-x-1/3 -translate-y-1/3 place-items-center rounded-full bg-accent py-1 px-1 text-[0.5rem]'>
                {eventCount}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {eventCount > 1 ? 'Events' : 'Event'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className='flex items-center justify-between'>
        <MonthSelector
          currentMonth={format(currentDate, 'LLLL').toLowerCase()}
          currentYear={currentDate.getFullYear()}
        />
        <YearSelector currentYear={currentDate.getFullYear()} />
      </div>

      <div className='grid grid-cols-7 gap-2'>
        {weekdayNames.map((wd) => (
          <small
            key={wd}
            className='text-muted-foreground text-sm font-medium text-center leading-none p-2'
          >
            {wd}
          </small>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-2'>
        {previousMonthDays.map((prevDay) => renderDayCell(prevDay))}
        {daysInMonth.map((day) => renderDayCell(day))}
      </div>
    </div>
  );
}
