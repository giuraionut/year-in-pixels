'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function BarChartComponent({
  className,
  config,
  data,
}: {
  className: string;
  config: any;
  data: any;
}) {
  const bars = Object.keys(config).map((key) => {
    return <Bar key={key} dataKey={key} fill={config[key].color} radius={4} />;
  });

  return (
    <Card className={cn('p-4', className)}>
      <ChartContainer config={config} className='min-h-[200px] w-full'>
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey='name'
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {bars}
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
