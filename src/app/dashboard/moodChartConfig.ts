import { Pixel } from "@prisma/client";

export default function generateChartData(pixels: Pixel[]) {
    const moods = pixels.map((pixel: Pixel) => ({
        moodName: pixel.mood.name.toLowerCase(),
        moodColor: pixel.mood.color.value
    })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = moods.reduce((acc: any[], curr) => {
        // Check if the mood already exists in the accumulator
        const existingMood = acc.find((mood) => mood.moodName === curr.moodName);

        if (existingMood) {
            // If the mood exists, increment the quantity
            existingMood.quantity += 1;
        } else {
            // If the mood doesn't exist, create a new object for it
            acc.push({
                moodName: curr.moodName,
                quantity: 1, // Start the count at 1
                fill: curr.moodColor, // Add the fill
            });
        }
        return acc;
    }, []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = moods.reduce((acc: any, curr) => {
        // Add the 'moods' field as a label
        if (!acc.quantity) {
            acc.quantity = { label: 'Moods' };
        }

        // Add each mood as a separate entry in the object
        acc[curr.moodName.toLowerCase()] = {
            label: curr.moodName.toLowerCase(),
            fill: curr.moodColor,
        };

        return acc;
    }, {});

    return { config, data };
}