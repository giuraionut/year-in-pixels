'use client';

import calendarUtils, { Day } from '../lib/calendarUtils';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { getUserPixelsForMonth } from '../actions/pixelActions';
import AddPixelDialog from './AddPixelDialog';
import { DaysProps, PixelWithMood } from './Pixels.type';
import { Skeleton } from '@/components/ui/skeleton';

export default function PixelsComponent({
  selectedMonth,
  selectedYear,
}: DaysProps) {
  const { daysByMonth, weekdayNames, currentMonth } = calendarUtils();
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
    setSelectedDay(day);
    setOpen(true);
  };

  const getPixelForDay = (dayIndex: number) => {
    const p = pixels.find(
      (pixel) =>
        pixel.day === dayIndex &&
        pixel.month === selectedMonth.index &&
        pixel.year === selectedYear
    );
    return p;
  };

  useEffect(() => {
    console.log('Selected month', selectedMonth, 'year', selectedYear);
  }, [selectedMonth, selectedYear]);
  return (
    <>
      <div className='grid grid-cols-4 gap-1'>
        {daysByMonth[selectedMonth.index].map((day) => {
          const pixel = getPixelForDay(day.dayIndex);
          const moodColor = pixel?.mood?.color || '';

          return loading ? (
            <Skeleton key={day.dayIndex} className='w-[225px] h-[42px]' />
          ) : (
            <Card
              style={{ backgroundColor: moodColor }}
              key={day.dayIndex}
              onClick={() => handleSelectDay(day)}
              className={`p-3 cursor-pointer w-[225px] h-[42px] ${
                day.currentDay && currentMonth.index === selectedMonth.index
                  ? 'dark'
                  : ''
              }`}
            >
              {day.dayIndex} - {weekdayNames[day.weekdayIndex]}
            </Card>
          );
        })}

        {selectedDay && (
          <AddPixelDialog
            setPixels={setPixels} // Ensure the updated pixels are passed back to the parent component
            pixels={pixels}
            open={open}
            setOpen={setOpen}
            day={selectedDay}
            month={selectedMonth}
            year={selectedYear}
          />
        )}
      </div>
    </>
  );
}
