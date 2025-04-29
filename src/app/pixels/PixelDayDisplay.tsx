'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PixelDayDisplayProps = {
  date: Date;
  background: string;
  className?: string;
  /** 1–12 */
  currentMonth: number;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const PixelDayDisplay = forwardRef<
  HTMLButtonElement,
  PixelDayDisplayProps
>(({ date, background, className, currentMonth, ...buttonProps }, ref) => {
  const [todayStart, setTodayStart] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setTodayStart(now);
  }, []);

  // wait for client‐side mount
  if (todayStart === null) return null;

  // normalize the cell’s date to midnight
  const dateStart = startOfDay(date);
  const minDate = startOfDay(new Date('1900-01-01'));

  // zero-based month comparison
  const monthMatches = dateStart.getMonth() === currentMonth - 1;

  const disabled =
    isAfter(dateStart, todayStart) ||
    isBefore(dateStart, minDate) ||
    !monthMatches;

  return (
    <Button
      ref={ref}
      {...buttonProps}
      variant="outline"
      size="icon"
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
      type="button"
      tabIndex={disabled ? -1 : undefined}
    >
      <span className="text-xs font-medium text-foreground/80">
        {format(dateStart, 'd')}
      </span>
    </Button>
  );
});

PixelDayDisplay.displayName = 'PixelDayDisplay';
export default PixelDayDisplay;
