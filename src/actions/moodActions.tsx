'use server';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { Mood } from '@prisma/client';
import { getServerSession } from 'next-auth';

export const getUserMoods = async (): Promise<Mood[] | null> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    throw new Error('User is not authenticated');
  }

  const userId = session.user.id;
  try {
    return await db.mood.findMany({
      where: { userId: userId },
    });
  } catch (error) {
    console.log('Error fetching moods', error);
    return null;
  }
};

export const addUserMood = async (mood: Mood): Promise<Mood | null> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    throw new Error('User is not authenticated');
  }

  const userId = session.user.id;
  mood.userId = userId;
  delete (mood as { id?: string }).id;
  try {
    return await db.mood.create({ data: mood });
  } catch (error) {
    console.log('Error creating mood', error);
    return null;
  }
};

//here you need to delete the pixels that use this mood first before you delete the mood
//check a way to notify the user that this mood is used in pixels when they try to delete it

export const editUserMood = async (mood: Mood): Promise<Mood | null> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    throw new Error('User is not authenticated');
  }

  const userId = session.user.id;
  mood.userId = userId;

  try {
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
    console.error('Error editing mood:', error);
    return null;
  }
};

export const deleteUserMood = async (
  mood: Mood
): Promise<{ deletedMood: Mood | null; error: string | null }> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    throw new Error('User is not authenticated');
  }

  const userId = session.user.id;
  mood.userId = userId;

  try {
    // Check if the mood is used by any Pixel
    const pixelCount = await db.pixel.count({
      where: {
        moodId: mood.id,
        userId: userId, // Ensure it's the correct user's mood
      },
    });

    if (pixelCount > 0) {
      // Delete associated pixels first
      await db.pixel.deleteMany({
        where: {
          moodId: mood.id,
          userId: userId,
        },
      });
    }

    // Proceed to delete the mood after deleting associated pixels
    const deletedMood = await db.mood.delete({
      where: {
        id: mood.id,
        userId: userId,
      },
    });

    return { deletedMood, error: null };
  } catch (error) {
    console.error('Error deleting mood and pixels:', error);
    return {
      deletedMood: null,
      error: 'An error occurred while deleting the mood and pixels.',
    };
  }
};

export const deleteUserMoodsBulk = async (
  moodIds: string[]
): Promise<{ deletedMoods: Mood[] | null; error: string | null }> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    throw new Error('User is not authenticated');
  }

  const userId = session.user.id;

  try {
    const deletedMoods: Mood[] = [];

    // Step 1: Iterate over each mood ID to check and delete associated pixels individually
    for (const moodId of moodIds) {
      // Count the pixels associated with the current mood
      const pixelCount = await db.pixel.count({
        where: {
          moodId: moodId,
          userId: userId,
        },
      });

      if (pixelCount > 0) {
        // Delete the associated pixels for this specific mood
        await db.pixel.deleteMany({
          where: {
            moodId: moodId,
            userId: userId,
          },
        });
      }

      // Step 2: Now delete the mood after deleting the associated pixels
      const deletedMood = await db.mood.delete({
        where: {
          id: moodId,
          userId: userId,
        },
      });

      // Add the deleted mood to the array
      deletedMoods.push(deletedMood);
    }

    // If at least one mood was deleted, return the deleted moods
    if (deletedMoods.length > 0) {
      return { deletedMoods, error: null };
    } else {
      return { deletedMoods: null, error: 'No moods were deleted.' };
    }
  } catch (error) {
    console.error('Error deleting moods and pixels:', error);
    return {
      deletedMoods: null,
      error: 'An error occurred while deleting the moods and pixels.',
    };
  }
};
