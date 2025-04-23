"use server";
import db from "@/lib/db";
import { Diary } from "@prisma/client";
import { getSessionUserId, logServerError} from "./actionUtils";
import { JSONContent } from "@tiptap/react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { revalidateTag } from "next/cache";
import { addDays, getUnixTime, startOfDay } from "date-fns";

export const getUserDiaries = async (userId: string): Promise<ServerActionResponse<Diary[]>> => {
  'use cache'
  try {
    const diaries = await db.diary.findMany({
      where: {
        userId,
      },
    });
    cacheTag(`diaries-${userId}`);
    return { success: true, data: diaries };
  } catch (error: unknown) {
    logServerError(error as Error, 'fetching user diaries');
    return {
      success: false,
      error: 'Failed to fetch diaries. Please try again later.',
    };
  }
};

export const getUserDiaryByDate = async (date: Date, userId: string): Promise<ServerActionResponse<Diary | null>> => {
  'use cache'
  const startDate = startOfDay(date);

  const endDate = addDays(startDate, 1);
  try {
    const diary = await db.diary.findFirst({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    if (diary) {
      cacheTag(`diary-${userId}-${getUnixTime(diary.createdAt)}`);
    }

    return { success: true, data: diary };
  } catch (error: unknown) {
    logServerError(error as Error, 'fetching user diary');
    return {
      success: false,
      error: 'Failed to fetch diary. Please try again later.',
    };
  }
};

export const upsertUserDiary = async (diary: Omit<Diary, 'content'> & { content: JSONContent }): Promise<ServerActionResponse<Diary>> => {
  console.log('upsertUserDiary', diary)
  try {
    const fetchUserId = await getSessionUserId();
    if (!fetchUserId.success) {
      return { success: false, error: 'User not authenticated.' };
    }
    const userId = fetchUserId.data;

    const serializedContent = diary.content ? JSON.stringify(diary.content) : null;


    if (diary.id) {
      const updatedDiary = await db.diary.update({
        where: {
          id: diary.id,
        },
        data: {
          content: serializedContent,
        },
      });
      revalidateTag(`diary-${userId}-${getUnixTime(diary.createdAt)}`);
      return { success: true, data: updatedDiary };
    } else {
      const createdDiary = await db.diary.create({
        data: {
          userId,
          content: serializedContent,
        },
      });
      revalidateTag(`diary-${userId}-${getUnixTime(diary.createdAt)}`);
      return { success: true, data: createdDiary };
    }

  } catch (error: unknown) {
    logServerError(error as Error, 'upserting user diary');
    return {
      success: false,
      error: 'Failed to upsert diary. Please try again later.',
    };
  }
};