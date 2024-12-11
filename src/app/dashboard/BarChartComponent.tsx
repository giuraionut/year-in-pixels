'use client';

import {
  RectangleHorizontal,
  RectangleVertical,
  TrendingUp,
} from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function BarChartComponent({
  className,
  data,
  config,
}: {
  className?: string;
  data: any;
  config: any;
}) {
  const [barChartVertical, setBarChartVertical] = useState<boolean>(false);

  function handleBarChartVertical() {
    setBarChartVertical(!barChartVertical);
  }
  return (
    <Card className={cn('p-4', className)}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          Moods Chart
          <Button onClick={handleBarChartVertical} className='w-4 h-8'>
            {barChartVertical ? (
              <RectangleVertical></RectangleVertical>
            ) : (
              <RectangleHorizontal></RectangleHorizontal>
            )}
          </Button>
        </CardTitle>
        <CardDescription>Based on date range</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart
            accessibilityLayer
            data={data}
            layout={barChartVertical ? 'vertical' : 'horizontal'}
            margin={{
              left: 0,
            }}
          >
            {barChartVertical ? (
              <YAxis
                dataKey='moodName'
                type='category'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  config[value as keyof typeof config]?.label
                }
              />
            ) : (
              <XAxis
                dataKey='moodName'
                type='category'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  config[value as keyof typeof config]?.label
                }
              />
            )}

            <XAxis dataKey='quantity' type='number' hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey='quantity'
              layout={barChartVertical ? 'vertical' : 'horizontal'}
              radius={5}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className='flex-col items-start gap-2 text-sm'>
        <div className='flex gap-2 font-medium leading-none'>
          Trending up by 5.2% this month <TrendingUp className='h-4 w-4' />
        </div>
        <div className='leading-none text-muted-foreground'>
          Showing total quantity for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  );
}
