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
    <Card className='p-2 flex flex-col gap-2'>
      <Card className='p-2'>{year}</Card>
      <div className='flex flex-row gap-2'>
        {months.map((month) => (
          <Button
            key={month.index}
            className='p-3 rounded-xl'
            onClick={() => handleSelectMonth(month)}
          >
            {month.name}
          </Button>
        ))}
      </div>
      <PixelsComponent selectedMonth={selectedMonth} selectedYear={year} />
    </Card>
  );
}
