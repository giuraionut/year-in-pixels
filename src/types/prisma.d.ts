// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Prisma, Event } from '@prisma/client';
import { Color } from '@/app/moods/mood';


declare module '@prisma/client' {


  type Mood = Mood & {
    color: Color;
  }
  type Pixel = Pixel & {
    moods: Mood[];
    events: Event[]
  }
  type MoodToPixel = MoodToPixel & {
    mood: Mood
  }
}

