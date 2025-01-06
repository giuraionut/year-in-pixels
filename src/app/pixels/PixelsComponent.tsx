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
import { startOfYear, endOfYear } from 'date-fns';
import { LoadingDots } from '@/components/icons/loading-dots';
import PixelsGrid from './PixelsGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function YearInPixels() {
  const [date, setDate] = useState<Date>(new Date()); // Single state for date
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const [pixelsCache, setPixelsCache] = useState<Record<number, Pixel[]>>({}); // Cache pixels by year
  const [pixelsByRange, setPixelsByRange] = useState<Pixel[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true); // Initial page load

  const years = Array.from(
    { length: 10 },
    (_, i) => date.getFullYear() - 5 + i
  ); // Generate years based on current date

  const handleSelectYear = (value: string) => {
    const newYear = parseInt(value, 10);
    setDate(new Date(newYear, 0, 1)); // Update date to the selected year's January 1st
  };

  const fetchPixelsByRange = async (year: number) => {
    if (pixelsCache[year]) {
      // If pixels are cached for this year, use them
      setPixelsByRange(pixelsCache[year]);
      return;
    }

    const from = startOfYear(new Date(year, 0, 1));
    const to = endOfYear(new Date(year, 11, 31));

    // Fetch pixels from the server
    const fetchedPixels = await getUserPixelsByRange(from, to);
    if (fetchedPixels) {
      setPixelsCache((prevCache) => ({
        ...prevCache,
        [year]: fetchedPixels, // Cache the fetched pixels
      }));
      setPixelsByRange(fetchedPixels);
    }
  };

  useEffect(() => {
    const currentYear = date.getFullYear();

    const loadPixels = async () => {
      // Only show loading indicator on the first fetch
      if (initialLoading) {
        setInitialLoading(true);
      }
      await fetchPixelsByRange(currentYear);
      if (initialLoading) {
        setInitialLoading(false); // Disable initial loading after first fetch
      }
    };

    loadPixels();
  }, [date]);

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
        {initialLoading && (
          <div className='container px-6 py-6 mx-auto flex flex-col justify-between gap-6 max-w-[800px]'>
            <LoadingDots />
          </div>
        )}
      </section>
      {!initialLoading && (
        <section className='container px-6 py-6 mx-auto flex flex-col gap-6 max-w-[900px]'>
          <Tabs defaultValue='calendar'>
            <TabsList className='w-full gap-3 grid grid-cols-5'>
              <Select
                onValueChange={handleSelectYear}
                value={date.getFullYear().toString()} // Use the year from the date
              >
                <SelectTrigger className='max-w-[100px] h-7 col-span-2'>
                  <SelectValue placeholder={date.getFullYear().toString()} />
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
              <div className='col-span-3'>
                <TabsTrigger value='calendar'>Calendar</TabsTrigger>
                <TabsTrigger value='grid'>Pixels</TabsTrigger>
              </div>
            </TabsList>

            <TabsContent value='calendar'>
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
                  setPixels={(updatedPixels) => {
                    setPixelsByRange(updatedPixels);
                    // Update the cache as well
                    setPixelsCache((prevCache: Record<number, Pixel[]>) => ({
                      ...prevCache,
                      [date.getFullYear()]: updatedPixels as Pixel[],
                    }));
                  }}
                  pixels={pixelsByRange}
                />
              )}
            </TabsContent>
            <TabsContent value='grid'>
              <PixelsGrid pixels={pixelsByRange} year={date.getFullYear()} />
            </TabsContent>
          </Tabs>
        </section>
      )}
    </div>
  );
}
