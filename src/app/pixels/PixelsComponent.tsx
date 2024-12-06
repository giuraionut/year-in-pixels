'use client';

import calendarUtils, { Day } from '../lib/calendarUtils';
import { useEffect, useState } from 'react';
import { getUserPixelsForMonth } from '../actions/pixelActions';
import AddPixelDialog from './AddPixelDialog';
import { DaysProps, PixelWithMood } from './Pixels.type';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function PixelsComponent({
  selectedMonth,
  selectedYear,
}: DaysProps) {
  const { daysByMonth, weekdayNames } = calendarUtils();
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [pixels, setPixels] = useState<PixelWithMood[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchPixels = async () => {
      const fetchedPixels = await getUserPixelsForMonth(
        selectedYear,
        selectedMonth.index
      );
      if (fetchedPixels) {
        setPixels(fetchedPixels);
        setLoading(false);
      }
    };

    fetchPixels();
  }, [selectedYear, selectedMonth]);

  const handleSelectDay = (day: Day) => {
    // Directly set the selectedDay and open the dialog
    setSelectedDay(day);
    if (!open) setOpen(true); // Open dialog only if it's not already open
  };

  const getPixelForDay = (dayIndex: number) => {
    return pixels.find(
      (pixel) =>
        pixel.day === dayIndex &&
        pixel.month === selectedMonth.index &&
        pixel.year === selectedYear
    );
  };

  useEffect(() => {
    console.log('Selected month', selectedMonth, 'year', selectedYear);
  }, [selectedMonth, selectedYear]);
  return (
    <div className='grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-2'>
      {daysByMonth[selectedMonth.index].map((day) => {
        const pixel = getPixelForDay(day.dayIndex);
        const moodColor = pixel?.mood?.color || '';

        return loading ? (
          <Skeleton key={day.dayIndex} className='h-[40px]' />
        ) : (
          <Button
            style={{ backgroundColor: moodColor }}
            key={day.dayIndex}
            onClick={() => handleSelectDay(day)}
            className={`p-3 cursor-pointer h-[40px] flex items-center justify-between hover:opacity-90`}
          >
            {day.dayIndex} - {weekdayNames[day.weekdayIndex]}
            {day.currentDay && ' - Today'}
          </Button>
        );
      })}
      {selectedDay && (
        <AddPixelDialog
          day={selectedDay}
          month={selectedMonth}
          year={selectedYear}
          open={open}
          setOpen={setOpen}
          setPixels={setPixels} // Ensure the updated pixels are passed back to the parent component
          pixels={pixels}
        />
      )}
    </div>
  );
}
