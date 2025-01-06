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

export default function BarChartComponent({
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

  // Capitalize moodName in data
  const processedData = data.map((item: any) => ({
    ...item,
    moodName: item.moodName.charAt(0).toUpperCase() + item.moodName.slice(1),
  }));

  // Capitalize keys and labels in config
  const processedConfig = Object.keys(config).reduce((acc, key) => {
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
    acc[capitalizedKey] = {
      ...config[key],
      label:
        config[key].label.charAt(0).toUpperCase() + config[key].label.slice(1),
    };
    return acc;
  }, {} as any);

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between gap-6'>
          Moods Chart
          <Button
            onClick={handleBarChartVertical}
            className='w-4 h-8'
            variant={'outline'}
          >
            {barChartVertical ? <RectangleVertical /> : <RectangleHorizontal />}
          </Button>
        </CardTitle>
        <CardDescription>Based on date range</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={processedConfig}>
          <BarChart
            accessibilityLayer
            data={processedData}
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
                tickMargin={5}
                axisLine={false}
                tickFormatter={(value) =>
                  processedConfig[value]?.label || value
                } // Use the capitalized config label
              />
            ) : (
              <XAxis
                dataKey='moodName'
                type='category'
                tickLine={false}
                tickMargin={5}
                axisLine={false}
                tickFormatter={(value) =>
                  processedConfig[value]?.label || value
                } // Use the capitalized config label
              />
            )}

            <XAxis dataKey='quantity' type='number' hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              name='Days'
              dataKey='quantity'
              layout={barChartVertical ? 'vertical' : 'horizontal'}
              radius={5}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
