import { Mood, Pixel } from "@prisma/client";

export type PixelWithMood = Pixel & {
    mood: Mood; // This ensures that each pixel has a `mood` property
};
export type AddPixelDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPixels: React.Dispatch<React.SetStateAction<PixelWithMood[]>>; // Accept the state updater
    pixels: PixelWithMood[];
    date: Date
};
export type PixelComponentProps = {
    date: Date
};
