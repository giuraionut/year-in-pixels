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
        event.userId = userId;
        delete (event as { id?: string }).id;

        return await db.event.create({ data: event });
    } catch (error) {
        handleServerError(error, 'adding user event.');
        return null;
    }
};

export const editUserEvent = async (event: Event): Promise<Event | null> => {
    try {
        const userId = await getSessionUserId();
        event.userId = userId;
        const newUserEvent = await db.event.update({
            where: {
                id_userId: {
                    id: event.id,
                    userId: userId,
                },
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

export const deleteUserEvent = async (
    event: Event
): Promise<Event | null> => {
    try {
        const userId = await getSessionUserId();
        event.userId = userId;

        const deletedEvent = await db.event.delete({
            where: {
                id: event.id,
                userId,
            },
        });

        const pixels = await db.pixel.findMany({
            where: {
                eventIds: {
                    has: deletedEvent.id,
                },
            },

        });
        await Promise.all(pixels.map(async (pixel) => {
            await db.pixel.update({
                where: {
                    id: pixel.id,
                },
                data: {
                    eventIds: {
                        set: pixel.eventIds.filter((id) => id !== deletedEvent.id),
                    },
                },
            });
        }));
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
        const deletedEvents: Event[] = [];

        const eventsToDelete = await db.event.findMany({
            where: {
                id: { in: eventIds },
                userId,
            },
        });

        if (eventsToDelete.length === 0) {
            return deletedEvents;
        }

        await Promise.all(
            eventsToDelete.map(async (event) => {
                const deletedEvent = await db.event.delete({
                    where: {
                        id: event.id,
                    },
                });
                deletedEvents.push(deletedEvent);
            })
        );

        const pixels = await db.pixel.findMany({
            where: {
                eventIds: {
                    hasSome: eventIds,
                },
            },
        });

        await Promise.all(
            pixels.map(async (pixel) => {
                await db.pixel.update({
                    where: {
                        id: pixel.id,
                    },
                    data: {
                        eventIds: {
                            set: pixel.eventIds.filter((id) => !eventIds.includes(id)),
                        },
                    },
                });
            })
        );

        return deletedEvents;
    } catch (error) {
        handleServerError(error, 'bulk deleting events.');
        return [];
    }
};
