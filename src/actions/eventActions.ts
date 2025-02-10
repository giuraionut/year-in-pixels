'use server';
import { Event } from '@prisma/client';
import db from '@/lib/db';
import { getSessionUserId, handleServerError } from './actionUtils';

export const getUserEvents = async (): Promise<Event[]> => {
    try {
        const userId = await getSessionUserId();

        return await db.event.findMany({
            where: { userId },
        });
    } catch (error) {
        handleServerError(error, 'retrieving user events.');
        return [];
    }
};

export const addUserEvent = async (event: Event): Promise<Event | null> => {
    try {
        const userId = await getSessionUserId();

        const newEvent = await db.event.create({
            data: {
                userId,
                name: event.name,
                pixelIds: "", // Initialize pixelIds as an empty string when creating a new event
            },
        });

        return newEvent;
    } catch (error) {
        handleServerError(error, 'adding user event.');
        return null;
    }
};

export const editUserEvent = async (event: Event): Promise<Event | null> => {
    try {
        const userId = await getSessionUserId();

        const newUserEvent = await db.event.update({
            where: {
                id: event.id,
            },
            data: {
                name: event.name,
            },
        });
        return newUserEvent;
    } catch (error) {
        handleServerError(error, 'editing user event.');
        return null;
    }
};

//Helper function
const parseIntegerList = (str: string | null): number[] => {
    if (!str) {
        return [];
    }
    return str.split(',').map(Number).filter(Number.isInteger);
};

export const deleteUserEvent = async (
    event: Event
): Promise<Event | null> => {
    try {
        const userId = await getSessionUserId();

        const deletedEvent = await db.event.delete({
            where: {
                id: event.id,
            },
        });

        // Update pixels to remove the event ID
        const pixelsToUpdate = await db.pixel.findMany({
            where: {
                NOT: {
                    eventIds: ""
                }
            },
        });

        for (const pixel of pixelsToUpdate) {
            let eventIds = parseIntegerList(pixel.eventIds);
            const updatedEventIds = eventIds.filter((id) => id.toString() !== deletedEvent.id);

            await db.pixel.update({
                where: {
                    id: pixel.id,
                },
                data: {
                    eventIds: updatedEventIds.join(',')
                },
            });
        }

        return deletedEvent;
    } catch (error) {
        handleServerError(error, 'deleting user event.');
        return null;
    }
};

export const deleteUserEventsBulk = async (
    eventIds: string[]
): Promise<Event[]> => {
    try {
        const userId = await getSessionUserId();
        const eventsToDelete = await db.event.findMany({
            where: {
                id: { in: eventIds },
                userId,
            },
        });

        if (eventsToDelete.length === 0) {
            return [];
        }

        // Delete the selected events
        await db.event.deleteMany({
            where: {
                id: { in: eventIds },
            },
        });

        // Clear the eventIds strings from the pixel table
        const pixelsToUpdate = await db.pixel.findMany({
            where: {
                NOT: {
                    eventIds: ""
                }
            },
        });

        for (const pixel of pixelsToUpdate) {
            let eventIdsParsed = parseIntegerList(pixel.eventIds);
            const updatedEventIds = eventIdsParsed.filter((id) => !eventIds.includes(id.toString()));

            await db.pixel.update({
                where: {
                    id: pixel.id,
                },
                data: {
                    eventIds: updatedEventIds.join(',')
                },
            });
        }

        return eventsToDelete;
    } catch (error) {
        handleServerError(error, 'bulk deleting events.');
        return [];
    }
};