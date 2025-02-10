"use server";
import db from "@/lib/db";
import { Pixel } from "@prisma/client";
import { getSessionUserId, handleServerError, normalizeDate } from "./actionUtils";

export const getUserPixels = async (): Promise<Pixel[]> => {
  try {
    const userId = await getSessionUserId(); // Stays as a string

    const pixels = await db.pixel.findMany({
      where: {
        userId, // No need to parse to Int, stays as string
        OR: [
          { moodId: { not: null } },
          { eventIds: { not: "" } } // Check for non-empty string instead of isEmpty
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
  try {
    const userId = await getSessionUserId(); // Stays as string

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
        userId, // No need to parse to Int, stays as string
        OR: [
          { moodId: { not: null } },
          { eventIds: { not: "" } } // Check for non-empty string instead of isEmpty
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
      `retrieving pixels by range .`
    );
    return [];
  }
};

export const upsertUserPixel = async (pixel: Pixel): Promise<Pixel | null> => {
  try {
    const userId = await getSessionUserId(); // Remains a String
    const normalizedDate = normalizeDate(pixel.pixelDate);

    //Stringify the event id array to store in DB.
    let eventIdsString = "";

    if (Array.isArray(pixel.eventIds)) {
      eventIdsString = pixel.eventIds.join(",");
    }
    else {
      eventIdsString = pixel.eventIds;
    }

    // If Pixel has an id, update. Otherwise create.
    if (pixel.id) {
      const updatedPixel = await db.pixel.update({
        where: {
          id: pixel.id, // String ID
        },
        data: {
          moodId: pixel.moodId,
          eventIds: eventIdsString
        },
        include: {
          mood: true,
          events: true
        },
      });
      return updatedPixel;
    } else {
      const createdPixel = await db.pixel.create({
        data: {
          userId: userId,
          pixelDate: normalizedDate,
          moodId: pixel.moodId,
          eventIds: eventIdsString,
        },
        include: {
          mood: true,
          events: true
        },
      });
      return createdPixel;
    }
  } catch (error) {
    handleServerError(error, "adding pixel for user.");
    return null;
  }
};