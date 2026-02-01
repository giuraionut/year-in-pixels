import { parseISO, isValid, format as formatDate } from 'date-fns';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import generateChartData from './mood-chart-config';
import { getUserPixels, getUserPixelsByRange } from '@/actions/pixelActions';
import { MoodToPixel, Pixel } from '@prisma/client';
import { getSessionUserId } from '@/actions/actionUtils';
import BarChartComponent from './BarChartComponent';
import PieChartComponent from './PieChartComponent';
import RadarChartComponent from './RadarChartComponent';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DateRangePickerClient from './DateRangePicker';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { nowZoned } from '@/lib/date';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'User activity dashboard',
};

function parseDateParam(param?: string | string[]): Date | null {
  if (typeof param !== 'string') return null;
  const d = parseISO(param);
  return isValid(d) ? d : null;
}

function getTopMoods(
  pixels: Pixel[],
  topN = 3
): Array<{ name: string; color: string; count: number }> {
  const map = new Map<string, { name: string; color: string; count: number }>();
  pixels.forEach((px) =>
    px.moods.forEach((mtp: MoodToPixel) => {
      const raw = mtp.mood.color;
      const color = typeof raw === 'string' ? JSON.parse(raw).value : raw.value;
      const key = mtp.mood.id;
      if (!map.has(key)) map.set(key, { name: mtp.mood.name, color, count: 0 });
      map.get(key)!.count++;
    })
  );
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { year, month, from, to } = await searchParams;

  let start: Date | null = null;
  let end: Date | null = null;
  if (from) {
    start = parseDateParam(from);
    end = to ? parseDateParam(to) : start;
  } else if (year && month) {
    const idx = new Date(`${month} 1, ${year}`).getMonth();
    start = new Date(Number(year), idx, 1);
    end = new Date(Number(year), idx + 1, 0);
  } else if (year) {
    const y = Number(year);
    if (!isNaN(y)) {
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31);
    }
  }
  if (!start || !end) {
    redirect(`/dashboard?year=${nowZoned().getFullYear()}`);
  }

  const fetchUserId = await getSessionUserId();
  if (!fetchUserId.success) {
    return <div className='p-6'>User not authenticated.</div>;
  }
  const userId = fetchUserId.data;
  const fetchAllPixels = await getUserPixels(userId);
  if (!fetchAllPixels.success) {
    return <div className='p-6'>Failed to fetch pixels.</div>;
  }
  const fetchPixelsByRange = await getUserPixelsByRange(start, end, userId);
  if (!fetchPixelsByRange.success) {
    return <div className='p-6'>Failed to fetch pixels by range.</div>;
  }
  const { data, config } = generateChartData(fetchPixelsByRange.data);
  const topMoods = getTopMoods(fetchAllPixels.data, 3);
  const summaryGridCols = `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-${Math.min(
    topMoods.length + 2,
    5
  )}`;
  return (
    <div className='container mx-auto px-4 py-8 sm:px-6 lg:px-8'>
      <div className='flex flex-col items-start justify-between gap-4 border-b border-border pb-6 mb-6 md:flex-row md:items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground mt-1'>
            Insights from {formatDate(start, 'MMM d, yyyy')} to{' '}
            {formatDate(end, 'MMM d, yyyy')}
          </p>
        </div>
        <DateRangePickerClient />
      </div>

      <div className={cn('grid gap-4 md:gap-6 mb-8', summaryGridCols)}>
        {topMoods.length > 0 && (
          <Carousel className='w-full max-w-xs'>
            <CarouselContent>
              {topMoods.map((m, index) => (
                <CarouselItem key={index}>
                  <Card key={m.name} className='transition hover:shadow-sm'>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium capitalize'>
                        Top Moods - {m.name}
                      </CardTitle>
                      <div
                        className='w-4 h-4 rounded-full border'
                        style={{ backgroundColor: m.color }}
                        title={m.name}
                      />
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold text-center'>
                        {m.count}
                      </div>
                      <p className='text-xs text-muted-foreground text-center'>
                        times recorded
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className='left-2 rounded-lg border-none' />
            <CarouselNext className='right-2 rounded-lg border-none' />
          </Carousel>
        )}

        <Card className='transition hover:shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Days Logged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {fetchPixelsByRange.data.length}
            </div>
            <p className='text-xs text-muted-foreground'>entries in range</p>
          </CardContent>
        </Card>

        <Card className='transition hover:shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Pixels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {fetchAllPixels.data.length}
            </div>
            <p className='text-xs text-muted-foreground'>entries overall</p>
          </CardContent>
        </Card>
      </div>

      <Card className='col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 max-w-[450px]'>
        <CardHeader>
          <CardTitle>Mood Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue='bar'
            className='col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 max-w-[450px]'
          >
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='bar'>Bar Chart</TabsTrigger>
              <TabsTrigger value='pie'>Pie Chart</TabsTrigger>
              <TabsTrigger value='radar'>Radar Chart</TabsTrigger>
            </TabsList>
            <TabsContent value='bar'>
              <BarChartComponent
                config={config}
                data={data}
                className='border-0'
              />
            </TabsContent>
            <TabsContent value='pie'>
              <PieChartComponent
                config={config}
                data={data}
                className='border-0'
              />
            </TabsContent>
            <TabsContent value='radar'>
              <RadarChartComponent
                config={config}
                data={data}
                className='border-0'
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
