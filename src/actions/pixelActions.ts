"use server";
import db from "@/lib/db";
import { Pixel } from "@prisma/client";
import { PixelWithRelations } from "@/types/pixel";
import { getSessionUserId, logServerError, normalizeDate } from "./actionUtils";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { revalidateTag } from "next/cache";

export const getUserPixels = async (
  userId: string,
): Promise<ServerActionResponse<PixelWithRelations[]>> => {
  "use cache";
  console.log("Fetching pixels for user:", userId);
  try {
    const pixels = await db.pixel.findMany({
      where: {
        userId,
        OR: [
          { moods: { some: {} } }, // Check for any associated moods
          { events: { some: {} } }, // Check for any associated events
        ],
      },
      include: {
        moods: {
          //Include moods via the join table
          include: {
            mood: true,
          },
        },
        events: {
          include: {
            event: true,
          },
        },
      },
    });
    cacheTag(`p`);
    cacheTag(`pixels-${userId}`);
    return { success: true, data: pixels };
    // return pixels.map(pixel => ({
    //     ...pixel,
    //     mood: pixel.moods.length > 0 ? pixel.moods[0].mood : null, // Adapt mood data
    // }));
  } catch (error: unknown) {
    logServerError(error as Error, "editing user event in db");
    return {
      success: false,
      error: "Failed to fetch user pixels. Please try again later.",
    };
  }
};

export const getUserPixelsByRange = async (
  from: Date,
  to?: Date,
  userId?: string,
): Promise<ServerActionResponse<PixelWithRelations[]>> => {
  "use cache";
  try {
    const fromDate = new Date(
      Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()),
    );
    const toDate = to
      ? new Date(
          Date.UTC(
            to.getFullYear(),
            to.getMonth(),
            to.getDate(),
            23,
            59,
            59,
            999,
          ),
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
          { moods: { some: {} } }, // Check for any associated moods
          { events: { some: {} } }, // Check for any associated events
        ],
      },
      include: {
        moods: {
          //Include moods via the join table
          include: {
            mood: true,
          },
        },
        events: {
          include: {
            event: true,
          },
        },
      },
    });
    cacheTag(`p`);

    return { success: true, data: pixels };
  } catch (error: unknown) {
    logServerError(error as Error, "editing pixel event in db");
    return {
      success: false,
      error: `Failed to fetch user pixels by range ${from} to ${to}. Please try again later.`,
    };
  }
};

export const upsertUserPixel = async (
  pixel: Pixel,
  eventIds: string[] = [],
  moodIds: string[] = [],
): Promise<ServerActionResponse<PixelWithRelations>> => {
  const fetchUserId = await getSessionUserId();
  if (!fetchUserId.success) {
    return { success: false, error: "User not authenticated." };
  }
  const userId = fetchUserId.data;

  let normalizedDate: Date;
  try {
    normalizedDate = normalizeDate(pixel.pixelDate);
  } catch (error) {
    logServerError(error as Error, "normalizing date for pixel");
    return { success: false, error: "Failed to normalize date." };
  }
  try {
    const upsertedPixel = await db.pixel.upsert({
      where: {
        userId_pixelDate: {
          userId: userId,
          pixelDate: normalizedDate,
        },
      },
      update: {
        events: {
          deleteMany: {},
          create: eventIds.map((eventId) => ({
            event: {
              connect: {
                id: eventId,
              },
            },
          })),
        },
        moods: {
          deleteMany: {},
          create: moodIds.map((moodId) => ({
            mood: {
              connect: {
                id: moodId,
              },
            },
          })),
        },
      },
      create: {
        pixelDate: normalizedDate,
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
        moods: {
          create: moodIds.map((moodId) => ({
            //Connect mood
            mood: {
              connect: {
                id: moodId,
              },
            },
          })),
        },
      },
      include: {
        moods: {
          //Include mood via the join table
          include: {
            mood: true,
          },
        },
        events: {
          include: {
            event: true,
          },
        },
      },
    });

    revalidateTag(`pixels-${userId}`, "max");
    revalidateTag(`pixel-${userId}-${normalizedDate}`, "max");
    revalidateTag(`pixels-${userId}-${pixel.pixelDate}`, "max");
    revalidateTag(`p`, "max");
    return { success: true, data: upsertedPixel };
    // return {
    //     ...returnPixel,
    //     mood: returnPixel && returnPixel.moods.length > 0 ? returnPixel.moods[0].mood : null, // Adapt mood data
    // };
  } catch (error: unknown) {
    logServerError(error as Error, "adding pixel in db");
    return {
      success: false,
      error: "Failed to add pixel. Please try again later.",
    };
  }
};

export const getUserPixelsByYear = async (
  year: number,
  userId: string,
): Promise<ServerActionResponse<PixelWithRelations[]>> => {
  "use cache";
  try {
    const pixels = await db.pixel.findMany({
      where: {
        userId,
        pixelDate: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31, 23, 59, 59, 999),
        },
      },
      include: {
        moods: {
          //Include mood via the join table
          include: {
            mood: true,
          },
        },
        events: {
          include: {
            event: true,
          },
        },
      },
    });
    cacheTag(`p`);

    cacheTag(`pixels-${userId}-${year}`);
    return { success: true, data: pixels };
  } catch (error: unknown) {
    logServerError(error as Error, "fetching user pixels by year");
    return {
      success: false,
      error: `Failed to fetch pixels by year ${year}. Please try again later.`,
    };
  }
};
