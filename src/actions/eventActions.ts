'use server';

import { Event, Pixel } from '@prisma/client';
import db from '@/lib/db';
import { getSessionUserId, handleServerError, normalizeDate } from './actionUtils';

//--------------- EVENTS ---------------
export const getUserEvents = async (): Promise<Event[]> => {
    try {
        const userId = await getSessionUserId();

        return await db.event.findMany({
            where: { userId },
            include: {
                pixels: {
                    include: {
                        pixel: true,
                    },
                },
            },
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
        delete (event as any).id;
        const newEvent = await db.event.create({
            data: event
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

        const updatedEvent = await db.event.update({
            where: { id: event.id },
            data: { name: event.name },
        });

        return updatedEvent;
    } catch (error) {
        handleServerError(error, 'editing user event.');
        return null;
    }
};


export const deleteUserEvent = async (eventId: string): Promise<Event | null> => {
    try {
        const userId = await getSessionUserId();

        const deletedEvent = await db.event.delete({
            where: { id: eventId },
        });

        return deletedEvent;
    } catch (error) {
        handleServerError(error, 'deleting user event.');
        return null;
    }
};


export const deleteUserEventsBulk = async (eventIds: string[]): Promise<Event[]> => {
    try {
        const userId = await getSessionUserId();

        // Delete the selected events
        await db.event.deleteMany({
            where: {
                id: { in: eventIds },
                userId,
            },
        });

        return [];
    } catch (error) {
        handleServerError(error, 'bulk deleting events.');
        return [];
    }
};