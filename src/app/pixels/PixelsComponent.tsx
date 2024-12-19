'use client';

import { useEffect, useState } from 'react';
import AddPixelDialog from './AddPixelDialog';
import { PixelComponentProps } from './pixel';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getUserPixelsByRange } from '@/actions/pixelActions';
import { Pixel } from '@prisma/client';
import {
  addDays,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
} from 'date-fns';

export default function PixelsComponent({ date }: PixelComponentProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  });

  const weekdayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  useEffect(() => {
    const fetchPixels = async () => {
      const from = startOfMonth(date);
      const to = endOfMonth(date);
      const fetchedPixels = await getUserPixelsByRange(from, to);
      if (fetchedPixels) {
        setPixels(fetchedPixels);
        setLoading(false);
      }
    };

    fetchPixels();
  }, [date]);

  const handleSelectDay = (selectedDay: Date) => {
    setSelectedDate(selectedDay);
    if (!open) setOpen(true);
  };

  const getPixelForDay = (day: Date) =>
    pixels.find((pixel) =>
      isEqual(startOfDay(pixel.pixelDate), startOfDay(day))
    );

  const today = new Date();
  const tomorrow = addDays(today, 1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {daysInMonth.map((day) => {
        const pixel = getPixelForDay(day);
        const moodColor = pixel?.mood?.color.value || '';
        const isDisabled = isAfter(day, tomorrow) || isBefore(day, new Date('1900-01-01'));
        const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

        return loading ? (
          <Skeleton key={day.toISOString()} className="h-[40px]" />
        ) : (
          <Button
            variant={'outline'}
            style={{ backgroundColor: moodColor }}
            key={day.toISOString()}
            onClick={() => handleSelectDay(day)}
            className="p-3 cursor-pointer h-[40px] flex items-center hover:opacity-90"
            disabled={isDisabled}
          >
            {format(day, 'd')} - {weekdayNames[getDay(day)]}
            {isToday && ' - Today'}
          </Button>
        );
      })}
      {selectedDate && (
        <AddPixelDialog
          date={selectedDate}
          open={open}
          setOpen={setOpen}
          setPixels={setPixels}
          pixels={pixels}
        />
      )}
    </div>
  );
}
