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
