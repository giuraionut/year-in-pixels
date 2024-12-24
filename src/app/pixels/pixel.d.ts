import { Pixel } from "@prisma/client";


export type AddPixelDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPixels: React.Dispatch<React.SetStateAction<Pixel[]>>;
    pixels: Pixel[];
    date: Date
};
export type PixelsCalendarComponentProps = {
    date: Date
};
