import { PixelWithMood } from "../pixels/Pixels.type";

export function moodChartUtil(pixels: PixelWithMood[]) {
    // Format the pixels to accumulate quantity and color for each mood
    const formattedPixels = pixels.reduce((acc: any, { mood }) => {
        const name = mood.name.toLowerCase();
        // Initialize the mood if it's not already in the accumulator
        if (!acc[name]) {
            acc[name] = { quantity: 0, color: mood.color };
        }
        acc[name].quantity += 1; // Increment the quantity for the existing mood
        return acc;
    }, {});

    // Create chart configuration based on the formatted pixels
    const config: { [key: string]: { label: string; color: string } } = {};

    for (const mood in formattedPixels) {
        const { color } = formattedPixels[mood];
        config[mood] = {
            label: mood.charAt(0).toUpperCase() + mood.slice(1), // Capitalize first letter
            color,
        };
    }

    const data = [
        {
            name: 'Moods', // Single entry for mood names
            ...Object.keys(formattedPixels).reduce((acc, mood) => {
                const { quantity } = formattedPixels[mood as keyof typeof formattedPixels]; // Cast mood to the correct type
                acc[mood] = quantity || 0; // Add quantity of each mood, defaulting to 0
                return acc;
            }, {} as Record<string, number>), // Explicitly type the accumulator
        },
    ];

    return { config, data };
}
