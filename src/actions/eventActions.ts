'use server';

import { Event } from '@prisma/client';
import db from '@/lib/db';
import { getSessionUserId, handleServerError } from './actionUtils';

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
    } catch (error: unknown) {
        handleServerError(error as Error, 'retrieving user events.');
        return [];
    }
};

export const addUserEvent = async (event: Event): Promise<Event | null> => {
    try {
        const userId = await getSessionUserId();
        event.userId = userId;
        delete (event as { id?: string }).id;
        const newEvent = await db.event.create({
            data: event
        });

        return newEvent;
    } catch (error: unknown) {
        handleServerError(error as Error, 'adding user events.');
        return null;
    }
};


export const editUserEvent = async (event: Event): Promise<Event | null> => {
    try {

        const updatedEvent = await db.event.update({
            where: { id: event.id },
            data: { name: event.name },
        });

        return updatedEvent;
    } catch (error: unknown) {
        handleServerError(error as Error, 'editing user events.');
        return null;
    }
};


export const deleteUserEvent = async (eventId: string): Promise<Event | null> => {
    try {
        const userId = await getSessionUserId();
        console.log("getSessionUserId returned:", userId);
        console.log("Attempting to delete event with ID:", eventId, "and userId:", userId);

        const deletedEvent = await db.event.delete({
            where: { id: eventId, userId: userId },
        });

        return deletedEvent;
    } catch (error: unknown) {
        handleServerError(error as Error, 'deleting user event.');
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
    } catch (error: unknown) {
        handleServerError(error as Error, 'deleting user events.');
        return [];
    }
};