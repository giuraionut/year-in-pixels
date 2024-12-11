'use server';
import { PixelWithMood } from '@/app/pixels/Pixels.type';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { Pixel } from '@prisma/client';
import { getServerSession } from 'next-auth';

export const getUserPixels = async (): Promise<PixelWithMood[]> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    throw new Error('User is not authenticated');
  }
  const userId = session.user.id;
  const pixels = await db.pixel.findMany({
    where: {
      userId,
    },
    include: {
      mood: true,
    },
  });

  return pixels as PixelWithMood[];
};
export const getUserPixelsByRange = async (
  from: Date,
  to?: Date
): Promise<PixelWithMood[]> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error('User is not authenticated or missing user ID');
    throw new Error('User is not authenticated');
  }
  const userId = session.user.id;

  const fromDate = new Date(
    Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  );
  const toDate = to
    ? new Date(
        Date.UTC(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
      )
    : fromDate;

  const pixels = await db.pixel.findMany({
    where: {
      pixelDate: {
        gte: fromDate,
        lte: toDate,
      },
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

  return await db.pixel.upsert({
    where: {
      userId_moodId_pixelDate: {
        userId,
        moodId: pixel.moodId,
        pixelDate: pixel.pixelDate,
      },
    },
    create: {
      ...pixel,
      userId,
    },
    update: {
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
