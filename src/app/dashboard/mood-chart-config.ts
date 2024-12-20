import { Pixel } from "@prisma/client";

export default function generateChartData(pixels: Pixel[]) {
    const moods = pixels.map((pixel: Pixel) => ({
        moodName: pixel.mood.name.toLowerCase(),
        moodColor: pixel.mood.color.value
    })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = moods.reduce((acc: any[], curr) => {
        const existingMood = acc.find((mood) => mood.moodName === curr.moodName);

        if (existingMood) {
            existingMood.quantity += 1;
        } else {
            acc.push({
                moodName: curr.moodName,
                quantity: 1,
                fill: curr.moodColor,
            });
        }
        return acc;
    }, []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = moods.reduce((acc: any, curr) => {
        if (!acc.quantity) {
            acc.quantity = { label: 'Value' };
        }
        acc[curr.moodName.toLowerCase()] = {
            label: curr.moodName.toLowerCase(),
            fill: curr.moodColor,
        };

        return acc;
    }, {});

    return { config, data };
}