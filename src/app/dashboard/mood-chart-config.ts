import { Event, PixelToEvent, MoodToPixel } from "@prisma/client";
import { PixelWithRelations } from "@/types/pixel";

export default function generateChartData(pixels: PixelWithRelations[]) {
    // Map pixels into moods with moodName, moodColor, and events
    const moods = pixels.flatMap(pixel => // Use flatMap to handle multiple moods per pixel
        pixel.moods.map((moodToPixel) => {
            const colorObject = typeof moodToPixel.mood.color === 'string' ? JSON.parse(moodToPixel.mood.color) : moodToPixel.mood.color; // Parse and safely access color value

            return {
                moodName: moodToPixel.mood.name.toLowerCase(),
                moodColor: colorObject.value, //String, the user wants a String.
                events: pixel.events.map((pixelToEvent: PixelToEvent & { event: Event }) => pixelToEvent.event.name.toLowerCase()),
            }
        })
    );

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
    const config = data.reduce((acc: { [key: string]: { label: string; fill: string } }, curr) => { // Correct the reduce target
        if (!acc.quantity) {
            acc.quantity = { label: "Value", fill: "" };
        }
        acc[curr.moodName] = {
            label: curr.moodName.charAt(0).toUpperCase() + curr.moodName.slice(1),
            fill: curr.fill,
        };

        return acc;
    }, {});

    return { config, data };
}