
'use server'

import { upsertUserDiary } from '@/actions/diaryActions'
import { Diary } from '@prisma/client'
import { JSONContent } from '@tiptap/react';

/**
 * A Server Action you can import directly in your client bundle.
 * Takes only serializable args (strings + JSON).
 */
export async function saveDiary(diary: Diary | null, content: JSONContent, date:Date) {

    const currentDiary = diary || {
        id: '', // Provide a default or generate an ID
        userId: '', // Provide a default or fetch the user ID
        createdAt: date,
        content,
        updatedAt: new Date(),
    };

    const updatedDiary = {
        ...currentDiary,
        content,
    };

    return await upsertUserDiary(updatedDiary);

}