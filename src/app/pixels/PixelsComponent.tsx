'use client';

import calendarUtils from '../../lib/calendarUtils';
import { useEffect, useState } from 'react';
import AddPixelDialog from './AddPixelDialog';
import { PixelComponentProps } from './Pixels.type';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getUserPixelsByRange } from '@/actions/pixelActions';
import { Pixel } from '@prisma/client';

export default function PixelsComponent({ date }: PixelComponentProps) {
  const { daysByMonth, weekdayNames } = calendarUtils();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPixels = async () => {
      console.log('DATE', date);
      const from = new Date(date.getFullYear(), date.getMonth(), 1);
      const to = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const fetchedPixels = await getUserPixelsByRange(from, to);
      if (fetchedPixels) {
        setPixels(fetchedPixels);
        setLoading(false);
      }
    };

    fetchPixels();
  }, [date]);

  const handleSelectDay = (day: number) => {
    const newDate = new Date(date);
    newDate.setDate(day);
    setSelectedDate(newDate);
    if (!open) setOpen(true);
  };

  const getPixelForDay = (day: number) => {
    const pixel = pixels.find(
      (pixel) =>
        pixel.pixelDate.getFullYear() === date.getFullYear() &&
        pixel.pixelDate.getMonth() === date.getMonth() &&
        pixel.pixelDate.getDate() === day
    );
    return pixel;
  };

  return (
    <div className='grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-2'>
      {daysByMonth[date.getMonth()].map((day) => {
        const pixel = getPixelForDay(day.dayIndex);
        const moodColor = pixel?.mood?.color.value || '';

        return loading ? (
          <Skeleton key={day.dayIndex} className='h-[40px]' />
        ) : (
          <Button
            style={{ backgroundColor: moodColor }}
            key={day.dayIndex}
            onClick={() => handleSelectDay(day.dayIndex)}
            className={`p-3 cursor-pointer h-[40px] flex items-center justify-between hover:opacity-90`}
          >
            {day.dayIndex} - {weekdayNames[day.weekdayIndex]}
            {day.currentDay && ' - Today'}
          </Button>
        );
      })}
      {selectedDate && (
        <AddPixelDialog
          date={selectedDate}
          open={open}
          setOpen={setOpen}
          setPixels={setPixels} // Ensure the updated pixels are passed back to the parent component
          pixels={pixels}
        />
      )}
    </div>
  );
}
