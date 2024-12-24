'use client';
import DatePickerWithRange from '@/components/date-range-picker';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { getUserPixels, getUserPixelsByRange } from '@/actions/pixelActions';
import { endOfYear, startOfYear } from 'date-fns';
import PieChartComponent from './PieChartComponent';
import BarChartComponent from './BarChartComponent';
import generateChartData from './mood-chart-config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pixel, Event } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Color } from '../moods/mood';

export default function DashboardComponent() {
  const [loading, setLoading] = useState<boolean>(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const [pixels, setPixels] = useState<Pixel[]>([]);
  const { data, config } = generateChartData(pixels);

  const [mostUsedMood, setMostUsedMood] = useState<{
    moodName: string;
    data: { quantity: number; color: Color };
  }>();
  const [mostUsedMoodByYear, setMostUsedMoodByYear] = useState<{
    moodName: string;
    data: { quantity: number; color: Color };
  }>();

  const [events, setEvents] = useState<Event[]>([]);
  const [sortedEvents, setSortedEvents] = useState<
    { event: { name: string }; count: number }[]
  >([]);
  function getMostUsedMood(pixels: Pixel[]) {
    const r = pixels.reduce(
      (
        acc: { [key: string]: { quantity: number; color: Color } },
        { mood }
      ) => {
        const moodName = mood.name;
        if (!acc[moodName]) acc[moodName] = { quantity: 0, color: mood.color };
        acc[moodName].quantity += 1;
        return acc;
      },
      {}
    );

    const s = Object.entries(r)
      .map(([moodName, data]) => ({ moodName, data }))
      .sort((a, b) => b.data.quantity - a.data.quantity);

    const mostUsed = s[0];
    return mostUsed;
  }

  function getEventClassament(pixels: Pixel[]) {
    // Create an object to store event frequencies
    const eventCount: { [key: string]: number } = {};

    // Loop through the array of objects
    pixels.forEach((pixel) => {
      // Loop through the events in each object
      pixel.events.forEach((event: Event) => {
        // If event exists in eventCount, increment its count, otherwise set it to 1
        eventCount[event.name] = (eventCount[event.name] || 0) + 1;
      });
    });

    // Convert the eventCount object to an array of [event, count] pairs
    const sortedEvents = Object.entries(eventCount).sort((a, b) => b[1] - a[1]); // Sort by frequency in descending order

    // Return the sorted events with their counts
    return sortedEvents.map(([eventName, count]) => ({
      event: { name: eventName },
      count,
    }));
  }

  useEffect(() => {
    async function fetchPixels() {
      const pixelsTotal = await getUserPixels();

      const pixelsByYear = await getUserPixelsByRange(
        startOfYear(new Date()),
        endOfYear(new Date())
      );
      setMostUsedMood(getMostUsedMood(pixelsTotal));
      setMostUsedMoodByYear(getMostUsedMood(pixelsByYear));

      if (date && date.from && date.to) {
        const pixelsBySelectedRange = await getUserPixelsByRange(
          date.from,
          date.to
        );
        setPixels(pixelsBySelectedRange);
        const eventClassament = getEventClassament(pixelsBySelectedRange);
        setSortedEvents(eventClassament);
      } else {
        const eventClassament = getEventClassament(pixelsTotal);
        setSortedEvents(eventClassament);
      }

      setLoading(false);
    }

    fetchPixels();
  }, [date]);

  return (
    <div className='relative flex flex-col items-start gap-2'>
      <section
        id='dashboard-header'
        className='flex flex-col items-start gap-2 border-b border-border/40 py-2 dark:border-border md:py-10 lg:py-12
      bg-background/95 backdrop-blur 
    supports-[backdrop-filter]:bg-background/60 sticky top-10 z-50 container px-6 flex mx-auto flex-wrap gap-6'
      >
        <h1 className='text-2xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]'>
          Dashboard
        </h1>
        <DatePickerWithRange
          className='sm:w-auto justify-self-end sm:ml-auto'
          date={date}
          setDate={setDate}
        />
      </section>
      <section
        id='dashboard-content'
        className='scroll-mt-20 container px-6 py-6 mx-auto grid flex-1 gap-12'
      >
        <section
          id='cards'
          className='grid flex-1 scroll-mt-20 items-start gap-10 md:grid-cols-2 md:gap-6 lg:grid-cols-4 xl:gap-10'
        >
          {loading ? (
            <Skeleton className='h-48'></Skeleton>
          ) : (
            mostUsedMoodByYear && (
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Mood</CardTitle>
                  <CardDescription>This Year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-1'>
                    <div
                      style={{
                        backgroundColor: mostUsedMoodByYear.data.color.value,
                      }}
                      className='w-3 h-3 rounded'
                    ></div>
                    <h4 className='text-md font-extrabold tracking-tighter inline'>
                      {mostUsedMoodByYear.moodName.toUpperCase()}
                    </h4>
                  </div>
                  <small className='text-sm text-muted-foreground'>
                    {mostUsedMoodByYear.data.quantity >= 1
                      ? mostUsedMoodByYear.data.quantity + ' time'
                      : mostUsedMoodByYear.data.quantity + ' times'}
                  </small>
                </CardContent>
              </Card>
            )
          )}
          {loading ? (
            <Skeleton className='h-48'></Skeleton>
          ) : (
            mostUsedMood && (
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Mood</CardTitle>
                  <CardDescription>All Time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-1'>
                    <div
                      style={{
                        backgroundColor: mostUsedMood.data.color.value,
                      }}
                      className='w-3 h-3 rounded'
                    ></div>
                    <h4 className='text-md font-extrabold tracking-tighter inline'>
                      {mostUsedMood.moodName.toUpperCase()}
                    </h4>
                  </div>
                  <small className='text-sm text-muted-foreground'>
                    {mostUsedMood.data.quantity >= 1
                      ? mostUsedMood.data.quantity + ' time'
                      : mostUsedMood.data.quantity + ' times'}
                  </small>
                </CardContent>
              </Card>
            )
          )}

          {/* Card 3 */}
          {loading ? (
            <Skeleton className='h-48'></Skeleton>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Card 3</CardTitle>
                <CardDescription>Card 3 description</CardDescription>
              </CardHeader>
              <CardContent>
                <ul>
                  {sortedEvents.map(({ event, count }) => (
                    <li key={event.name} className=''>
                      <h4 className='flex justify-between text-md font-extrabold tracking-tighter inline'>
                        <span>{event.name}</span>
                        <span>{count} times</span>
                      </h4>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Card 4 */}
          {loading ? (
            <Skeleton className='h-48'></Skeleton>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Card 3</CardTitle>
                <CardDescription>Card 3 description</CardDescription>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          )}
        </section>

        <section
          id='charts'
          className='grid flex-1 scroll-mt-20 items-start gap-10 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:gap-10'
        >
          {loading ? (
            <Skeleton className='h-96'></Skeleton>
          ) : (
            <Tabs
              defaultValue='bar'
              className='col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 max-w-[400px]'
            >
              <TabsList className='grid grid-cols-2'>
                <TabsTrigger value='bar'>Bar Chart</TabsTrigger>
                <TabsTrigger value='pie'>Pie Chart</TabsTrigger>
              </TabsList>
              <TabsContent value='bar'>
                <BarChartComponent config={config} data={data} />
              </TabsContent>
              <TabsContent value='pie'>
                <PieChartComponent config={config} data={data} />
              </TabsContent>
            </Tabs>
          )}
        </section>
      </section>
    </div>
  );
}
