// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Prisma } from '@prisma/client';

type Color = {
    name: string;
    value: string;
};

declare module '@prisma/client' {
    type Mood = Mood & {
        color: Color; // Override JsonValue with your Color type
    }
    type Pixel = Pixel & {
        mood: Mood;
    }
}