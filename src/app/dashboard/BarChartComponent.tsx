"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconChartBar } from "@tabler/icons-react";
interface DataItem {
  moodName: string;
  quantity: number;
}

export default function BarChartComponent({
  className,
  data,
  config,
}: {
  className?: string;
  data: DataItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: ChartConfig;
}) {
  const [barChartVertical, setBarChartVertical] = useState<boolean>(false);

  function handleBarChartVertical() {
    setBarChartVertical(!barChartVertical);
  }

  // Capitalize moodName in data

  const processedData = data.map((item: DataItem) => ({
    ...item,
    moodName: item.moodName.charAt(0).toUpperCase() + item.moodName.slice(1),
  }));

  // Capitalize keys and labels in config
  /**
   * Capitalize keys and labels in config
   *
   * @param {Record<string, { label: string }>} config
   * @returns {Record<string, { label: string }>}
   */
  const processedConfig: Record<string, { label: string }> = Object.keys(
    config,
  ).reduce(
    (acc, key): Record<string, { label: string }> => {
      const configItem = config[key];
      if (configItem && typeof configItem.label === "string") {
        // Ensure label is a string
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        acc[capitalizedKey] = {
          ...configItem,
          label:
            configItem.label.charAt(0).toUpperCase() +
            configItem.label.slice(1),
        };
      }
      return acc;
    },
    {} as Record<string, { label: string }>,
  );

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-6">
          Moods Chart
          <Button
            onClick={handleBarChartVertical}
            className="w-4 h-8"
            variant={"outline"}
          >
            {barChartVertical ? (
              <IconChartBar style={{ transform: "rotate(90deg)" }} />
            ) : (
              <IconChartBar />
            )}
          </Button>
        </CardTitle>
        <CardDescription>Based on date range</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={processedConfig}>
          <BarChart
            accessibilityLayer
            data={processedData}
            layout={barChartVertical ? "vertical" : "horizontal"}
            margin={{ left: 12, right: 12 }} // Added some margin for labels
          >
            {/* Axis Logic */}
            {barChartVertical ? (
              <>
                <XAxis type="number" dataKey="quantity" hide />
                <YAxis
                  dataKey="moodName"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    processedConfig[value]?.label || value
                  }
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="moodName"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    processedConfig[value]?.label || value
                  }
                />
                <YAxis type="number" hide />
              </>
            )}

            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <Bar
              dataKey="quantity"
              name="Days"
              radius={5}
              // IMPORTANT: This allows individual bars to take colors from the data
              fill="var(--color-primary)"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
