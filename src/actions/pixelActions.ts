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
                    { moods: { some: {} } }, // Check for any associated moods
                    { events: { some: {} } }, // Check for any associated events
                ],
            },
            include: {
                moods: {  //Include moods via the join table
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

        return pixels.map(pixel => ({
            ...pixel,
            mood: pixel.moods.length > 0 ? pixel.moods[0].mood : null, // Adapt mood data
        }));
    } catch (error: unknown) {
        handleServerError(error as Error, "retrieving pixels.");
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
                    { moods: { some: {} } }, // Check for any associated moods
                    { events: { some: {} } }, // Check for any associated events
                ],
            },
            include: {
                moods: {  //Include moods via the join table
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
        return pixels;

    } catch (error: unknown) {

        handleServerError(
            error as Error,
            `retrieving pixels by range .`
        );
        return [];
    }
};

export const upsertUserPixel = async (pixel: Pixel, eventIds: string[] = [], moodIds: string[] = []): Promise<Pixel | null> => {
    try {
        const userId = await getSessionUserId();
        const normalizedDate = normalizeDate(pixel.pixelDate);

        // Use Prisma's upsert function
        const upsertedPixel = await db.pixel.upsert({
            where: {
                userId_pixelDate: { // Compound unique index name.  Must match what's in the Prisma schema
                    userId: userId,
                    pixelDate: normalizedDate,
                },
            },
            update: {
                events: {
                    deleteMany: {}, // Disconnect all existing events
                    create: eventIds.map((eventId) => ({
                        event: {
                            connect: {
                                id: eventId,
                            },
                        },
                    })),
                },
                moods: {
                    deleteMany: {}, // Disconnect all existing moods
                    create: moodIds.map((moodId) => ({ // Connect mood
                        mood: {
                            connect: {
                                id: moodId,
                            },
                        },
                    })),
                },
            },
            create: { // Create a new record.
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
                    create: moodIds.map((moodId) => ({  //Connect mood
                        mood: {
                            connect: {
                                id: moodId,
                            },
                        },
                    })),
                },
            },
            include: {
                moods: { //Include mood via the join table
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

        const returnPixel = await db.pixel.findUnique({
            where: { id: upsertedPixel.id },
            include: {
                moods: { //Include mood via the join table
                    include: {
                        mood: true,
                    },
                },
                events: {
                    include: {
                        event: true,
                    },
                },
            }
        })

        return {
            ...returnPixel,
            mood: returnPixel && returnPixel.moods.length > 0 ? returnPixel.moods[0].mood : null, // Adapt mood data
        };

    } catch (error: unknown) {
        handleServerError(error as Error, "adding pixel for user.");
        return null;
    }
};