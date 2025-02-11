"use server";
import db from "@/lib/db";
import { Diary } from "@prisma/client";
import { getSessionUserId, handleServerError, normalizeDate } from "./actionUtils";
import { JSONContent } from "@tiptap/react";

export const getUserDiaries = async (): Promise<Diary[]> => {
  try {
    const userId = await getSessionUserId(); // Remains a String
    const diaries = await db.diary.findMany({
      where: {
        userId, // Stays as String
      },
    });

    return diaries;
  } catch (error) {
    handleServerError(error, "retrieving diaries.");
    return [];
  }
};

export const getUserDiaryByDate = async (date: Date): Promise<Diary | null> => {
  const normalizedDate = normalizeDate(date);
  try {
    const userId = await getSessionUserId(); // Remains a String
    const diary = await db.diary.findFirst({
      where: {
        userId, // Stays as String
        diaryDate: normalizedDate,
      },
    });

    return diary;
  } catch (error) {
    handleServerError(error, "retrieving diary by date.");
    return null;
  }
};

export const upsertUserDiary = async (diary: Omit<Diary, 'content'> & { content: JSONContent }): Promise<Diary | null> => {
  try {
    const userId = await getSessionUserId(); // Remains a String
    const normalizedDiaryDate = normalizeDate(diary.diaryDate);

    // Serialize content to string before storing
    const serializedContent = diary.content ? JSON.stringify(diary.content) : null;


    if (diary.id) {
      const updatedDiary = await db.diary.update({
        where: {
          id: diary.id, // String ID
        },
        data: {
          content: serializedContent, // Store as string
        },
      });
      return updatedDiary;
    } else {

      const createdDiary = await db.diary.create({
        data: {
          userId,
          content: serializedContent, // Store as string
          diaryDate: normalizedDiaryDate
        },
      });
      return createdDiary;
    }
  } catch (error) {
    handleServerError(error, "upserting diary for user.");
    return null;
  }
};