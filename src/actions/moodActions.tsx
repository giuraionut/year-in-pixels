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
//better create a method that can edit a mood so the pixels aren't lost
//check a way to notify the user that this mood is used in pixels when they try to delete it
export const deleteUserMood = async (mood: Mood): Promise<Mood | null> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    throw new Error('User is not authenticated');
  }

  const userId = session.user.id;
  mood.userId = userId;

  try {
    const deletedMood = await db.mood.delete({
      where: {
        id: mood.id,
        userId: userId, // is this line redundant here?
      },
    });
    return deletedMood;
  } catch (error) {
    console.error('Error deleting mood:', error);
    return null;
  }
};

export const deleteUserMoodsBulk = async (moodIds: string[]) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    throw new Error('User is not authenticated');
  }
  const userId = session.user.id;

  try {
    await db.mood.deleteMany({
      where: {
        id: { in: moodIds },
        userId: userId,
      },
    });
    return true;
  } catch (error) {
    console.error('Error deleting moods:', error);
    return false;
  }
};
