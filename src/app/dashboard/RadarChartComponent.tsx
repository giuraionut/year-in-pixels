'use client';

import * as React from 'react';
import { Radar, RadarChart, PolarAngleAxis, PolarGrid } from 'recharts';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EventData {
  [key: string]: number;
}

interface DataItem {
  moodName: string;
  quantity: number;
  events: EventData;
}

export default function RadarChartComponent({
  className,
  data,
  config,
}: {
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: DataItem[];
  config: ChartConfig;
}) {
  const [selectedEvent, setSelectedEvent] = React.useState<string>(
    Object.keys(data[0]?.events || {})[0] || ''
  );

  const processedData = data.map((item: DataItem) => ({
    ...item,
    moodName: item.moodName.charAt(0).toUpperCase() + item.moodName.slice(1),
    selectedEventCount: item.events[selectedEvent] || 0,
  }));

  return (
    <Card className={cn('', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Radar Chart</CardTitle>
        <CardDescription>
          Mood quantities and event distribution
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <Select
          value={selectedEvent}
          onValueChange={(value) => setSelectedEvent(value)}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Select an Event' />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(data[0]?.events || {}).map((event: string) => (
              <SelectItem key={event} value={event}>
                {event.charAt(0).toUpperCase() + event.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ChartContainer config={config}>
          <RadarChart outerRadius={90} data={processedData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis
              dataKey='moodName'
              tick={{ fill: 'var(--foreground)', fontSize: 12 }}
            />
            <PolarGrid />
            <Radar
              name='Days'
              dataKey='quantity'
              fillOpacity={0.5}
              strokeOpacity={0.4}
              strokeWidth={2}
              stroke='hsl(225 75% 50%)'
              fill='hsl(225 75% 50%)'
              dot={{
                r: 2.5,
                fillOpacity: 0.5,
              }}
            />
            <Radar
              name={
                selectedEvent.charAt(0).toUpperCase() + selectedEvent.slice(1)
              }
              dataKey='selectedEventCount'
              fillOpacity={0.4}
              strokeOpacity={0.6}
              strokeWidth={2}
              stroke='hsl(200 75% 50%)'
              fill='hsl(200 75% 50%)'
              dot={{
                r: 3,
                fillOpacity: 0.6,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
