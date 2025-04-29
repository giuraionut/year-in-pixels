'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { nowZoned } from '@/lib/date';

export type PixelDayDisplayProps = {
  date: Date;
  background: string;
  className?: string;
  currentMonth: number;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const PixelDayDisplay = forwardRef<HTMLButtonElement, PixelDayDisplayProps>(
  ({ date, background, className, currentMonth, ...buttonProps }, ref) => {
    const [todayStart, setTodayStart] = useState<Date | null>(null);
    console.log('todayStart', todayStart);
    // Compute “today@00:00” on mount
    useEffect(() => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      setTodayStart(now);
    }, []);
    // Don’t render until we know client-side “today”
    if (todayStart === null) {
      return null;
    }
    const disabled =
      isAfter(date, todayStart) ||
      isBefore(date, new Date('1900-01-01')) ||
      date.getMonth() + 1 !== currentMonth;

    return (
      <Button
        ref={ref}
        {...buttonProps}
        variant='outline'
        size='icon'
        className={cn(
          'w-full rounded-sm border data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed',
          className
        )}
        style={{
          background: background || 'hsl(var(--muted) / 0.5)',
          borderColor: disabled
            ? 'hsl(var(--border) / 0.2)'
            : 'hsl(var(--border))',
        }}
        disabled={disabled}
        data-disabled={disabled}
        aria-label={`Day ${format(date, 'd')}${disabled ? ', disabled' : ''}`}
        type='button'
        tabIndex={disabled ? -1 : undefined}
      >
        <span className='text-xs font-medium text-foreground/80'>
          {format(date, 'd')}
        </span>
      </Button>
    );
  }
);

PixelDayDisplay.displayName = 'PixelDayDisplay';

export default PixelDayDisplay;
