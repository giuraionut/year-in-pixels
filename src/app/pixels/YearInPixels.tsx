'use client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import PixelsComponent from './PixelsComponent';

export default function YearInPixels() {
  const [date, setDate] = useState<Date>(new Date());
  const year = date.getFullYear();
  // const [selectedYear, setSelectedYear] = useState<number>(year);
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const handleSelectMonth = (month: number) => {
    const newDate = new Date(date);
    newDate?.setMonth(month);
    setDate(newDate);
  };
  return (
    <div className='p-2 flex flex-col gap-3 max-w-[750px]'>
      <Card className='p-2'>
        <h4 className='scroll-m-20 text-xl font-semibold tracking-tight text-center'>
          Manage your pixels
        </h4>
      </Card>
      <div className='grid grid-cols-6 max-sm:grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-y-2 rounded-xl'>
        {months.map((month) => (
          <Button
            key={month}
            className={`
              mx-1
              ${
                date.getMonth() === month
                  ? 'bg-slate-500 text-white hover:bg-slate-400'
                  : ''
              }
            `}
            onClick={() => handleSelectMonth(month)}
          >
            {new Date(year, month)
              .toLocaleString('default', { month: 'long' })
              .split('', 3)}
          </Button>
        ))}
      </div>
      <PixelsComponent date={date} />
    </div>
  );
}
