import { Pixel } from "@prisma/client";


export type AddPixelDialogProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPixels: React.Dispatch<React.SetStateAction<Pixel[]>>; // Accept the state updater
    pixels: Pixel[];
    date: Date
};
export type PixelComponentProps = {
    date: Date
};
