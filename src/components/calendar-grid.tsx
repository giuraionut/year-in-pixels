'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Pixel } from '@prisma/client';
import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
  addMonths,
  addDays,
  getDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type CalendarGridProps = {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  onDaySelect?: (date: Date) => void;
  pixels?: Pixel[];
  className?: string;
};

export default function CalendarGrid({
  date,
  setDate,
  onDaySelect,
  pixels,
  className,
}: CalendarGridProps) {
  // Get all the days in the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  });

  // Get the day of the week for the 1st of the month
  const startDayOfWeek = getDay(startOfMonth(date)); // 0 (Sunday) to 6 (Saturday)

  // Days from the previous month to fill placeholders
  const endOfPreviousMonth = startOfDay(endOfMonth(addMonths(date, -1)));
  const previousMonthDays = Array.from({ length: startDayOfWeek }, (_, index) =>
    addDays(endOfPreviousMonth, index - startDayOfWeek + 1)
  );

  // Weekday names
  const weekdayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  console.log('pixels', pixels);
  const getPixelForDay = (day: Date) =>
    pixels?.find((pixel) =>
      isEqual(startOfDay(pixel.pixelDate), startOfDay(day))
    );

  const today = startOfDay(new Date());
  const handlePrevMonth = () => setDate(addMonths(date, -1));
  const handleNextMonth = () => setDate(addMonths(date, 1));
  const renderDayButton = (day: Date, isDisabled: boolean = false) => {
    const pixel = getPixelForDay(day);
    const moodColor = pixel ? JSON.parse(pixel.mood?.color).value : {};
    const events = pixel?.events || [];

    return (
      <div className='relative inline-flex' key={day.toISOString()}>
        <Button
          variant='outline'
          style={{
            backgroundColor: moodColor,
            transitionDuration: '0.25s',
          }}
          onClick={() => onDaySelect?.(day)}
          className='p-3 cursor-pointer h-[40px] flex items-center hover:opacity-90 w-full'
          disabled={isDisabled}
        >
          {format(day, 'd')}
        </Button>
        {events.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='absolute top-0.5 right-0.5 grid w-5 h-5 translate-x-1/3 -translate-y-1/3 place-items-center rounded-full bg-accent py-1 px-1 text-[0.5rem]'>
                {events.length}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {events.length > 1 ? 'Events' : 'Event'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  };
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header: Month Navigation */}
      <div className='flex flex-row w-full gap-4 items-center justify-between'>
        <Button variant='outline' className='w-4' onClick={handlePrevMonth}>
          <ChevronLeft className='w-4 h-4' />
        </Button>
        <small className='text-sm font-medium leading-none hidden md:block'>
          {format(date, 'MMMM yyyy')}
        </small>
        <small className='text-sm font-medium leading-none md:hidden'>
          {format(date, 'MMM yyyy')}
        </small>
        <Button variant='outline' className='w-4' onClick={handleNextMonth}>
          <ChevronRight className='w-4 h-4' />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className='grid grid-cols-7 gap-2'>
        {weekdayNames.map((day) => (
          <small
            key={day}
            className='text-muted-foreground text-sm font-medium text-center leading-none p-2'
          >
            {day}
          </small>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className='grid grid-cols-7 gap-2'>
        {/* Days from the previous month */}
        {previousMonthDays.map((day) => renderDayButton(day, true))}

        {/* Actual days of the month */}
        {daysInMonth.map((day) =>
          renderDayButton(
            day,
            isAfter(day, today) || isBefore(day, new Date('1900-01-01'))
          )
        )}
      </div>
    </div>
  );
}
