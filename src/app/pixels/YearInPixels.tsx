'use client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import PixelsComponent from './PixelsComponent';
import calendarUtils, { SelectedMonth } from '../lib/calendarUtils';

export default function YearInPixels() {
  const { year, months, currentMonth } = calendarUtils();

  // const [selectedYear, setSelectedYear] = useState<number>(year);
  const [selectedMonth, setSelectedMonth] =
    useState<SelectedMonth>(currentMonth);

  const handleSelectMonth = (month: SelectedMonth) => {
    setSelectedMonth(month);
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
            key={month.index}
            className={`
              mx-1
              ${
                currentMonth.index === month.index
                  ? 'bg-slate-500 text-white hover:bg-slate-400'
                  : ''
              }
            `}
            onClick={() => handleSelectMonth(month)}
          >
            {month.name.split('', 3)}
          </Button>
        ))}
      </div>
      <PixelsComponent selectedMonth={selectedMonth} selectedYear={year} />
    </div>
  );
}
