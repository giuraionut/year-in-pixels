import { Prisma } from '@prisma/client';

export type PixelWithRelations = Prisma.PixelGetPayload<{
  include: {
    moods: {
      include: {
        mood: true;
      };
    };
    events: {
      include: {
        event: true;
      };
    };
  };
}>;
