import { Pixel } from "@prisma/client";

export default function generateChartData(pixels: Pixel[]) {
  // Map pixels into moods with moodName, moodColor, and events
  const moods = pixels.map((pixel: Pixel) => ({
    moodName: pixel.mood.name.toLowerCase(),
    moodColor: JSON.parse(pixel.mood.color).value,
    events: pixel.events.map((event: { name: string }) => event.name.toLowerCase()),
  }));

  // Reduce moods to consolidate data, merge events, and count event occurrences
  interface MoodData {
    moodName: string;
    quantity: number;
    fill: string;
    events: Record<string, number>;
  }

  /**
   * Consolidates mood data by aggregating occurrences and event counts.
   * 
   * @param moods Array of mood objects containing moodName, moodColor, and events.
   * @returns Array of aggregated mood data with moodName, quantity, fill, and events.
   */
  const data: MoodData[] = moods.reduce((acc: MoodData[], curr): MoodData[] => {
    const existingMood = acc.find((mood) => mood.moodName === curr.moodName);

    if (existingMood) {
      existingMood.quantity += 1;
      curr.events.forEach((event: string) => {
        existingMood.events[event] = (existingMood.events[event] || 0) + 1;
      });
    } else {
      acc.push({
        moodName: curr.moodName,
        quantity: 1,
        fill: curr.moodColor,
        events: curr.events.reduce(
          (eventCounts: Record<string, number>, event: string) => ({
            ...eventCounts,
            [event]: 1,
          }),
          {} as Record<string, number>
        ),
      });
    }
    return acc;
  }, []);

  // Create config object with labels and colors
  const config = moods.reduce((acc: { [key: string]: { label: string; fill: string } }, curr) => {
    if (!acc.quantity) {
      acc.quantity = { label: "Value", fill: "" };
    }
    acc[curr.moodName] = {
      label: curr.moodName.charAt(0).toUpperCase() + curr.moodName.slice(1),
      fill: curr.moodColor,
    };

    return acc;
  }, {});

  return { config, data };
}
