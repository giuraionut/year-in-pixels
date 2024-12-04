import { Mood, Pixel } from "@prisma/client";

export type PixelWithMood = Pixel & {
    mood: Mood; // This ensures that each pixel has a `mood` property
};
export type AddPixelDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    day: {
        dayIndex: number;
        weekdayIndex: number;
        currentDay: boolean;
    };
    month: { index: number; name: string };
    year: number;
    setPixels: React.Dispatch<React.SetStateAction<PixelWithMood[]>>; // Accept the state updater
    pixels: PixelWithMood[];
};
export type DaysProps = {
    selectedMonth: { index: number; name: string };
    selectedYear: number;
};
