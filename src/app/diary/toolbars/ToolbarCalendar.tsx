'use client';

import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import React, { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Pixel } from '@prisma/client';
import { getUserPixelsByRange } from '@/actions/pixelActions';
import CalendarGrid from '@/components/calendar-grid';
import { LoadingDots } from '@/components/icons/loading-dots';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ToolbarCalendarProps = {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  className?: string;
};

export default function ToolbarCalendar({
  date,
  setDate,
  className,
}: ToolbarCalendarProps) {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPixels = async () => {
      const from = startOfMonth(date);
      const to = endOfMonth(date);
      const fetchedPixels = await getUserPixelsByRange(from, to);
      setPixels(fetchedPixels || []);
      setLoading(false);
    };
    fetchPixels();
  }, [date]);

  const handleDaySelect = (selectedDate: Date) => {
    setDate(selectedDate);
  };

  return (
    <Popover>
      <Tooltip delayDuration={100}>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'w-4 font-normal ',
                !date && 'text-muted-foreground',
                className
              )}
            >
              <CalendarIcon/>
            </Button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent
          side='right'
          className='bg-secondary font-semibold text-foreground'
        >
          <p>
            {loading ? (
              <LoadingDots />
            ) : date ? (
              format(date, 'PPP')
            ) : (
              'Pick a date'
            )}
          </p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        side='bottom'
        className='w-auto p-4 flex flex-col items-center gap-4'
      >
        {!loading && (
          
            <CalendarGrid
              date={new Date()}
              pixels={pixels}
              setDate={setDate}
              onDaySelect={handleDaySelect}
            />
          
        )}
      </PopoverContent>
    </Popover>
  );
}
