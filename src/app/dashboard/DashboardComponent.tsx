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
import { Pixel } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Color } from '../moods/mood';

export default function DashboardComponent() {
  const [loading, setLoading] = useState<boolean>(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const [mostUsedMood, setMostUsedMood] = useState<{
    moodName: string;
    data: { quantity: number; color: Color };
  }>();
  const [mostUsedMoodByYear, setMostUsedMoodByYear] = useState<{
    moodName: string;
    data: { quantity: number; color: Color };
  }>();

  const [pixels, setPixels] = useState<Pixel[]>([]);
  const { data, config } = generateChartData(pixels);

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
      }

      setLoading(false);
    }

    fetchPixels();
  }, [date]);

  return (
    <div className='relative '>
      <section
        id='dashboard-header'
        className='flex flex-col items-start gap-2 border-b border-border/40 py-2 dark:border-border md:py-10 lg:py-12
      bg-background/95 backdrop-blur 
    supports-[backdrop-filter]:bg-background/60 sticky top-10 z-50'
      >
        <div className='container px-6 flex mx-auto flex-wrap gap-6'>
          <h1 className='text-2xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]'>
            Dashboard
          </h1>
          <DatePickerWithRange
            className='sm:w-auto justify-self-end sm:ml-auto'
            date={date}
            setDate={setDate}
          />
        </div>
      </section>
      <div className='container px-6 py-6 mx-auto'>
        <section id='dashboard-content' className='scroll-mt-20'>
          <div className='grid flex-1 gap-12'>
            <div
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
                            backgroundColor:
                              mostUsedMoodByYear.data.color.value,
                          }}
                          className='w-3 h-3 rounded'
                        ></div>
                        <h4 className='text-md font-extrabold tracking-tighter inline'>
                          {mostUsedMoodByYear.moodName}
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
                          {mostUsedMood.moodName}
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
                  <CardContent></CardContent>
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
            </div>

            <div
              id='charts'
              className='grid flex-1 scroll-mt-20 items-start gap-10 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:gap-10'
            >
              {loading ? (
                <Skeleton className='h-96'></Skeleton>
              ) : (
                <div>
                  <Tabs
                    defaultValue='bar'
                    className='col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2'
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
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
