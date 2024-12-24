'use server';
import { Mood } from '@prisma/client';
import db from '@/lib/db';
import { getSessionUserId, handleServerError } from './actionUtils';

export const getUserMoods = async (): Promise<Mood[]> => {
  try {
    const userId = await getSessionUserId();
    return await db.mood.findMany({
      where: { userId },
    });
  } catch (error) {
    handleServerError(error, 'retrieving user moods.');
    return [];
  }
};

export const addUserMood = async (mood: Mood): Promise<Mood | null> => {
  try {
    const userId = await getSessionUserId();
    mood.userId = userId;
    delete (mood as { id?: string }).id;
    return await db.mood.create({ data: mood });
  } catch (error) {
    handleServerError(error, 'adding user mood.');
    return null;
  }
};

export const editUserMood = async (mood: Mood): Promise<Mood | null> => {
  try {
    const userId = await getSessionUserId();
    mood.userId = userId;
    const newUserMood = await db.mood.update({
      where: {
        id_userId: {
          id: mood.id,
          userId: userId,
        },
      },
      data: {
        name: mood.name,
        color: mood.color,
      },
    });
    return newUserMood;
  } catch (error) {
    handleServerError(error, 'editing user mood.');
    return null;
  }
};

export const deleteUserMood = async (
  mood: Mood
): Promise<Mood> => {
  try {
    const userId = await getSessionUserId();
    mood.userId = userId;

    const deletedMood = await db.mood.delete({
      where: {
        id: mood.id,
        userId,
      },
    });

    return deletedMood;
  } catch (error) {
    handleServerError(error, 'deleting user mood.');
    return null;
  }
};

export const deleteUserMoodsBulk = async (
  moodIds: string[]
): Promise<Mood[]> => {
  try {
    const userId = await getSessionUserId();

    const deletedMoods: Mood[] = [];

    const moodsToDelete = await db.mood.findMany({
      where: {
        id: {
          in: moodIds,
        },
        userId,
      },
    })

    await Promise.all(moodsToDelete.map(async (mood) => {
      const deletedMood = await db.mood.delete({
        where: {
          id: mood.id,
          userId,
        },
      });

      deletedMoods.push(deletedMood);
    }));

    return deletedMoods;
  } catch (error) {
    handleServerError(error, 'deleting moods.');
    return [];
  }
};
