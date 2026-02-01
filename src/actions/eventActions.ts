'use server';

import { Event } from '@prisma/client';
import db from '@/lib/db';
import { getSessionUserId, logServerError } from './actionUtils';
import { revalidateTag } from 'next/cache';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';

export const getUserEvents = async (userId: string): Promise<ServerActionResponse<Event[]>> => {
    'use cache'

    try {
        const events = await db.event.findMany({
            where: { userId },
            include: {
                pixels: {
                    include: {
                        pixel: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        cacheTag(`events-${userId}`);
        return { success: true, data: events };

    } catch (error: unknown) {
        logServerError(error as Error, 'retrieving user events from db');
        return {
            success: false,
            error: 'Failed to retrieve events. Please try again later.',
        };
    }
};

type EventCreateInput = Omit<Event, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export const addUserEvent = async (
    eventData: EventCreateInput
): Promise<ServerActionResponse<Event>> => {
    const fetchUserId = await getSessionUserId();
    if (!fetchUserId.success) {
        return { success: false, error: 'User not authenticated.' };
    }
    const userId = fetchUserId.data;
    try {

        const newEvent = await db.event.create({
            data: {
                ...eventData,
                userId,
            },
        });

        revalidateTag(`events-${userId}`, 'max');
        return { success: true, data: newEvent };

    } catch (error: unknown) {
        logServerError(error as Error, 'adding user event to db');
        return {
            success: false,
            error: 'Failed to add event. Please try again later.',
        };
    }
};
type EventUpdateInput = Partial<Pick<Event, 'name'>> & {
    id: string;
};


export const editUserEvent = async (
    eventData: EventUpdateInput
): Promise<ServerActionResponse<Event>> => {
    const fetchUserId = await getSessionUserId();
    if (!fetchUserId.success) {
        return { success: false, error: 'User not authenticated.' };
    }
    const userId = fetchUserId.data;

    try {
        const { id, ...dataToUpdate } = eventData;

        if (Object.keys(dataToUpdate).length === 0) {
            return { success: false, error: 'No fields provided for update.' };
        }

        const updatedEvent = await db.event.update({
            where: { id: id, userId: userId },
            data: dataToUpdate,
        });

        revalidateTag(`events-${userId}`, 'max');

        return { success: true, data: updatedEvent };

    } catch (error: unknown) {
        logServerError(error as Error, 'editing user event in db');
        return {
            success: false,
            error: 'Failed to update event. Please ensure it exists and try again.',
        };
    }
};

export const deleteUserEvent = async (
    eventId: string
): Promise<ServerActionResponse<{ id: string }>> => {
    const fetchUserId = await getSessionUserId();
    if (!fetchUserId.success) {
        return { success: false, error: 'User not authenticated.' };
    }
    const userId = fetchUserId.data;

    try {
        const deletedEvent = await db.event.delete({
            where: { id: eventId, userId: userId },
        });

        revalidateTag(`events-${userId}`, 'max');
        return { success: true, data: { id: deletedEvent.id } };

    } catch (error: unknown) {
        logServerError(error as Error, 'deleting user event from db');
        return {
            success: false,
            error: 'Failed to delete event. Please ensure it exists and try again.',
        };
    }
};

export const deleteUserEventsBulk = async (
    eventIds: string[]
): Promise<ServerActionResponse<{ count: number }>> => {
    const fetchUserId = await getSessionUserId();
    if (!fetchUserId.success) {
        return { success: false, error: 'User not authenticated.' };
    }
    const userId = fetchUserId.data;
    try {
        const result = await db.event.deleteMany({
            where: {
                id: { in: eventIds },
                userId,
            },
        });

        revalidateTag(`events-${userId}`, 'max');
        revalidateTag('events', 'max');

        return { success: true, data: { count: result.count } };

    } catch (error: unknown) {
        logServerError(error as Error, 'deleting user events bulk');
        return {
            success: false,
            error: 'Failed to delete events. Please try again later.',
        };
    }
};