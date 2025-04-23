'use client';

import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
interface DataItem {
  quantity: number;
  moodName: string;
}

export default function PieChartComponent({
  className,
  data,
  config,
}: {
  className?: string;
  data: DataItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: ChartConfig;
}) {
  const totalMoods = React.useMemo(() => {
    return data.reduce(
      (acc: number, curr: { quantity: number }) => acc + curr.quantity,
      0
    );
  }, [data]);

  const processedData = data.map((item: DataItem) => ({
    ...item,
    moodName: item.moodName.charAt(0).toUpperCase() + item.moodName.slice(1),
  }));
  return (
    <Card className={cn('p-4 flex flex-col', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Pie Chart</CardTitle>
        <CardDescription>Based on date range</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={config}
          className='mx-auto aspect-square max-h-[250px]'
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Pie
              data={processedData}
              dataKey='quantity'
              nameKey='moodName'
              innerRadius={50}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalMoods}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
