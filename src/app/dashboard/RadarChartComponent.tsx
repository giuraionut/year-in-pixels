'use client';

import * as React from 'react';
import { Radar, RadarChart, PolarAngleAxis, PolarGrid } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface RadarChartComponentProps {
  className?: string;
  data: DataItem[];
  config: ChartConfig;
}

export default function RadarChartComponent({
  className,
  data,
  config,
}: RadarChartComponentProps) {
  const initialEvent = Object.keys(data?.[0]?.events || {})[0] || '';
  const [selectedEvent, setSelectedEvent] = React.useState<string>(initialEvent);

  const processedData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item: DataItem) => ({
      ...item,
      moodName: item.moodName
        ? item.moodName.charAt(0).toUpperCase() + item.moodName.slice(1)
        : 'Unknown',
      selectedEventCount: item.events?.[selectedEvent] || 0,
    }));
  }, [data, selectedEvent]);

  const eventKeys = React.useMemo(() => {
    // Collect all unique event keys from all data points, not just the first one
    const keys = new Set<string>();
    data?.forEach(item => {
      Object.keys(item.events || {}).forEach(k => keys.add(k));
    });
    return Array.from(keys);
  }, [data]);

  const chartConfig = React.useMemo(
    () => ({
      quantity: { label: 'Days', color: 'var(--chart-1)' },
      selectedEventCount: {
        label: selectedEvent
          ? selectedEvent.charAt(0).toUpperCase() + selectedEvent.slice(1)
          : 'Event',
        color: 'var(--chart-2)',
      },
      ...config,
    }),
    [config, selectedEvent]
  );

  return (
    <Card className={cn('flex flex-col h-full bg-card text-card-foreground', className)}>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between gap-4'>
          <CardTitle className="text-lg font-semibold">Mood & Event Radar</CardTitle>
          {eventKeys.length > 0 && (
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className='w-[140px] h-8 text-xs'>
                <SelectValue placeholder='Event' />
              </SelectTrigger>
              <SelectContent>
                {eventKeys.map((event) => (
                  <SelectItem key={event} value={event}>
                    {event.charAt(0).toUpperCase() + event.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className='flex-1 pb-4'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[300px] w-full'
        >
          <RadarChart data={processedData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='line' />}
            />
            <PolarGrid className="stroke-muted/50" />
            <PolarAngleAxis
              dataKey='moodName'
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <Radar
              name={chartConfig.quantity.label}
              dataKey='quantity'
              fill="var(--color-quantity)"
              fillOpacity={0.5}
              stroke="var(--color-quantity)"
              strokeWidth={2}
            />
            <Radar
              name={chartConfig.selectedEventCount.label}
              dataKey='selectedEventCount'
              fill="var(--color-selectedEventCount)"
              fillOpacity={0.5}
              stroke="var(--color-selectedEventCount)"
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}