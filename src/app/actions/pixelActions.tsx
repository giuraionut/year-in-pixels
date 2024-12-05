'use server';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { Pixel } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { PixelWithMood } from '../pixels/Pixels.type';

export const getUserPixelsForMonth = async (
  year: number,
  month: number
): Promise<PixelWithMood[]> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    throw new Error('User is not authenticated');
  }

  const userId = session.user.id;
  const pixels = await db.pixel.findMany({
    where: {
      year,
      month,
      userId,
    },
    include: {
      mood: true,
    },
  });
  return pixels as PixelWithMood[];
};

export const addUserPixel = async (pixel: Pixel): Promise<PixelWithMood> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    throw new Error('User is not authenticated');
  }

  const userId = session.user.id;
  pixel.userId = userId;
  delete (pixel as { id?: string }).id;

  return await db.pixel.create({
    data: {
      ...pixel,
      userId,
    },
    include: {
      mood: true,
    },
  });
};

export const deleteUserPixel = async (pixel: Pixel): Promise<Pixel | null> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    throw new Error('User is not authenticated');
  }
  try {
    return await db.pixel.delete({
      where: { id: pixel.id, userId: pixel.userId },
    });
  } catch (error) {
    console.log('Error deleting pixel', error);
    return null;
  }
};
