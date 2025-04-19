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
import { Event, MoodToPixel, Pixel, PixelToEvent } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import RadarChartComponent from './RadarChartComponent';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Extend PixelToEvent with the full Event data

export type Color = {
  value: string;
};

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

  const [sortedEvents, setSortedEvents] = useState<
    { event: Event; count: number }[]
  >([]);

  function getMostUsedMood(pixels: Pixel[]): { moodName: string; data: { quantity: number; color: Color } } | undefined {
    const moodCounts: { [moodName: string]: { quantity: number; color: Color } } = {};
  
    pixels.forEach(pixel => {
      if (pixel.moods && pixel.moods.length > 0) {
        pixel.moods.forEach((moodToPixel:MoodToPixel) => {
          const mood = moodToPixel.mood;
          if (mood) {
            const moodName = mood.name;
            if (!moodCounts[moodName]) {
              moodCounts[moodName] = { quantity: 0, color: mood.color };
            }
            moodCounts[moodName].quantity++;
          }
        });
      }
    });
  
    const sortedMoods = Object.entries(moodCounts)
      .map(([moodName, data]) => ({ moodName, data }))
      .sort((a, b) => b.data.quantity - a.data.quantity);
  
    const mostUsed = sortedMoods[0];
    return mostUsed;
  }

  function getEventClassament(
    pixels: Pixel[]
  ): { event: Event; count: number }[] {
    const eventCount: { [key: string]: number } = {};

    pixels.forEach((pixel) => {
      pixel.events.forEach((pixelToEvent: PixelToEvent & { event: Event }) => {
        if (pixelToEvent && pixelToEvent.event) {
          eventCount[pixelToEvent.event.name] =
            (eventCount[pixelToEvent.event.name] || 0) + 1;
        }
      });
    });

    const sortedEvents = Object.entries(eventCount).sort((a, b) => b[1] - a[1]);

    return sortedEvents.map(([eventName, count]) => ({
      event: {
        name: eventName,
      } as Event, // Cast to Event
      count,
    }));
  }

  useEffect(() => {
    async function fetchPixels() {
      const pixelsTotal = (await getUserPixels()) as Pixel[];

      const pixelsByYear = (await getUserPixelsByRange(
        startOfYear(new Date()),
        endOfYear(new Date())
      )) as Pixel[];

      setMostUsedMood(getMostUsedMood(pixelsTotal));
      setMostUsedMoodByYear(getMostUsedMood(pixelsByYear));

      if (date && date.from && date.to) {
        const pixelsBySelectedRange = (await getUserPixelsByRange(
          date.from,
          date.to
        )) as Pixel[];
        setPixels(pixelsBySelectedRange);
        const eventClassament = getEventClassament(pixelsBySelectedRange);
        setSortedEvents(eventClassament);
      } else {
        const eventClassament = getEventClassament(pixelsTotal);
        setPixels(pixelsTotal);
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
        className=' flex-col items-start border-b border-border/40 py-2 dark:border-border md:py-10 lg:py-12
      bg-background/95 backdrop-blur 
    supports-backdrop-filter:bg-background/60 sticky top-10 z-50 container px-6 flex mx-auto flex-wrap gap-6'
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
                    <h4 className='text-sm font-extrabold tracking-tighter inline'>
                      {mostUsedMoodByYear.moodName.length > 10
                        ? `${mostUsedMoodByYear.moodName
                            .charAt(0)
                            .toUpperCase()}${mostUsedMoodByYear.moodName.slice(
                            1,
                            10
                          )}...`
                        : `${mostUsedMoodByYear.moodName
                            .charAt(0)
                            .toUpperCase()}${mostUsedMoodByYear.moodName.slice(
                            1
                          )}`}
                    </h4>
                  </div>
                  <small className='text-sm text-muted-foreground'>
                    {mostUsedMoodByYear.data.quantity >= 1
                      ? `${mostUsedMoodByYear.data.quantity} times`
                      : ` ${mostUsedMoodByYear.data.quantity} + time`}
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
                    <h4 className='text-sm font-extrabold tracking-tighter inline'>
                      {mostUsedMood.moodName.length > 10
                        ? ` ${mostUsedMood.moodName
                            .charAt(0)
                            .toUpperCase()}${mostUsedMood.moodName.slice(
                            1,
                            10
                          )}...`
                        : `${mostUsedMood.moodName
                            .charAt(0)
                            .toUpperCase()}${mostUsedMood.moodName.slice(1)}`}
                    </h4>
                  </div>
                  <small className='text-sm text-muted-foreground'>
                    {mostUsedMood.data.quantity >= 1
                      ? `${mostUsedMood.data.quantity} times`
                      : `${mostUsedMood.data.quantity} time`}
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
                <CardTitle>Top events</CardTitle>
                <CardDescription>Your top events this year</CardDescription>
              </CardHeader>
              <CardContent>
                <ul>
                  {sortedEvents.map(({ event, count }) => (
                    <li key={event.name} className=''>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h4 className='flex justify-between text-sm font-extrabold tracking-tighter'>
                            <span>
                              {event.name.length > 25
                                ? `${event.name.slice(0, 25)}...`
                                : `${event.name}`}
                            </span>
                            <span>{count} </span>
                          </h4>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{event.name}</p>
                        </TooltipContent>
                      </Tooltip>
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
              className='col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 max-w-[450px]'
            >
              <TabsList className='grid grid-cols-3'>
                <TabsTrigger value='bar'>Bar Chart</TabsTrigger>
                <TabsTrigger value='pie'>Pie Chart</TabsTrigger>
                <TabsTrigger value='radar'>Radar Chart</TabsTrigger>
              </TabsList>
              <TabsContent value='bar'>
                <BarChartComponent config={config} data={data} />
              </TabsContent>
              <TabsContent value='pie'>
                <PieChartComponent config={config} data={data} />
              </TabsContent>
              <TabsContent value='radar'>
                <RadarChartComponent config={config} data={data} />
              </TabsContent>
            </Tabs>
          )}
        </section>
      </section>
    </div>
  );
}
