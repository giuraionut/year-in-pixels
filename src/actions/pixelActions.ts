"use server";
import db from "@/lib/db";
import { Pixel } from "@prisma/client";
import { getSessionUserId, handleServerError, normalizeDate } from "./actionUtils";

export const getUserPixels = async (): Promise<Pixel[]> => {
  try {
    const userId = await getSessionUserId();

    const pixels = await db.pixel.findMany({
      where: {
        userId,
        OR: [
          { moodId: { not: null } },
          { events: { some: {} } } // Check if there are any associated events
        ]
      },
      include: {
        mood: true,
        events: {
          include: {
            event: true,
          },
        },
      },
    });

    return pixels;
  } catch (error) {
    handleServerError(error, "retrieving pixels.");
    return [];
  }
};


export const getUserPixelsByRange = async (
  from: Date,
  to?: Date
): Promise<Pixel[]> => {
  try {
    const userId = await getSessionUserId();

    const fromDate = new Date(
      Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
    );
    const toDate = to
      ? new Date(
        Date.UTC(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
      )
      : fromDate;

    const pixels = await db.pixel.findMany({
      where: {
        pixelDate: {
          gte: fromDate,
          lte: toDate,
        },
        userId,
        OR: [
          { moodId: { not: null } },
          { events: { some: {} } } // Check if there are any associated events
        ]
      },
      include: {
        mood: true,
        events: {
          include: {
            event: true,
          },
        },
      },
    });

    return pixels;
  } catch (error) {
    handleServerError(
      error,
      `retrieving pixels by range .`
    );
    return [];
  }
};

export const upsertUserPixel = async (pixel: Pixel, eventIds: string[] = []): Promise<Pixel | null> => {
  try {
    const userId = await getSessionUserId();
    const normalizedDate = normalizeDate(pixel.pixelDate);


    const pixelData = {
      pixelDate: normalizedDate,
      moodId: pixel.moodId,
      userId: userId,
      events: {
        create: eventIds.map((eventId) => ({
          event: {
            connect: {
              id: eventId,
            },
          },
        })),
      },
    };

    // If Pixel has an id, update. Otherwise create.
    if (pixel.id) {

      // Disconnect all existing events and reconnect with the new ones
      const updatedPixel = await db.pixel.update({
        where: {
          id: pixel.id,
        },
        data: {
          moodId: pixel.moodId,
          events: {
            deleteMany: {},  // Disconnect all existing events
            create: eventIds.map((eventId) => ({
              event: {
                connect: {
                  id: eventId,
                },
              },
            })),
          },
        },
        include: {
          mood: true,
          events: {
            include: {
              event: true,
            },
          },
        },
      });
      return updatedPixel;

    } else {
      const createdPixel = await db.pixel.create({
        data: pixelData,
        include: {
          mood: true,
          events: {
            include: {
              event: true,
            },
          },
        },
      });
      return createdPixel;
    }
  } catch (error) {
    handleServerError(error, "adding pixel for user.");
    return null;
  }
};