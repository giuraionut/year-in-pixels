'use client';

import { RectangleHorizontal, RectangleVertical } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
}) {
  const [barChartVertical, setBarChartVertical] = useState<boolean>(false);

  function handleBarChartVertical() {
    setBarChartVertical(!barChartVertical);
  }
  return (
    <Card className={cn('p-4', className)}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between gap-6'>
          Moods Chart
          <Button onClick={handleBarChartVertical} className='w-4 h-8'>
            {barChartVertical ? (
              <RectangleVertical strokeWidth={3} />
            ) : (
              <RectangleHorizontal strokeWidth={3} />
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey='quantity'
              layout={barChartVertical ? 'vertical' : 'horizontal'}
              radius={5}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className='flex-col items-start gap-2 text-sm'>
      
      </CardFooter> */}
    </Card>
  );
}
