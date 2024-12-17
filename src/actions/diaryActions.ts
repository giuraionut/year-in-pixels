"use server";
import db from "@/lib/db";
import { Diary, Pixel } from "@prisma/client";
import { getSessionUserId, handleServerError } from "./actionUtils";

export const getUserDiaries = async (): Promise<Pixel[]> => {
    try {
        const userId = await getSessionUserId();
        const diaries = await db.diary.findMany({
            where: {
                userId,
            },
        });

        return diaries;
    } catch (error) {
        handleServerError(error, "retrieving diaries");
        return [];
    }
};


export const addUserDiary = async (diary: Diary): Promise<Diary | null> => {
    try {
        const userId = await getSessionUserId();
        diary.userId = userId;

        // Sanitize the content
        diary.content = JSON.parse(JSON.stringify(diary.content));

        delete (diary as { id?: string }).id;
        console.dir(diary, { depth: null });

        return await db.diary.create({
            data: diary,
        });
    } catch (error) {
        handleServerError(error, "adding diary for user");
        return null;
    }
};


export const updateUserDiary = async (diary: Diary): Promise<Diary | null> => {
    try {
        const userId = await getSessionUserId();

        const existingDiary = await db.diary.findUnique({
            where: {
                id_userId: {
                    id: diary.id,
                    userId: userId,
                },
            },
        });

        if (existingDiary) {
            return await db.diary.update({
                where: {
                    id_userId: {
                        id: diary.id,
                        userId: userId,
                    },
                },
                data: {
                    content: diary.content,
                },
            });
        }

        return null;
    } catch (error) {
        handleServerError(error, "updating diary for user");
        return null;
    }
};

export const upsertUserDiary = async (diary: Partial<Diary>): Promise<Diary | null> => {
    try {
        const userId = await getSessionUserId();
        console.log('diary', diary);
        if (!diary.id) {
            // If no ID exists, explicitly create a new diary
            return await db.diary.create({
                data: {
                    userId,
                    content: diary.content ?? {},
                    createdAt: new Date(),
                },
            });
        }

        // If ID exists, use upsert to update or create
        return await db.diary.upsert({
            where: {
                id_userId: {
                    id: diary.id,
                    userId,
                },
            },
            update: {
                content: diary.content ?? {},
            },
            create: {
                id: diary.id,
                userId,
                content: diary.content ?? {},
                createdAt: new Date(),
            },
        });
    } catch (error) {
        handleServerError(error, "upserting diary for user");
        return null;
    }
};

