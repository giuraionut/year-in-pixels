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
  const [selectedEvent, setSelectedEvent] =
    React.useState<string>(initialEvent);

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
    return Object.keys(data?.[0]?.events || {});
  }, [data]);

  const chartConfig = React.useMemo(
    () => ({
      quantity: { label: 'Days', color: 'hsl(225 75% 50%)' },
      selectedEventCount: {
        label: selectedEvent
          ? selectedEvent.charAt(0).toUpperCase() + selectedEvent.slice(1)
          : 'Event',
        color: 'hsl(200 75% 50%)',
      },
      ...config,
    }),
    [config, selectedEvent]
  );

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className='items-center'>
        <div className='flex items-center justify-between'>
          <CardTitle>Mood & Event Radar</CardTitle>

          {eventKeys.length > 0 && (
            <Select
              value={selectedEvent}
              onValueChange={(value) => setSelectedEvent(value || initialEvent)}
            >
              <SelectTrigger className='w-[180px] h-8'>
                <SelectValue placeholder='Select an Event' />
              </SelectTrigger>
              <SelectContent>
                {eventKeys.map((event: string) => (
                  <SelectItem key={event} value={event}>
                    {event.charAt(0).toUpperCase() + event.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className='flex-1'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px]'
        >
          <RadarChart
            data={processedData}
            margin={{ top: 5, right: 5, bottom: 0, left: 5 }}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dot' />}
            />
            <PolarAngleAxis
              dataKey='moodName'
              tick={{ className: 'text-xs fill-muted-foreground', dy: 4 }}
              // tickLine={false} // Optionally hide tick lines
              // axisLine={false} // Optionally hide the axis line
            />
            <PolarGrid
              gridType='circle'
              className='stroke-border stroke-opacity-50 stroke-dasharray-3_3'
            />
            <Radar
              name={chartConfig.quantity.label}
              dataKey='quantity'
              fill={chartConfig.quantity.color}
              stroke={chartConfig.quantity.color}
              fillOpacity={0.5}
              strokeWidth={2}
              dot={{ r: 3, fillOpacity: 0.8 }}
            />
            {selectedEvent &&
              processedData.some((d) => d.selectedEventCount > 0) && (
                <Radar
                  name={chartConfig.selectedEventCount.label}
                  dataKey='selectedEventCount'
                  fill={chartConfig.selectedEventCount.color}
                  stroke={chartConfig.selectedEventCount.color}
                  fillOpacity={0.4}
                  strokeWidth={2}
                  dot={{ r: 3, fillOpacity: 0.8 }}
                />
              )}
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
