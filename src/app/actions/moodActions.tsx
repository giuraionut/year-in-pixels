'use server';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { Mood } from '@prisma/client';
import { getServerSession } from 'next-auth';

export const getUserMoods = async (): Promise<Mood[]> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    return [];
  }
  const userId = session.user.id;

  return await db.mood.findMany({
    where: { userId: userId },
  });
};

export const addUserMood = async (mood: Mood): Promise<Mood> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    return mood;
  }

  const userId = session.user.id;
  mood.userId = userId;
  delete (mood as { id?: string }).id;
  return await db.mood.create({ data: mood });
};

export const deleteUserMood = async (mood: Mood): Promise<Mood | null> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    return null;
  }

  const userId = session.user.id;
  mood.userId = userId;

  try {
    // Delete the mood and return the deleted mood object
    const deletedMood = await db.mood.delete({
      where: {
        id: mood.id,  // Make sure the mood has an id
      },
    });

    return deletedMood; // Return the deleted mood object
  } catch (error) {
    console.error('Error deleting mood:', error);
    return null;
  }
};

export const deleteUserMoodsBulk = async (moodIds: string[]) => {
  try {
    // Using Prisma's deleteMany method
    await db.mood.deleteMany({
      where: {
        id: { in: moodIds }, // Use 'in' without the '$'
      },
    });
    return true;
  } catch (error) {
    console.error('Error deleting moods:', error);
    return false;
  }
};