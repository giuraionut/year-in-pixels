"use server";
import db from "@/lib/db";
import { Diary } from "@prisma/client";
import { getSessionUserId, logServerError } from "./actionUtils";
import { JSONContent } from "@tiptap/react";
import { revalidateTag } from "next/cache";
import { format } from "date-fns";
import { getZonedDayRange } from "@/lib/date";

import { cacheTag } from "next/dist/server/use-cache/cache-tag";

const DIARIES_CACHE_TAG = "diaries";
const getDiaryTag = (userId: string, dayTag: string) => `diary-${userId}-${dayTag}`;

export const getUserDiaries = async (userId: string): Promise<ServerActionResponse<Diary[]>> => {
  'use cache'
  try {
    const diaries = await db.diary.findMany({
      where: {
        userId,
      },
    });

    // Apply the cache tag correctly
    const cacheKey = DIARIES_CACHE_TAG;
    cacheTag(cacheKey);
    return { success: true, data: diaries };
  } catch (error: unknown) {
    logServerError(error as Error, 'fetching user diaries');
    return {
      success: false,
      error: 'Failed to fetch diaries. Please try again later.',
    };
  }
};

export const getUserDiaryByDate = async (
  date: Date,
  userId: string
): Promise<ServerActionResponse<Diary | null>> => {
  'use cache'
  const { start, end } = getZonedDayRange(new Date(date));
  const dayTag = format(start, "yyyy-MM-dd");

  try {
    const diary = await db.diary.findFirst({
      where: {
        userId,
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    });

    // Apply more specific cache tag
    const cacheKey = getDiaryTag(userId, dayTag);
    cacheTag(cacheKey);
    return { success: true, data: diary };
  } catch (error: unknown) {
    logServerError(error as Error, "fetching user diary");
    return {
      success: false,
      error: "Failed to fetch diary. Please try again later.",
    };
  }
};

export const upsertUserDiary = async (
  diary: Omit<Diary, "content"> & { content: JSONContent }
): Promise<ServerActionResponse<Diary>> => {
  try {
    const session = await getSessionUserId();
    if (!session.success) {
      return { success: false, error: "User not authenticated." };
    }
    const userId = session.data;

    const data = {
      userId,
      content: diary.content ? JSON.stringify(diary.content) : null,
      createdAt: diary.createdAt,
    };

    let record;
    if (diary.id) {
      record = await db.diary.update({
        where: { id: diary.id },
        data,
      });
    } else {
      record = await db.diary.create({
        data,
      });
    }

    const { start } = getZonedDayRange(record.createdAt);
    const dayTag = format(start, "yyyy-MM-dd");

    await revalidateTag(DIARIES_CACHE_TAG);
    await revalidateTag(getDiaryTag(userId, dayTag));

    return { success: true, data: record };
  } catch (error: unknown) {
    logServerError(error as Error, "upserting user diary");
    return {
      success: false,
      error: "Failed to upsert diary. Please try again later.",
    };
  }
};