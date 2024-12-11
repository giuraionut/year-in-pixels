'use client';
import { DatePickerWithRange } from '@/components/date-range-picker';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { getUserPixels, getUserPixelsByRange } from '@/actions/pixelActions';
import { PixelWithMood } from '../pixels/Pixels.type';
import { endOfYear, startOfYear } from 'date-fns';
import { PieChartComponent } from './PieChartComponent';
import { BarChartComponent } from './BarChartComponent';
import generateChartData from './moodChartConfig';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DashboardComponent = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const [mostUsedMood, setMostUsedMood] = useState<{
    moodName: string;
    data: { quantity: number; color: string };
  }>();
  const [mostUsedMoodByYear, setMostUsedMoodByYear] = useState<{
    moodName: string;
    data: { quantity: number; color: string };
  }>();

  const [pixels, setPixels] = useState<PixelWithMood[]>([]);
  const { data, config } = generateChartData(pixels);

  function getMostUsedMood(pixels: PixelWithMood[]) {
    const r = pixels.reduce(
      (
        acc: { [key: string]: { quantity: number; color: string } },
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
    }

    fetchPixels();
  }, [date]);

  return (
    <div className='grid grid-cols-5 gap-4 p-6 w-full'>
      <h2 className='text-3xl font-extrabold tracking-tight col-span-5 sm:col-span-3'>
        Dashboard
      </h2>
      <DatePickerWithRange
        className='col-span-5 sm:col-span-2 justify-self-end'
        date={date}
        setDate={setDate}
      />

      <div className='col-span-5 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        {mostUsedMood && (
          <Card>
            <CardHeader>
              <CardTitle>Favorite Mood</CardTitle>
              <CardDescription>All Time</CardDescription>
            </CardHeader>
            <CardContent>
              <>
                <div className='flex items-center gap-1'>
                  <div
                    style={{ backgroundColor: mostUsedMood.data.color }}
                    className='w-3 h-3 rounded'
                  ></div>
                  <h4 className='text-md font-extrabold tracking-tighter inline'>
                    {mostUsedMood.moodName}
                  </h4>
                </div>
                <small className='test-sm text-muted-foreground'>6 times</small>
              </>
            </CardContent>
          </Card>
        )}

        {mostUsedMoodByYear && (
          <Card>
            <CardHeader>
              <CardTitle>Favorite Mood</CardTitle>
              <CardDescription>This Year</CardDescription>
            </CardHeader>
            <CardContent>
              <>
                <div className='flex items-center gap-1'>
                  <div
                    style={{ backgroundColor: mostUsedMoodByYear.data.color }}
                    className='w-3 h-3 rounded'
                  ></div>
                  <h4 className='text-md font-extrabold tracking-tighter inline'>
                    {mostUsedMoodByYear.moodName}
                  </h4>
                </div>
                <small className='test-sm text-muted-foreground'>6 times</small>
              </>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue='bar' className='lg:h-full col-span-5 lg:col-span-2'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='bar'>Bar Chart</TabsTrigger>
          <TabsTrigger value='pie'>Pie Chiart</TabsTrigger>
        </TabsList>
        <TabsContent value='bar'>
          <BarChartComponent config={config} data={data} />
        </TabsContent>
        <TabsContent value='pie'>
          <PieChartComponent config={config} data={data} />
        </TabsContent>
      </Tabs>

      {/* <Card className=' lg:h-full col-span-5 lg:col-span-2' /> */}
    </div>
  );
};

export default DashboardComponent;
