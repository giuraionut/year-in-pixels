'use server'
import { Mood } from '@prisma/client';
import db from '@/lib/db';
import { getSessionUserId, logServerError } from './actionUtils';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { revalidateTag } from 'next/cache';

export const getUserMoods = async (userId: string): Promise<ServerActionResponse<Mood[]>> => {
  'use cache'
  try {
    const moods = await db.mood.findMany({
      where: { userId },
    });

    const deserializedMoods = moods.map(mood => {
      try {
        if (mood.color) {
          const parsedColor = typeof mood.color === 'string' ? JSON.parse(mood.color) : mood.color;
          return {
            ...mood,
            color: parsedColor,
          };
        }
        return mood;
      } catch (error) {
        console.error("Error parsing color for mood:", mood.id, error);
        return mood;
      }
    });

    cacheTag(`moods-${userId}`);
    return { success: true, data: deserializedMoods };
  } catch (error: unknown) {
    logServerError(error as Error, 'retrieving user events from db');
    return {
      success: false,
      error: 'Failed to retrieve events. Please try again later.',
    };
  }
};


type MoodCreateInput = Omit<Mood, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export const addUserMood = async (moodData: MoodCreateInput): Promise<ServerActionResponse<Mood>> => {
  const fetchUserId = await getSessionUserId();
  if (!fetchUserId.success) {
    return { success: false, error: 'User not authenticated.' };
  }
  const userId = fetchUserId.data;

  try {
    const newMood = await db.mood.create({
      data: {
        userId,
        name: moodData.name,
        color: moodData.color,
      },
    });

    const deserializedMood: Mood = {
      ...newMood,
      color: typeof newMood.color === 'string' ? JSON.parse(newMood.color) : newMood.color,
    }
    revalidateTag(`moods-${userId}`, 'max');
    return { success: true, data: deserializedMood };

  } catch (error: unknown) {
    logServerError(error as Error, 'adding user event to db');
    return {
      success: false,
      error: 'Failed to add event. Please try again later.',
    };
  }
};

type MoodUpdateInput = Partial<Pick<Mood, 'name'>> & {
  id: string;
};


export const editUserMood = async (moodData: MoodUpdateInput): Promise<ServerActionResponse<Mood>> => {
  const fetchUserId = await getSessionUserId();
  if (!fetchUserId.success) {
    return { success: false, error: 'User not authenticated.' };
  }
  const userId = fetchUserId.data;
  try {
    const { id, ...dataToUpdate } = moodData;
    if (Object.keys(dataToUpdate).length === 0) {
      return { success: false, error: 'No fields provided for update.' };
    }
    const newUserMood = await db.mood.update({
      where: {
        id: id, userId: userId
      },
      data: dataToUpdate
    });
    revalidateTag(`moods-${userId}`, 'max');
    return { success: true, data: newUserMood };

  } catch (error: unknown) {
    logServerError(error as Error, 'editing user event in db');
    return {
      success: false,
      error: 'Failed to update event. Please ensure it exists and try again.',
    };
  }
};

export const deleteUserMood = async (
  moodId: string
): Promise<ServerActionResponse<{ id: string }>> => {
  const fetchUserId = await getSessionUserId();
  if (!fetchUserId.success) {
    return { success: false, error: 'User not authenticated.' };
  }
  const userId = fetchUserId.data;
  try {
    const deletedMood = await db.mood.delete({
      where: {
        id: moodId, userId: userId
      },
    });
    revalidateTag(`moods-${userId}`, 'max');
    return { success: true, data: { id: deletedMood.id } };

  } catch (error: unknown) {
    logServerError(error as Error, 'deleting user event from db');
    return {
      success: false,
      error: 'Failed to delete event. Please ensure it exists and try again.',
    };
  }
};

export const deleteUserMoodsBulk = async (
  moodIds: string[]
): Promise<ServerActionResponse<{ count: number }>> => {
  const fetchUserId = await getSessionUserId();
  if (!fetchUserId.success) {
    return { success: false, error: 'User not authenticated.' };
  }
  const userId = fetchUserId.data;

  try {
    const result = await db.mood.deleteMany({
      where: {
        id: { in: moodIds },
        userId,
      },
    });

    revalidateTag(`moods-${userId}`, 'max');

    return { success: true, data: { count: result.count } };

  } catch (error: unknown) {
    logServerError(error as Error, 'deleting user moods bulk');
    return {
      success: false,
      error: 'Failed to delete moods. Please try again later.',
    };
  }
};