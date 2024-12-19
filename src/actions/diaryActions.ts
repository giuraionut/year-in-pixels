"use server";
import db from "@/lib/db";
import { Diary, Pixel } from "@prisma/client";
import { getSessionUserId, handleServerError, normalizeDate } from "./actionUtils";

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

export const getUserDiaryByDate = async (date: Date): Promise<Diary | null> => {
    const normalizedDate = normalizeDate(date);
    console.log(normalizedDate)
    try {
        const userId = await getSessionUserId();
        const diary = await db.diary.findFirst({
            where: {
                userId,
                diaryDate: normalizedDate,
            },
        });

        return diary;
    } catch (error) {
        handleServerError(error, "retrieving diary");
        return null;
    }
};


export const addUserDiary = async (diary: Diary): Promise<Diary | null> => {
    const normalizedDiaryDate = normalizeDate(diary.diaryDate)
    diary.diaryDate = normalizedDiaryDate;
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


// export const updateUserDiary = async (diary: Diary): Promise<Diary | null> => {
//     const normalizedDiaryDate = normalizeDate(diary.diaryDate)
//     diary.diaryDate = normalizedDiaryDate;
//     try {
//         const userId = await getSessionUserId();

//         const existingDiary = await db.diary.findUnique({
//             where: {
//                 id_userId_diaryDate: {
//                     id: diary.id,
//                     userId: userId,
//                     diaryDate: diary.diaryDate
//                 },
//             },
//         });

//         if (existingDiary) {
//             return await db.diary.update({
//                 where: {
//                     id_userId_diaryDate: {
//                         id: diary.id,
//                         userId: userId,
//                         diaryDate: diary.diaryDate
//                     },
//                 },
//                 data: {
//                     content: diary.content,
//                 },
//             });
//         }

//         return null;
//     } catch (error) {
//         handleServerError(error, "updating diary for user");
//         return null;
//     }
// };

export const upsertUserDiary = async (diary: Diary): Promise<Diary | null> => {

    try {
        const userId = await getSessionUserId();
        const normalizedDiaryDate = normalizeDate(diary.diaryDate)
        diary.diaryDate = normalizedDiaryDate;
        diary.userId = userId;
        if (!diary.id) {
            // If no ID exists, explicitly create a new diary
            return await db.diary.create({
                data: {
                    userId,
                    content: diary.content ?? {},
                    diaryDate: normalizedDiaryDate
                },
            });
        }

        // If ID exists, use upsert to update or create
        return await db.diary.upsert({
            where: {
                id_userId_diaryDate: {
                    id: diary.id,
                    userId: userId,
                    diaryDate: normalizedDiaryDate
                },
            },
            update: {
                content: diary.content ?? {},
            },
            create: {
                id: diary.id,
                userId,
                content: diary.content ?? {},
                diaryDate: normalizedDiaryDate
            },
        });
    } catch (error) {
        handleServerError(error, "upserting diary for user");
        return null;
    }
};

