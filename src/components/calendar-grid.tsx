'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Event, Pixel } from '@prisma/client';
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
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  });

  const weekdayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getPixelForDay = (day: Date) =>
    pixels &&
    pixels.find((pixel) =>
      isEqual(startOfDay(pixel.pixelDate), startOfDay(day))
    );

  const today = startOfDay(new Date());
  const handlePrevMonth = () => setDate(addMonths(date, -1));
  const handleNextMonth = () => setDate(addMonths(date, 1));
  return (
    <div className={cn('flex flex-col gap-4', className)}>
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
      <div className='grid grid-cols-7 gap-2'>
        {weekdayNames.map((day) => (
          <small
            key={day}
            className='text-muted-foreground text-sm font-medium text-center leading-none p-2 '
          >
            {day}
          </small>
        ))}
      </div>
      <div className='grid grid-cols-7 gap-2'>
        {daysInMonth.map((day) => {
          const pixel = getPixelForDay(day);
          const moodColor = pixel?.mood?.color.value || '';
          const events = pixel?.events || [];
          const isDisabled =
            isAfter(day, today) || isBefore(day, new Date('1900-01-01'));
          return (
            <Button
              variant={'outline'}
              style={{ backgroundColor: moodColor }}
              key={day.toISOString()}
              onClick={() => onDaySelect?.(day)}
              className='p-3 cursor-pointer h-[40px] flex items-center hover:opacity-90'
              disabled={isDisabled}
            >
              {format(day, 'd')} {events.map((event: Event) => event.name)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
