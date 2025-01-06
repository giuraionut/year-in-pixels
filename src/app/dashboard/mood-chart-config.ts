import { Pixel } from "@prisma/client";

export default function generateChartData(pixels: Pixel[]) {
  // Map pixels into moods with moodName, moodColor, and events
  const moods = pixels.map((pixel: Pixel) => ({
    moodName: pixel.mood.name.toLowerCase(),
    moodColor: pixel.mood.color.value,
    events: pixel.events.map((event: { name: string }) => event.name.toLowerCase()),
  }));

  // Reduce moods to consolidate data, merge events, and count event occurrences
  const data = moods.reduce((acc: any[], curr) => {
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
          (eventCounts: any, event: string) => ({
            ...eventCounts,
            [event]: 1,
          }),
          {}
        ),
      });
    }
    return acc;
  }, []);

  // Create config object with labels and colors
  const config = moods.reduce((acc: any, curr) => {
    if (!acc.quantity) {
      acc.quantity = { label: "Value" };
    }
    acc[curr.moodName] = {
      label: curr.moodName.charAt(0).toUpperCase() + curr.moodName.slice(1),
      fill: curr.moodColor,
    };

    return acc;
  }, {});

  return { config, data };
}
