'use client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import PixelsComponent from './PixelsComponent';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function YearInPixels() {
  const year = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(year);

  const [date, setDate] = useState<Date>(new Date());

  const years = Array.from({ length: 10 }, (_, i) => year - 5 + i);

  const handleSelectYear = (value: string) => {
    const newYear = parseInt(value);
    setSelectedYear(newYear);
    const newDate = new Date(date);
    newDate.setFullYear(newYear);
    setDate(newDate);
  };
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const handleSelectMonth = (month: number) => {
    const newDate = new Date(date);
    newDate.setMonth(month);
    setDate(newDate);
  };
  return (
    <div className='relative'>
      <section className='flex flex-col items-start gap-2 border-b border-border/40 py-8 dark:border-border md:py-10 lg:py-12'>
        <div className='container px-6 flex mx-auto flex-wrap gap-6'>
          <h1 className='text-2xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]'>
            Manage your pixels
          </h1>
        </div>
      </section>
      <section className='container px-6 py-6 mx-auto flex flex-col gap-6 max-w-[800px]'>
        <div className='container flex mx-auto flex-wrap gap-6'>
          <Select
            onValueChange={handleSelectYear}
            value={selectedYear.toString()}
          >
            <SelectTrigger className='max-w-[180px]'>
              <SelectValue placeholder={selectedYear.toString()} />
            </SelectTrigger>
            <SelectContent className='max-h-48 overflow-y-auto'>
              <SelectGroup>
                <SelectLabel>Year</SelectLabel>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='grid grid-cols-6 gap-2 max-sm:grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 rounded-xl'>
          {months.map((month) => (
            <Button
              key={month}
              className={`
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
      </section>
    </div>
  );
}
