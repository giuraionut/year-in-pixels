// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Prisma } from '@prisma/client';
import { Color } from '@/app/moods/mood';


declare module '@prisma/client' {


    type Mood = Mood & {
        color: Color; // Override JsonValue with your Color type
    }
    type Pixel = Pixel & {
        mood: Mood;
        events: Event[]
    }
}