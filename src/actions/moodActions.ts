'use server'
import { Mood } from '@prisma/client';
import db from '@/lib/db';
import { getSessionUserId, handleServerError } from './actionUtils';

export const getUserMoods = async (): Promise<Mood[]> => {
  try {
    const userId = await getSessionUserId();
    const moods = await db.mood.findMany({
      where: { userId },
    });

    // Deserialize the color for each mood
    const deserializedMoods = moods.map(mood => {
      try {
        if (mood.color) {
          const parsedColor = typeof mood.color === 'string' ? JSON.parse(mood.color) : mood.color;
          return {
            ...mood,
            color: parsedColor,
          };
        }
        return mood; // If color is null or undefined, return the mood as is
      } catch (error) {
        console.error("Error parsing color for mood:", mood.id, error);
        return mood; // Return the mood as is, even if parsing fails
      }
    });

    return deserializedMoods;
  } catch (error: unknown) {
    handleServerError(error as Error, 'retrieving user mood.');
    return [];
  }
};

export const addUserMood = async (mood: Mood): Promise<Mood | null> => {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      console.error("addUserMood: Could not retrieve userId");
      return null; // Or throw an error
    }
    if (!mood) {
      console.error("addUserMood: Mood object is null or undefined");
      return null; // Or throw an error
    }

    const newMood = await db.mood.create({
      data: {
        userId,
        name: mood.name,
        color: mood.color,
      },
    });
    return newMood;
  } catch (error: unknown) {
    handleServerError(error as Error, 'adding user mood.');
    return null;
  }
};

export const editUserMood = async (mood: Mood): Promise<Mood | null> => {
  try {
    const newUserMood = await db.mood.update({
      where: {
        id: mood.id,
      },
      data: {
        color: typeof mood.color === 'string' ? mood.color : JSON.stringify(mood.color), // Ensure color is a string
        name: mood.name
      },
    });
    return newUserMood;
  } catch (error: unknown) {
    handleServerError(error as Error, 'editing user mood.');
    return null;
  }
};

export const deleteUserMood = async (
  mood: Mood
): Promise<Mood | null> => {
  try {

    const deletedMood = await db.mood.delete({
      where: {
        id: mood.id,
      },
    });

    return deletedMood;
  } catch (error: unknown) {
    handleServerError(error as Error, 'deleting user mood.');
    return null;
  }
};

export const deleteUserMoodsBulk = async (
  moodIds: string[]
): Promise<Mood[]> => {
  try {
    const userId = await getSessionUserId();

    const moodsToDelete = await db.mood.findMany({
      where: {
        id: { in: moodIds },
        userId,
      },
    });

    if (moodsToDelete.length === 0) {
      return [];
    }

    // Delete the selected events
    await db.mood.deleteMany({
      where: {
        id: { in: moodIds },
      },
    });

    return moodsToDelete;
  } catch (error: unknown) {
    handleServerError(error as Error, 'deleting user moods.');
    return [];
  }
};