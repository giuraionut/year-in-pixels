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
import { startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import { LoadingDots } from '@/components/icons/loading-dots';
import PixelsByYear from './PixelsByYear';
import { Button } from '@/components/ui/button';

export default function YearInPixels() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedYear, setSelectedYear] = useState<number>(date.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const [pixelsByRange, setPixelsByRange] = useState<Pixel[]>([]);

  const [loadingPixelsByRange, setLoadingPixelsByRange] =
    useState<boolean>(true);

  const [showCalendar, setShowCalendar] = useState<boolean>(true);

  const years = Array.from({ length: 10 }, (_, i) => selectedYear - 5 + i);

  const handleSelectYear = (value: string) => {
    const newYear = parseInt(value);
    setSelectedYear(newYear);
    setDate(new Date(newYear, 0, 1)); // Update date to Jan 1st of the selected year
  };

  const fetchPixelsByRange = async (from: Date, to: Date) => {
    setLoadingPixelsByRange(true); // Set loading before fetching
    const fetchedPixels = await getUserPixelsByRange(from, to);
    if (fetchedPixels) {
      setPixelsByRange(fetchedPixels);
    }
    setLoadingPixelsByRange(false); // Stop loading after fetching
  };

  useEffect(() => {
    // Fetch pixels for the selected year
    const from = startOfYear(new Date(selectedYear, 0, 1));
    const to = endOfYear(new Date(selectedYear, 11, 31));
    console.log('from', from);
    console.log('to', to);
    fetchPixelsByRange(from, to);
  }, [selectedYear]);

  const handleSelectDay = (selectedDay: Date) => {
    setSelectedDate(selectedDay);
    if (!open) setOpen(true);
  };
  return (
    <div className='relative flex flex-col items-start gap-2'>
      <section className='container px-6 flex mx-auto flex-wrap gap-6 border-b border-border/40 py-8 dark:border-border md:py-10 lg:py-12'>
        <h1 className='text-2xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]'>
          Manage your pixels
        </h1>
        {loadingPixelsByRange && (
          <div className='container px-6 py-6 mx-auto flex flex-col justify-between gap-6 max-w-[800px]'>
            <LoadingDots />
          </div>
        )}
      </section>
      {!loadingPixelsByRange && (
        <>
          <section className='container px-6 py-6 mx-auto flex flex-col gap-6 max-w-[800px]'>
            <div className='container flex items-center mx-auto gap-6'>
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

              <Button
                variant='secondary'
                onClick={() => setShowCalendar((prev) => !prev)}
              >
                {showCalendar ? 'Show All Pixels' : 'Show Calendar'}
              </Button>
            </div>
          </section>

          {showCalendar ? (
            <section className='container px-6 py-6 mx-auto flex flex-col gap-6 max-w-[800px]'>
              <CalendarGrid
                date={date}
                setDate={setDate}
                onDaySelect={handleSelectDay}
                pixels={pixelsByRange}
              />
              {selectedDate && (
                <AddPixelDialog
                  date={selectedDate}
                  open={open}
                  setOpen={setOpen}
                  setPixels={setPixelsByRange}
                  pixels={pixelsByRange}
                />
              )}
            </section>
          ) : (
            <section className='container px-6 py-6 mx-auto flex flex-col gap-6 max-w-[800px]'>
              <PixelsByYear pixels={pixelsByRange} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
