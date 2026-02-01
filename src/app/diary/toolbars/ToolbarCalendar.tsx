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
import { PixelWithRelations } from '@/types/pixel';
import { getUserPixelsByRange } from '@/actions/pixelActions';
import CalendarGrid from '@/components/calendar-grid';
import { LoadingDots } from '@/components/icons/loading-dots';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// import PixelDayDisplay from '@/app/pixels/PixelDayDisplay';

import dynamic from 'next/dynamic';

const PixelDayDisplay = dynamic(() => import('@/app/pixels/PixelDayDisplay'), {
  ssr: false,
});
import Link from 'next/link';

type ToolbarCalendarProps = {
  dateProp: Date;
  className?: string;
};

export default function ToolbarCalendar({
  dateProp,
  className,
}: ToolbarCalendarProps) {
  const [pixels, setPixels] = useState<PixelWithRelations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPixels = async () => {
      const from = startOfMonth(dateProp);
      const to = endOfMonth(dateProp);
      const fetchedPixels = await getUserPixelsByRange(from, to);
      if (fetchedPixels.success && fetchedPixels.data) {
        setPixels(fetchedPixels.data || []);
        setLoading(false);
      }
    };
    fetchPixels();
  }, [dateProp]);
  // const pixel = pixels.find(
  //   (pixel) =>
  //     format(pixel.pixelDate, 'yyyy-MM-dd') === format(dateProp, 'yyyy-MM-dd')
  // );
  return (
    <Popover>
      <Tooltip delayDuration={100}>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'w-4 font-normal ',
                !dateProp && 'text-muted-foreground',
                className
              )}
            >
              <CalendarIcon />
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
            ) : dateProp ? (
              format(dateProp, 'PPP')
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
          <CalendarGrid currentDate={dateProp} pixels={pixels}>
            {(date, background) => {
              const disabled = date.getMonth() !== dateProp.getMonth();
              return (
                <Link
                  className={`w-full ${
                    disabled
                      ? 'opacity-50 pointer-events-none cursor-not-allowed'
                      : '' // Core CSS disabling
                  }`}
                  aria-disabled={disabled} // Accessibility
                  tabIndex={disabled ? -1 : undefined} // Prevent tabbing
                  prefetch={disabled ? false : undefined} // Prevent prefetching
                  // It's good practice to still prevent default in case CSS fails or for robustness
                  onClick={disabled ? (e) => e.preventDefault() : undefined}
                  href={`/diary/${format(date, 'yyyy/MM/dd')}`}
                >
                  <PixelDayDisplay
                    date={date}
                    currentMonth={startOfMonth(dateProp).getMonth() + 1}
                    background={background}
                  />
                </Link>
              );
            }}
          </CalendarGrid>
        )}
      </PopoverContent>
    </Popover>
  );
}
