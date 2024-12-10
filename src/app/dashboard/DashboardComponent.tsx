'use client';
import { DatePickerWithRange } from '@/components/date-range-picker';
import { Card } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { BarChartComponent } from './BarChartComponent';
import { getUserPixelsByRange } from '@/actions/pixelActions';
import { PixelWithMood } from '../pixels/Pixels.type';
import { moodChartUtil } from './moodChartConfig';

const DashboardComponent = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const [pixels, setPixels] = useState<PixelWithMood[]>([]);
  const { config, data } = moodChartUtil(pixels);
  useEffect(() => {
    async function fetchPixels() {
      if (date && date.from && date.to) {
        const fetchedPixels = await getUserPixelsByRange(date.from, date.to);
        setPixels(fetchedPixels);
      }
    }

    fetchPixels();
  }, [date]);

  return (
    <div className='grid grid-cols-5 gap-4 p-6 w-full'>
      {/* Header */}
      <h2 className='text-3xl font-extrabold tracking-tight col-span-5 sm:col-span-3'>
        Dashboard
      </h2>

      {/* Date Picker */}
      <DatePickerWithRange
        className='col-span-5 sm:col-span-2 justify-self-end'
        date={date}
        setDate={setDate}
      />

      {/* Cards Section */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 col-span-5'>
        {[...Array(4)].map((_, index) => (
          <Card key={index} className='h-[150px]' />
        ))}
      </div>

      {/* Chart */}
      <BarChartComponent
        className='col-span-5 lg:col-span-3'
        config={config}
        data={data}
      />

      {/* Additional Card */}
      <Card className='h-[300px] lg:h-full col-span-5 lg:col-span-2' />
    </div>
  );
};

export default DashboardComponent;
