'use client';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CalendarGrid from '@/components/calendar-grid';
import AddPixelDialog from './AddPixelDialog';
import { Pixel } from '@prisma/client';
import { getUserPixelsByRange } from '@/actions/pixelActions';
import { startOfMonth, endOfMonth } from 'date-fns';
import { LoadingDots } from '@/components/icons/loading-dots';

export default function YearInPixels() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(date.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const years = Array.from({ length: 10 }, (_, i) => selectedYear - 5 + i);

  const handleSelectYear = (value: string) => {
    const newYear = parseInt(value);
    setSelectedYear(newYear);
    const newDate = new Date(date);
    newDate.setFullYear(newYear);
    setDate(newDate);
  };

  useEffect(() => {
    setSelectedYear(date.getFullYear());

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

  useEffect(() => {
    console.log('pixels', pixels);
  }, [pixels]);
  return (
    <div className='relative'>
      <section className='flex flex-col items-start gap-2 border-b border-border/40 py-8 dark:border-border md:py-10 lg:py-12'>
        <div className='container px-6 flex mx-auto flex-wrap gap-6'>
          <h1 className='text-2xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]'>
            Manage your pixels{' '}
            {loading && (
              <div className='container px-6 py-6 mx-auto flex flex-col justify-between gap-6 max-w-[800px]'>
                <LoadingDots />
              </div>
            )}
          </h1>
        </div>
      </section>
      {!loading && (
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

          <CalendarGrid
            date={date}
            setDate={setDate}
            onDaySelect={handleSelectDay}
            pixels={pixels}
          />
          {selectedDate && (
            <AddPixelDialog
              date={selectedDate}
              open={open}
              setOpen={setOpen}
              setPixels={setPixels}
              pixels={pixels}
            />
          )}
        </section>
      )}
    </div>
  );
}
