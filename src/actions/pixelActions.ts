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
          { eventIds: { isEmpty: false } }
        ]
      },
      include: {
        mood: true,
        events: true
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
  const userId = await getSessionUserId();
  const fromDate = new Date(
    Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  );
  const toDate = to
    ? new Date(
      Date.UTC(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
    )
    : fromDate;

  try {
    const pixels = await db.pixel.findMany({
      where: {
        pixelDate: {
          gte: fromDate,
          lte: toDate,
        },
        userId,
        OR: [
          { moodId: { not: null } },
          { eventIds: { isEmpty: false } }
        ]
      },
      include: {
        mood: true,
        events: true
      },
    });

    return pixels;
  } catch (error) {
    handleServerError(
      error,
      `retrieving pixels by range ${fromDate} - ${toDate}.`
    );
    return [];
  }
};

export const upsertUserPixel = async (pixel: Pixel): Promise<Pixel | null> => {
  try {
    const userId = await getSessionUserId();
    pixel.userId = userId;
    delete (pixel as { id?: string }).id;
    const normalizedDate = normalizeDate(pixel.pixelDate);
    pixel.pixelDate = normalizedDate;
    return await db.pixel.upsert({
      where: {
        userId_pixelDate: {
          userId,
          pixelDate: pixel.pixelDate,
        },
      },
      create: {
        ...pixel,
        userId,
      },
      update: {
        ...pixel,
        userId,
      },
      include: {
        mood: true,
        events: true
      },
    });
  } catch (error) {
    handleServerError(error, "adding pixel for user.");
    return null;
  }
};
